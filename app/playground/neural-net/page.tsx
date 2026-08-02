"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { NeuralNetCanvas } from "@/components/canvas/NeuralNetCanvas";
import { LossChart } from "@/components/charts/LossChart";
import { RetroButton } from "@/components/ui/RetroButton";
import { RetroSlider } from "@/components/ui/RetroSlider";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { NPCDialogueBox } from "@/components/story/NPCDialogueBox";
import { useStoryMode } from "@/lib/story/useStoryMode";
import { neuralNetWalkthrough } from "@/lib/story/walkthroughs/neuralNet";
import { NNDataPoint, LayerWeightInfo, NetworkArchitecture } from "@/modules/neural-net/types";
import type { TFType, TFModel } from "@/lib/ml/neural-net";

const GRID_RES = 40;
const DEFAULT_ARCH: NetworkArchitecture = { hiddenSize: 4, numHiddenLayers: 1 };

const PRESET_POINTS: NNDataPoint[] = [
  // XOR-like pattern — not linearly separable, so it shows off hidden layers
  { id: "p1", x: -0.6, y: -0.6, label: 1 },
  { id: "p2", x: -0.5, y: -0.7, label: 1 },
  { id: "p3", x:  0.6, y:  0.6, label: 1 },
  { id: "p4", x:  0.7, y:  0.5, label: 1 },
  { id: "p5", x: -0.6, y:  0.6, label: 0 },
  { id: "p6", x: -0.5, y:  0.7, label: 0 },
  { id: "p7", x:  0.6, y: -0.6, label: 0 },
  { id: "p8", x:  0.7, y: -0.5, label: 0 },
];

type AppMode = "select" | "story" | "sandbox";

export default function NeuralNetPlayground() {
  const [appMode, setAppMode] = useState<AppMode>("select");

  const [points, setPoints] = useState<NNDataPoint[]>([]);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [stepCount, setStepCount] = useState(0);
  const [learningRate, setLearningRate] = useState(0.1);
  const [architecture, setArchitecture] = useState<NetworkArchitecture>(DEFAULT_ARCH);
  const [isTraining, setIsTraining] = useState(false);
  const [predGrid, setPredGrid] = useState<Float32Array | null>(null);
  const [layerWeights, setLayerWeights] = useState<LayerWeightInfo[]>([]);
  const [tfReady, setTfReady] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Loading TF.js...");

  // Refs for mutable TF objects — never stored in React state to avoid serialisation
  const tfRef = useRef<TFType | null>(null);
  const modelRef = useRef<TFModel | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTrainingRef = useRef(false);

  // Story mode controller
  const story = useStoryMode();

  // Keep isTrainingRef in sync
  useEffect(() => { isTrainingRef.current = isTraining; }, [isTraining]);

  // ── Load TF.js dynamically (client only) ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tf = await import("@tensorflow/tfjs");
        if (cancelled) return;
        tfRef.current = tf;
        setTfReady(true);
        setStatusMsg("Ready. Add points & train.");
      } catch (e) {
        setStatusMsg("TF.js failed to load: " + String(e));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Build / rebuild model ─────────────────────────────────────────────────
  const buildNewModel = useCallback(() => {
    const tf = tfRef.current;
    if (!tf) return;
    // Dispose old model
    if (modelRef.current) {
      modelRef.current.dispose();
      modelRef.current = null;
    }
    // Import synchronously — already loaded at this point
    const { buildModel } = require("@/lib/ml/neural-net");
    const m = buildModel(tf, architecture, learningRate);
    modelRef.current = m;
    setLayerWeights([]);
    setPredGrid(null);
    setLossHistory([]);
    setStepCount(0);
    setIsTraining(false);
  }, [architecture, learningRate]);

  // Build initial model when TF is ready
  useEffect(() => {
    if (tfReady) buildNewModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tfReady]);

  // ── Single train step ─────────────────────────────────────────────────────
  const doTrainStep = useCallback(async () => {
    const tf = tfRef.current;
    const model = modelRef.current;
    if (!tf || !model || points.length === 0) return;

    const { trainStep, getPredictionGrid, getLayerWeights } = await import("@/lib/ml/neural-net");

    const loss = await trainStep(tf, model, points);
    const grid = await getPredictionGrid(tf, model, GRID_RES);
    const weights = getLayerWeights(model);

    setLossHistory((prev) => [...prev, loss]);
    setPredGrid(grid);
    setLayerWeights(weights);
    setStepCount((s) => s + 1);
    setStatusMsg(`Step ${stepCount + 1} — Loss: ${loss.toFixed(4)}`);
    story.registerAction("nn-train");
  }, [points, stepCount, story]);

  // ── Continuous training interval ──────────────────────────────────────────
  useEffect(() => {
    if (isTraining) {
      intervalRef.current = setInterval(() => {
        doTrainStep();
      }, 250);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isTraining, doTrainStep]);

  // ── Add / remove points ───────────────────────────────────────────────────
  const handleAddPoint = (p: NNDataPoint) => setPoints((prev) => [...prev, p]);

  const handleClear = () => {
    setIsTraining(false);
    setPoints([]);
    setLossHistory([]);
    setPredGrid(null);
    setStepCount(0);
    setStatusMsg("Canvas cleared.");
    buildNewModel();
  };

  const handleLoadPreset = () => {
    setIsTraining(false);
    setPoints(PRESET_POINTS);
    setLossHistory([]);
    setPredGrid(null);
    setStepCount(0);
    setStatusMsg("XOR preset loaded. Click Train to start.");
    buildNewModel();
    story.registerAction("nn-load-preset");
  };

  // ── Arch change — rebuild model ───────────────────────────────────────────
  const handleArchChange = (newArch: Partial<NetworkArchitecture>) => {
    setIsTraining(false);
    setArchitecture((prev) => {
      const next = { ...prev, ...newArch };
      // schedule model rebuild after state settles
      setTimeout(() => {
        if (!tfRef.current) return;
        if (modelRef.current) modelRef.current.dispose();
        const { buildModel } = require("@/lib/ml/neural-net");
        modelRef.current = buildModel(tfRef.current, next, learningRate);
        setLayerWeights([]);
        setPredGrid(null);
        setLossHistory([]);
        setStepCount(0);
      }, 0);
      return next;
    });
  };

  // ── LR change — recompile ─────────────────────────────────────────────────
  const handleLRChange = (lr: number) => {
    setLearningRate(lr);
    const tf = tfRef.current;
    const model = modelRef.current;
    if (!tf || !model) return;
    model.compile({
      optimizer: tf.train.adam(lr),
      loss: "binaryCrossentropy",
    });
  };

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      modelRef.current?.dispose();
    };
  }, []);

  // When story finishes (isActive becomes false after last step) go to sandbox
  useEffect(() => {
    if (appMode === "story" && !story.state.isActive) {
      setAppMode("sandbox");
    }
  }, [appMode, story.state.isActive]);

  // ── Mode selection handlers ───────────────────────────────────────────────
  const enterStoryMode = () => {
    setAppMode("story");
    story.start(neuralNetWalkthrough);
  };

  const enterSandboxMode = () => {
    setAppMode("sandbox");
    story.skip();
  };

  const currentLoss = lossHistory.length > 0 ? lossHistory[lossHistory.length - 1] : null;

  // ── Mode Selection Screen ─────────────────────────────────────────────────
  if (appMode === "select") {
    return (
      <main className="min-h-screen bg-[#1e140e] text-[#fefae0] flex flex-col items-center justify-center p-8 font-vt323">
        {/* Module nav still accessible */}
        <nav className="fixed top-4 right-4 flex items-center gap-2 z-10">
          <Link href="/playground/perceptron"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            01. Perceptron
          </Link>
          <Link href="/playground/gradient-descent"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            02. Gradient Descent
          </Link>
          <Link href="/playground/neural-net"
            className="px-3 py-1.5 bg-[#386641] text-[#fefae0] font-pixel text-[10px] uppercase border-2 border-[#1b3521] shadow-[2px_2px_0px_0px_#0f0a07]">
            03. Neural Net
          </Link>
        </nav>

        <div className="max-w-lg w-full text-center flex flex-col items-center gap-8">
          {/* Title */}
          <div>
            <span className="bg-[#bc4749] text-[#fefae0] font-pixel text-[10px] uppercase px-2 py-1 border border-[#6b2123] inline-block mb-4">
              Module 03
            </span>
            <h1 className="text-3xl font-pixel text-[#dda15e] uppercase tracking-wider mb-2">
              Neural Net Visualizer
            </h1>
            <p className="text-[#a3b18a] text-xl">Choose your experience:</p>
          </div>

          {/* Mode cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {/* Story Mode card */}
            <button
              onClick={enterStoryMode}
              className="group bg-[#281b12] border-4 border-[#386641] shadow-[6px_6px_0px_0px_#0f0a07] p-6 text-left flex flex-col gap-3 hover:bg-[#2e2214] hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-[2px_2px_0px_0px_#0f0a07]"
            >
              <div className="text-4xl">📖</div>
              <div>
                <h2 className="font-pixel text-[12px] text-[#dda15e] uppercase mb-2">Story Mode</h2>
                <p className="text-[#a3b18a] text-lg leading-snug">
                  Guided walkthrough with BYTE. Discover why XOR needs hidden layers, and watch the network learn a curved boundary.
                </p>
              </div>
              <span className="font-pixel text-[10px] text-[#386641] border border-[#386641] px-2 py-1 self-start">
                ▶ START TUTORIAL
              </span>
            </button>

            {/* Sandbox Mode card */}
            <button
              onClick={enterSandboxMode}
              className="group bg-[#281b12] border-4 border-[#382219] shadow-[6px_6px_0px_0px_#0f0a07] p-6 text-left flex flex-col gap-3 hover:bg-[#2e2214] hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-[2px_2px_0px_0px_#0f0a07]"
            >
              <div className="text-4xl">🔬</div>
              <div>
                <h2 className="font-pixel text-[12px] text-[#dda15e] uppercase mb-2">Sandbox Mode</h2>
                <p className="text-[#a3b18a] text-lg leading-snug">
                  Jump straight in. Adjust layers, nodes, and learning rate freely. Full control.
                </p>
              </div>
              <span className="font-pixel text-[10px] text-[#a3b18a] border border-[#382219] px-2 py-1 self-start">
                ▶ FREE EXPLORE
              </span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Shared Playground UI (Story + Sandbox both render this) ───────────────
  return (
    <main className="min-h-screen bg-[#1e140e] text-[#fefae0] p-4 md:p-8 font-vt323 selection:bg-[#dda15e] selection:text-[#1e140e]">
      {/* ── Header & Module Tabs ─────────────────────────────────────── */}
      <header className="max-w-7xl mx-auto mb-6 bg-[#281b12] border-4 border-[#382219] p-4 shadow-[6px_6px_0px_0px_#0f0a07] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-[#bc4749] text-[#fefae0] font-pixel text-[10px] uppercase px-2 py-1 border border-[#6b2123]">
              Module 03
            </span>
            <h1 className="text-2xl md:text-3xl font-pixel text-[#dda15e] tracking-wider uppercase">
              Neural Net Visualizer
            </h1>
            {/* Mode badge */}
            {appMode === "story" ? (
              <span className="bg-[#dda15e] text-[#1e140e] font-pixel text-[10px] px-2 py-1 border border-[#7a5225]">
                STORY MODE
              </span>
            ) : (
              <button
                onClick={() => setAppMode("select")}
                className="text-[#a3b18a] hover:text-[#dda15e] font-pixel text-[10px] border border-[#382219] px-2 py-1 transition-colors"
              >
                SANDBOX ↺
              </button>
            )}
          </div>
          <p className="text-[#a3b18a] text-lg mt-1 font-vt323">
            Backprop • Hidden Layers • Non-Linear Decision Boundaries • TensorFlow.js
          </p>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/playground/perceptron"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            01. Perceptron
          </Link>
          <Link href="/playground/gradient-descent"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            02. Gradient Descent
          </Link>
          <Link href="/playground/neural-net"
            className="px-3 py-1.5 bg-[#386641] text-[#fefae0] font-pixel text-[10px] uppercase border-2 border-[#1b3521] shadow-[2px_2px_0px_0px_#0f0a07]">
            03. Neural Net
          </Link>
        </nav>
      </header>

      {/* ── Main Grid ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Canvas + Node Diagram */}
        <div id="story-nn-canvas" className="lg:col-span-7 flex flex-col items-center lg:items-start">
          <NeuralNetCanvas
            points={points}
            predictionGrid={predGrid}
            gridRes={GRID_RES}
            layerWeights={layerWeights}
            onAddPoint={handleAddPoint}
            width={560}
            height={560}
          />
        </div>

        {/* Right: Controls + Chart + Readout */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">

          {/* Status bar */}
          <div className="bg-[#281b12] border-4 border-[#382219] px-4 py-2 shadow-[4px_4px_0px_0px_#0f0a07] text-[#a3b18a] text-lg font-vt323 flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 border border-[#1e140e] ${tfReady ? "bg-[#a3b18a]" : "bg-[#bc4749]"} animate-pulse`} />
            {statusMsg}
          </div>

          {/* Architecture Controls */}
          <div id="story-nn-arch-panel">
            <RetroPanel title="Network Architecture" borderColor="border-[#382219]">
              <div className="flex flex-col gap-4">
                {/* Hidden nodes */}
                <div id="story-nn-nodes-panel">
                  <span className="font-pixel text-[10px] text-[#a3b18a] block mb-2 uppercase">
                    Nodes per Hidden Layer:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 4, 8, 16].map((n) => (
                      <button key={n}
                        onClick={() => handleArchChange({ hiddenSize: n })}
                        className={`font-pixel text-[10px] uppercase py-2 border-2 transition-all ${
                          architecture.hiddenSize === n
                            ? "bg-[#dda15e] text-[#1e140e] border-[#7a5225] shadow-[2px_2px_0px_0px_#0f0a07]"
                            : "bg-[#1e140e] text-[#a3b18a] border-[#382219] hover:bg-[#281b12]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Num hidden layers */}
                <div>
                  <span className="font-pixel text-[10px] text-[#a3b18a] block mb-2 uppercase">
                    Hidden Layers:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {([1, 2] as const).map((n) => (
                      <button key={n}
                        onClick={() => handleArchChange({ numHiddenLayers: n })}
                        className={`font-pixel text-[10px] uppercase py-2 border-2 transition-all ${
                          architecture.numHiddenLayers === n
                            ? "bg-[#dda15e] text-[#1e140e] border-[#7a5225] shadow-[2px_2px_0px_0px_#0f0a07]"
                            : "bg-[#1e140e] text-[#a3b18a] border-[#382219] hover:bg-[#281b12]"
                        }`}
                      >
                        {n} Layer{n > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning rate */}
                <RetroSlider
                  label="Learning Rate (η)"
                  min={0.01}
                  max={1.0}
                  step={0.01}
                  value={learningRate}
                  onChange={handleLRChange}
                  displayValue={learningRate.toFixed(2)}
                />

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <RetroButton variant="primary" onClick={doTrainStep} disabled={!tfReady || points.length === 0}>
                    Train Step
                  </RetroButton>
                  <RetroButton
                    variant={isTraining ? "danger" : "accent"}
                    onClick={() => setIsTraining((p) => !p)}
                    disabled={!tfReady || points.length === 0}
                  >
                    {isTraining ? "Stop Auto" : "Train Auto"}
                  </RetroButton>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <RetroButton variant="secondary" onClick={buildNewModel} disabled={!tfReady}>
                    Reset Model
                  </RetroButton>
                  <RetroButton variant="secondary" onClick={handleClear}>
                    Clear Canvas
                  </RetroButton>
                </div>

                <div className="pt-3 border-t-2 border-[#382219]">
                  <span className="font-pixel text-[10px] text-[#a3b18a] block mb-2 uppercase">Presets</span>
                  <div id="story-nn-xor-btn">
                    <RetroButton variant="secondary" className="w-full" onClick={handleLoadPreset}>
                      Load XOR Pattern
                    </RetroButton>
                  </div>
                </div>
              </div>
            </RetroPanel>
          </div>

          {/* Loss Chart */}
          <RetroPanel title="Loss Convergence Chart" borderColor="border-[#382219]">
            <LossChart lossHistory={lossHistory} />
          </RetroPanel>

          {/* Live Readout */}
          <RetroPanel title="Training Readout" borderColor="border-[#b37d36]">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#1e140e] p-2 border-2 border-[#382219]">
                  <span className="text-[#a3b18a] block font-pixel text-[9px]">POINTS</span>
                  <span className="text-[#fefae0] font-vt323 text-2xl">{points.length}</span>
                </div>
                <div className="bg-[#1e140e] p-2 border-2 border-[#382219]">
                  <span className="text-[#a3b18a] block font-pixel text-[9px]">STEPS</span>
                  <span className="text-[#dda15e] font-vt323 text-2xl">{stepCount}</span>
                </div>
                <div className="bg-[#1e140e] p-2 border-2 border-[#382219]">
                  <span className="text-[#a3b18a] block font-pixel text-[9px]">LOSS</span>
                  <span
                    className={`font-vt323 text-2xl ${
                      currentLoss === null ? "text-[#a3b18a]" :
                      currentLoss < 0.1 ? "text-[#a3b18a]" :
                      currentLoss < 0.4 ? "text-[#dda15e]" : "text-[#bc4749]"
                    }`}
                  >
                    {currentLoss !== null ? currentLoss.toFixed(4) : "—"}
                  </span>
                </div>
              </div>

              <div className="bg-[#1e140e] p-2.5 border-2 border-[#382219] text-lg leading-relaxed">
                <p className="font-pixel text-[9px] text-[#dda15e] uppercase mb-1">Architecture:</p>
                <code className="font-vt323 text-xl text-[#fefae0]">
                  2 → {architecture.hiddenSize}{architecture.numHiddenLayers === 2 ? ` → ${architecture.hiddenSize}` : ""} → 1 (sigmoid)
                </code>
              </div>
            </div>
          </RetroPanel>

          {/* Concept note */}
          <div className="bg-[#281b12] border-4 border-[#382219] p-3 shadow-[4px_4px_0px_0px_#0f0a07] text-lg text-[#a3b18a] leading-relaxed">
            <p className="text-[#dda15e] font-pixel text-[9px] uppercase mb-1">💡 Why Hidden Layers?</p>
            <p>
              A single-layer perceptron can only draw a <em>straight line</em>. With hidden layers and ReLU activations,
              the network learns <em>curved, non-linear</em> decision regions — enabling it to solve problems like XOR that
              are impossible for a linear classifier.
            </p>
          </div>
        </div>
      </div>

      {/* ── Story Mode Dialogue Overlay ───────────────────────────────────── */}
      {appMode === "story" && story.currentStep && (
        <NPCDialogueBox
          step={story.currentStep}
          script={neuralNetWalkthrough}
          stepIndex={story.state.currentStepIndex}
          totalSteps={neuralNetWalkthrough.steps.length}
          actionCount={story.state.actionCount}
          onNext={story.advance}
          onSkip={() => {
            story.skip();
            setAppMode("sandbox");
          }}
        />
      )}
    </main>
  );
}
