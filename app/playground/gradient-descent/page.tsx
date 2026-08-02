"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { GradientDescentCanvas } from "@/components/canvas/GradientDescentCanvas";
import { LossChart } from "@/components/charts/LossChart";
import { RetroButton } from "@/components/ui/RetroButton";
import { RetroSlider } from "@/components/ui/RetroSlider";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { NPCDialogueBox } from "@/components/story/NPCDialogueBox";
import { useStoryMode } from "@/lib/story/useStoryMode";
import { gradientDescentWalkthrough } from "@/lib/story/walkthroughs/gradientDescent";
import { LossPreset, Point2D } from "@/modules/gradient-descent/types";
import {
  PRESETS,
  computeLoss,
  computeGradient,
  gradientDescentStep,
} from "@/lib/ml/gradientDescent";

const DEFAULT_START: Point2D = { x: -3.5, y: 3.5 };

type AppMode = "select" | "story" | "sandbox";

export default function GradientDescentPlayground() {
  const [appMode, setAppMode] = useState<AppMode>("select");

  const [preset, setPreset] = useState<LossPreset>("bowl");
  const [startPoint, setStartPoint] = useState<Point2D>(DEFAULT_START);
  const [path, setPath] = useState<Point2D[]>([DEFAULT_START]);
  const [lossHistory, setLossHistory] = useState<number[]>([
    computeLoss(DEFAULT_START.x, DEFAULT_START.y, "bowl"),
  ]);
  const [learningRate, setLearningRate] = useState<number>(0.1);
  const [isAutoStepping, setIsAutoStepping] = useState<boolean>(false);

  const autoStepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Story mode controller
  const story = useStoryMode();

  // Execute ONE gradient descent step
  const handleStep = useCallback(() => {
    setPath((prevPath) => {
      if (prevPath.length === 0) return prevPath;
      const currentPos = prevPath[prevPath.length - 1];
      const stepRes = gradientDescentStep(currentPos, learningRate, preset);
      setLossHistory((prevLosses) => [...prevLosses, stepRes.loss]);
      return [...prevPath, stepRes.nextPos];
    });
    story.registerAction("gd-step");
  }, [learningRate, preset, story]);

  // Handle continuous auto-stepping loop
  useEffect(() => {
    if (isAutoStepping) {
      autoStepIntervalRef.current = setInterval(() => {
        handleStep();
      }, 200);
    } else if (autoStepIntervalRef.current) {
      clearInterval(autoStepIntervalRef.current);
      autoStepIntervalRef.current = null;
    }

    return () => {
      if (autoStepIntervalRef.current) {
        clearInterval(autoStepIntervalRef.current);
      }
    };
  }, [isAutoStepping, handleStep]);

  // Reset trajectory path
  const handleResetPath = () => {
    setIsAutoStepping(false);
    setPath([startPoint]);
    setLossHistory([computeLoss(startPoint.x, startPoint.y, preset)]);
  };

  // Change Starting Point via Canvas click or Randomizer
  const handleSetStartPoint = (newStart: Point2D) => {
    setIsAutoStepping(false);
    setStartPoint(newStart);
    setPath([newStart]);
    setLossHistory([computeLoss(newStart.x, newStart.y, preset)]);
  };

  // Randomize Start Point
  const handleRandomizeStart = () => {
    const rx = Number(((Math.random() - 0.5) * 8).toFixed(2));
    const ry = Number(((Math.random() - 0.5) * 8).toFixed(2));
    handleSetStartPoint({ x: rx, y: ry });
  };

  // Change Preset Surface
  const handlePresetChange = (newPreset: LossPreset) => {
    setIsAutoStepping(false);
    setPreset(newPreset);
    setLearningRate(PRESETS[newPreset].defaultLr);
    setPath([startPoint]);
    setLossHistory([computeLoss(startPoint.x, startPoint.y, newPreset)]);
  };

  // Derived status values
  const currentPos = path[path.length - 1] || startPoint;
  const currentLoss = computeLoss(currentPos.x, currentPos.y, preset);
  const currentGrad = computeGradient(currentPos.x, currentPos.y, preset);
  const gradNorm = Math.sqrt(currentGrad.gx * currentGrad.gx + currentGrad.gy * currentGrad.gy);
  const stepCount = path.length - 1;

  // Detect status: Converged / Minimizing / Diverging
  const isDiverging =
    stepCount > 0 &&
    (currentLoss > lossHistory[0] * 1.1 ||
      currentLoss >= 45 ||
      !isFinite(currentLoss) ||
      Math.abs(currentPos.x) >= 4.8 ||
      Math.abs(currentPos.y) >= 4.8 ||
      (lossHistory.length >= 2 && lossHistory[lossHistory.length - 1] > lossHistory[lossHistory.length - 2]));

  const isConverged = !isDiverging && (gradNorm < 0.02 || (stepCount > 0 && Math.abs(currentLoss) < 0.001));

  // ── Mode selection handlers ───────────────────────────────────────────────
  const enterStoryMode = () => {
    setAppMode("story");
    story.start(gradientDescentWalkthrough);
  };

  const enterSandboxMode = () => {
    setAppMode("sandbox");
    story.skip();
  };

  // When story finishes (isActive becomes false after last step) go to sandbox
  useEffect(() => {
    if (appMode === "story" && !story.state.isActive) {
      setAppMode("sandbox");
    }
  }, [appMode, story.state.isActive]);

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
            className="px-3 py-1.5 bg-[#386641] text-[#fefae0] font-pixel text-[10px] uppercase border-2 border-[#1b3521] shadow-[2px_2px_0px_0px_#0f0a07]">
            02. Gradient Descent
          </Link>
          <Link href="/playground/neural-net"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            03. Neural Net
          </Link>
        </nav>

        <div className="max-w-lg w-full text-center flex flex-col items-center gap-8">
          {/* Title */}
          <div>
            <span className="bg-[#dda15e] text-[#1e140e] font-pixel text-[10px] uppercase px-2 py-1 border border-[#7a5225] inline-block mb-4">
              Module 02
            </span>
            <h1 className="text-3xl font-pixel text-[#dda15e] uppercase tracking-wider mb-2">
              Gradient Descent Visualizer
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
                  Guided walkthrough with BYTE. Learn loss surfaces, gradient steps, and what happens when the learning rate is too high.
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
                  Jump straight in. Experiment with learning rates, surfaces, and start points freely.
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
      {/* Top Navigation Bar */}
      <header className="max-w-7xl mx-auto mb-6 bg-[#281b12] border-4 border-[#382219] p-4 shadow-[6px_6px_0px_0px_#0f0a07] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-[#dda15e] text-[#1e140e] font-pixel text-[10px] uppercase px-2 py-1 border border-[#7a5225] font-bold">
              Module 02
            </span>
            <h1 className="text-2xl md:text-3xl font-pixel text-[#dda15e] tracking-wider uppercase">
              Gradient Descent Visualizer
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
            Optimization Surfaces • Learning Rate Dynamics • Loss Minimization Trajectory
          </p>
        </div>

        {/* Module Navigation Tabs */}
        <nav className="flex items-center gap-2">
          <Link
            href="/playground/perceptron"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors"
          >
            01. Perceptron
          </Link>
          <Link
            href="/playground/gradient-descent"
            className="px-3 py-1.5 bg-[#386641] text-[#fefae0] font-pixel text-[10px] uppercase border-2 border-[#1b3521] shadow-[2px_2px_0px_0px_#0f0a07]"
          >
            02. Gradient Descent
          </Link>
          <Link
            href="/playground/neural-net"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors"
          >
            03. Neural Net
          </Link>
        </nav>
      </header>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 2D Contour Canvas */}
        <div id="story-gd-canvas" className="lg:col-span-7 flex flex-col items-center lg:items-start">
          <GradientDescentCanvas
            path={path}
            preset={preset}
            onSetStartPoint={handleSetStartPoint}
            width={600}
            height={600}
            range={5}
          />
        </div>

        {/* Right Column: Controls, Chart, & Readout */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          {/* Controls Panel */}
          <div id="story-gd-controls">
            <RetroPanel title="Optimizer & Surface Setup" borderColor="border-[#382219]">
              <div className="flex flex-col gap-4">
                {/* Preset Selector */}
                <div>
                  <span className="font-pixel text-[10px] text-[#a3b18a] block mb-2 uppercase">
                    Loss Surface Surface:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(PRESETS) as LossPreset[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => handlePresetChange(key)}
                        className={`font-pixel text-[9px] uppercase p-2 border-2 transition-all ${
                          preset === key
                            ? "bg-[#dda15e] text-[#1e140e] border-[#7a5225] shadow-[2px_2px_0px_0px_#0f0a07]"
                            : "bg-[#1e140e] text-[#a3b18a] border-[#382219] hover:bg-[#281b12]"
                        }`}
                      >
                        {PRESETS[key].name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning Rate Slider */}
                <div id="story-gd-lr-slider">
                  <RetroSlider
                    label="Learning Rate (η)"
                    min={0.001}
                    max={1.0}
                    step={0.005}
                    value={learningRate}
                    onChange={setLearningRate}
                    displayValue={learningRate.toFixed(3)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <div id="story-gd-step-btn">
                    <RetroButton variant="primary" onClick={handleStep} className="w-full">
                      Step (1x)
                    </RetroButton>
                  </div>

                  <RetroButton
                    variant={isAutoStepping ? "danger" : "accent"}
                    onClick={() => setIsAutoStepping((prev) => !prev)}
                  >
                    {isAutoStepping ? "Stop Auto" : "Run Auto"}
                  </RetroButton>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <RetroButton variant="secondary" onClick={handleResetPath}>
                    Reset Path
                  </RetroButton>
                  <RetroButton variant="secondary" onClick={handleRandomizeStart}>
                    Random Start
                  </RetroButton>
                </div>
              </div>
            </RetroPanel>
          </div>

          {/* Loss Curve Chart */}
          <RetroPanel title="Loss Convergence Chart" borderColor="border-[#382219]">
            <LossChart lossHistory={lossHistory} />
          </RetroPanel>

          {/* Readout Panel */}
          <RetroPanel title="Optimizer Readout" borderColor="border-[#b37d36]">
            <div className="space-y-3">
              {/* Status Badge */}
              <div className="flex justify-between items-center bg-[#1e140e] p-2.5 border-2 border-[#382219]">
                <span className="text-[#a3b18a]">Status:</span>
                <span
                  className={`font-pixel text-[10px] uppercase px-2.5 py-1 border ${
                    isDiverging
                      ? "bg-[#bc4749] text-[#fefae0] border-[#6b2123]"
                      : isConverged
                      ? "bg-[#386641] text-[#fefae0] border-[#1b3521]"
                      : "bg-[#dda15e] text-[#1e140e] border-[#7a5225]"
                  }`}
                >
                  {isDiverging ? "⚠️ DIVERGING (η too high!)" : isConverged ? "✓ CONVERGED AT MINIMUM" : "⚡ MINIMIZING"}
                </span>
              </div>

              {/* Numerical Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#1e140e] p-2 border-2 border-[#382219]">
                  <span className="text-[#a3b18a] block font-pixel text-[9px]">POS (x, y)</span>
                  <span className="text-[#dda15e] font-vt323 text-xl font-bold">
                    ({currentPos.x.toFixed(2)}, {currentPos.y.toFixed(2)})
                  </span>
                </div>
                <div className="bg-[#1e140e] p-2 border-2 border-[#382219]">
                  <span className="text-[#a3b18a] block font-pixel text-[9px]">LOSS f(x,y)</span>
                  <span className="text-[#fefae0] font-vt323 text-xl font-bold">
                    {isFinite(currentLoss) ? currentLoss.toFixed(4) : "∞"}
                  </span>
                </div>
                <div className="bg-[#1e140e] p-2 border-2 border-[#382219]">
                  <span className="text-[#a3b18a] block font-pixel text-[9px]">GRAD ||∇f||</span>
                  <span className="text-[#dda15e] font-vt323 text-xl font-bold">
                    {gradNorm.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Step info */}
              <div className="bg-[#1e140e] p-2.5 border-2 border-[#382219] flex justify-between items-center text-lg">
                <span className="text-[#a3b18a]">Total Steps Taken:</span>
                <span className="text-[#dda15e] font-bold">{stepCount}</span>
              </div>
            </div>
          </RetroPanel>

          {/* Theoretical Concept Note */}
          <div className="bg-[#281b12] border-4 border-[#382219] p-3 shadow-[4px_4px_0px_0px_#0f0a07] text-xs text-[#a3b18a] leading-relaxed">
            <p className="text-[#dda15e] font-pixel text-[9px] uppercase mb-1">
              💡 Concept Note: 2D Loss Surface Choice
            </p>
            <p>
              We chose a <strong>2D Bowl Loss Surface $f(x,y) = x^2 + y^2$</strong> because it maps parameter space directly to elevation contours. 
              Small learning rates ($\eta \approx 0.10$) produce steady downhill convergence, while large learning rates ($\eta \ge 0.95$) overshoot the bowl walls and oscillate/diverge.
            </p>
          </div>
        </div>
      </div>

      {/* ── Story Mode Dialogue Overlay ───────────────────────────────────── */}
      {appMode === "story" && story.currentStep && (
        <NPCDialogueBox
          step={story.currentStep}
          script={gradientDescentWalkthrough}
          stepIndex={story.state.currentStepIndex}
          totalSteps={gradientDescentWalkthrough.steps.length}
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
