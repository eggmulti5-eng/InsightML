"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GradientDescentCanvas } from "@/components/canvas/GradientDescentCanvas";
import { LossChart } from "@/components/charts/LossChart";
import { RetroButton } from "@/components/ui/RetroButton";
import { RetroSlider } from "@/components/ui/RetroSlider";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { MathFormulaPanel } from "@/components/ui/MathFormulaPanel";
import { NPCDialogueBox } from "@/components/story/NPCDialogueBox";
import { ChallengeCard } from "@/components/challenge/ChallengeCard";
import { ChallengeResultModal } from "@/components/challenge/ChallengeResultModal";
import { useStoryMode } from "@/lib/story/useStoryMode";
import { useChallengeMode } from "@/lib/challenge/useChallengeMode";
import { gradientDescentWalkthrough } from "@/lib/story/walkthroughs/gradientDescent";
import { gradientDescentChallenge } from "@/lib/challenge/challenges";
import { UserAuthWidget } from "@/components/auth/UserAuthWidget";
import { LossPreset, Point2D } from "@/modules/gradient-descent/types";
import {
  PRESETS,
  computeLoss,
  computeGradient,
  gradientDescentStep,
} from "@/lib/ml/gradientDescent";

const DEFAULT_START: Point2D = { x: -3.5, y: 3.5 };

type AppMode = "select" | "story" | "sandbox" | "challenge" | "applied";

export default function GradientDescentPlayground() {
  const router = useRouter();
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

  // Challenge mode controller
  const challenge = useChallengeMode(gradientDescentChallenge);

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

  const enterChallengeMode = () => {
    setAppMode("challenge");
    challenge.reset();
    setIsAutoStepping(false);
    setPreset("bowl");
    setLearningRate(PRESETS["bowl"].defaultLr);
    setPath([DEFAULT_START]);
    setLossHistory([computeLoss(DEFAULT_START.x, DEFAULT_START.y, "bowl")]);
  };

  const enterAppliedMode = () => {
    setIsAutoStepping(false);
    setAppMode("applied");
  };

  // When story finishes (isActive becomes false after last step) go to sandbox
  useEffect(() => {
    if (appMode === "story" && !story.state.isActive) {
      setAppMode("sandbox");
    }
  }, [appMode, story.state.isActive]);

  // ── Challenge progress tracking ───────────────────────────────────────────
  useEffect(() => {
    if (appMode === "challenge") {
      challenge.update({ stepCount, currentLoss, lossHistory });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appMode, stepCount]);

  const handleChallengeRetry = () => {
    challenge.reset();
    setIsAutoStepping(false);
    setPreset("bowl");
    setLearningRate(PRESETS["bowl"].defaultLr);
    setPath([DEFAULT_START]);
    setLossHistory([computeLoss(DEFAULT_START.x, DEFAULT_START.y, "bowl")]);
  };

  const handleNextChallenge = () => {
    router.push(gradientDescentChallenge.nextChallengeUrl ?? "/playground/neural-net");
  };

  // ── Mode Selection Screen ─────────────────────────────────────────────────
  if (appMode === "select") {
    return (
      <main className="min-h-screen bg-[#1e140e] text-[#fefae0] flex flex-col items-center justify-center p-8 font-vt323">
        {/* Module nav still accessible */}
        <nav className="fixed top-4 right-4 flex items-center gap-2 z-10">
          <Link href="/"
            className="px-3 py-1.5 bg-[#1e140e] hover:bg-[#281b12] text-[#5c3d2e] hover:text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#2e1e14] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            ← Dashboard
          </Link>
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
          <UserAuthWidget />
        </nav>

        <div className="max-w-3xl w-full text-center flex flex-col items-center gap-8">
          <div>
            <span className="bg-[#dda15e] text-[#1e140e] font-pixel text-[10px] uppercase px-2 py-1 border border-[#7a5225] inline-block mb-4">
              Module 02
            </span>
            <h1 className="text-3xl font-pixel text-[#dda15e] uppercase tracking-wider mb-2">
              Gradient Descent Visualizer
            </h1>
            <p className="text-[#a3b18a] text-xl">Choose your experience:</p>
          </div>

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
                  Guided walkthrough with BYTE. Learn loss surfaces and learning rate dynamics.
                </p>
              </div>
              <span className="font-pixel text-[10px] text-[#386641] border border-[#386641] px-2 py-1 self-start">
                ▶ START TUTORIAL
              </span>
            </button>

            {/* Challenge Mode card */}
            <button
              onClick={enterChallengeMode}
              className="group bg-[#281b12] border-4 border-[#dda15e] shadow-[6px_6px_0px_0px_#0f0a07] p-6 text-left flex flex-col gap-3 hover:bg-[#2e2214] hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-[2px_2px_0px_0px_#0f0a07]"
            >
              <div className="text-4xl">🏆</div>
              <div>
                <h2 className="font-pixel text-[12px] text-[#dda15e] uppercase mb-2">Challenge Mode</h2>
                <p className="text-[#a3b18a] text-lg leading-snug">
                  &quot;{gradientDescentChallenge.title}&quot; — {gradientDescentChallenge.goalSummary}
                </p>
              </div>
              <span className="font-pixel text-[10px] text-[#dda15e] border border-[#dda15e] px-2 py-1 self-start">
                ▶ START CHALLENGE
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
                  Jump straight in. Experiment with surfaces, learning rates, and start points.
                </p>
              </div>
              <span className="font-pixel text-[10px] text-[#a3b18a] border border-[#382219] px-2 py-1 self-start">
                ▶ FREE EXPLORE
              </span>
            </button>

            {/* Applied Project card */}
            <button
              onClick={enterAppliedMode}
              className="group bg-[#281b12] border-4 border-[#5a6e3a] shadow-[6px_6px_0px_0px_#0f0a07] p-6 text-left flex flex-col gap-3 hover:bg-[#252e15] hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-[2px_2px_0px_0px_#0f0a07]"
            >
              <div className="text-4xl">🔎</div>
              <div>
                <h2 className="font-pixel text-[12px] text-[#a3b18a] uppercase mb-2">Applied Project</h2>
                <p className="text-[#a3b18a] text-lg leading-snug">
                  BYTE explains how gradient descent trains a real house price estimator.
                </p>
              </div>
              <span className="font-pixel text-[10px] text-[#5a6e3a] border border-[#5a6e3a] px-2 py-1 self-start">
                ▶ READ WITH BYTE
              </span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Applied Project: House Price Estimator Narrative ──────────────────
  if (appMode === "applied") {
    const byteLines = [
      {
        heading: "The Goal: Predict House Prices",
        text: "A real estate company wants to instantly estimate the price of any property. Their model takes in features like square footage, number of bedrooms, and neighbourhood score, and outputs a price prediction. Gradient descent is what trains it.",
      },
      {
        heading: "Step 1 — Define the Model",
        text: "Start with a linear regression model: Price = w1·sqft + w2·bedrooms + w3·neighbourhood + b. We have four parameters to learn: w1, w2, w3, and b (the bias). Initially they're all random noise.",
      },
      {
        heading: "Step 2 — Choose Your Loss Function",
        text: "The loss is Mean Squared Error (MSE): L = (1/n) Σ (predictedᵢ − actualᵢ)². It measures how far off our predictions are across all training houses. Minimising L is exactly the bowl surface you explored in the visualiser — except in 4 dimensions instead of 2.",
      },
      {
        heading: "Step 3 — Compute the Gradient",
        text: "Take the partial derivative of L with respect to each weight: ∂L/∂w1 tells us how much L changes if we nudge w1. If this is positive, L is rising in that direction — so we step in the opposite direction. That’s the gradient: a vector pointing uphill.",
      },
      {
        heading: "Step 4 — Update the Weights",
        text: "Apply the update rule: w ← w − η · ∇L. With a small learning rate (e.g. η = 0.01), each step moves the weights slightly downhill. After thousands of steps, the weights converge to values that minimise the average prediction error across your training set.",
      },
      {
        heading: "Step 5 — Learning Rate Tuning",
        text: "Too small η → the model trains for hours before converging. Too large η → the weights overshoot the minimum and diverge (MSE explodes). In practice: start with η = 0.001, watch the loss curve, and increase by 3× if it's too slow. This is exactly what you experimented with on the bowl surface.",
      },
      {
        heading: "Step 6 — From Batch to Mini-Batch",
        text: "Computing the full gradient over 100,000 houses every step is expensive. Mini-batch SGD samples 32–256 houses per step, computing a noisy but fast estimate of the gradient. The loss curve becomes jagged but still descends toward the minimum. This is how every deep learning framework trains — PyTorch, TensorFlow, JAX.",
      },
      {
        heading: "What You’ve Actually Built",
        text: "This is the exact pipeline used by Zillow’s Zestimate, Airbnb’s pricing model, and any real-estate ML system. The only differences are richer features (school ratings, crime stats, year built), more complex models (gradient-boosted trees, neural nets), and more data. The gradient descent core is identical to what you just ran.",
      },
    ];

    return (
      <main className="min-h-screen bg-[#1e140e] text-[#fefae0] p-4 md:p-8 font-vt323">
        {/* Header */}
        <header className="max-w-4xl mx-auto mb-8 bg-[#281b12] border-4 border-[#5a6e3a] p-4 shadow-[6px_6px_0px_0px_#0f0a07] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-[#dda15e] text-[#1e140e] font-pixel text-[10px] uppercase px-2 py-1 border border-[#7a5225] font-bold">
                Module 02
              </span>
              <h1 className="text-2xl md:text-3xl font-pixel text-[#dda15e] tracking-wider uppercase">
                Applied Project
              </h1>
              <span className="bg-[#5a6e3a] text-[#fefae0] font-pixel text-[10px] px-2 py-1 border border-[#3a5220]">
                NARRATIVE
              </span>
            </div>
            <p className="text-[#a3b18a] text-lg mt-1 font-vt323">
              Training a House Price Estimator with Gradient Descent
            </p>
          </div>
          <button
            onClick={() => setAppMode("select")}
            className="font-pixel text-[10px] text-[#a3b18a] hover:text-[#dda15e] border-2 border-[#382219] hover:border-[#dda15e] px-4 py-2 transition-colors"
          >
            ← Back to Menu
          </button>
        </header>

        {/* BYTE Dialogue Feed */}
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Intro BYTE bubble */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-[#1e140e] border-4 border-[#5a6e3a] flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_#0f0a07]">
              🤖
            </div>
            <div className="bg-[#281b12] border-4 border-[#5a6e3a] p-4 shadow-[4px_4px_0px_0px_#0f0a07] flex-1">
              <p className="font-pixel text-[10px] text-[#5a6e3a] uppercase mb-2">BYTE — Applied Project</p>
              <p className="text-[#fefae0] text-xl leading-relaxed">
                Welcome back. You’ve watched the ball roll down the bowl. Now I’ll show you what that ball actually
                represents in the real world. We’re going to design a{" "}
                <span className="text-[#dda15e]">house price estimator</span> — one of the most common
                applications of gradient descent in industry.
              </p>
            </div>
          </div>

          {/* Steps */}
          {byteLines.map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-[#1e140e] border-4 border-[#382219] flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_#0f0a07]">
                <span className="font-pixel text-[8px] text-[#5c3d2e] uppercase">Step</span>
                <span className="font-pixel text-[16px] text-[#dda15e]">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="bg-[#1e140e] border-4 border-[#382219] p-4 shadow-[4px_4px_0px_0px_#0f0a07] flex-1">
                <p className="font-pixel text-[10px] text-[#a3b18a] uppercase mb-2 tracking-wider">{item.heading}</p>
                <p className="text-[#fefae0] text-xl leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}

          {/* Closing BYTE bubble */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 bg-[#1e140e] border-4 border-[#5a6e3a] flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_#0f0a07]">
              🤖
            </div>
            <div className="bg-[#281b12] border-4 border-[#5a6e3a] p-4 shadow-[4px_4px_0px_0px_#0f0a07] flex-1">
              <p className="font-pixel text-[10px] text-[#5a6e3a] uppercase mb-2">BYTE — Next Steps</p>
              <p className="text-[#fefae0] text-xl leading-relaxed">
                To build this yourself: grab the{" "}
                <code className="text-[#dda15e]">California Housing</code> dataset from
                scikit-learn, implement linear regression with{" "}
                <code className="text-[#dda15e]">SGDRegressor</code>, and plot your loss curve.
                Then swap in PyTorch’s optimizer and watch the gradient descent you visualised here run on real data.
                Module 03 next — we’re adding hidden layers.
              </p>
            </div>
          </div>

          {/* Footer spacer + back button */}
          <div className="flex justify-center pt-4 pb-8">
            <button
              onClick={() => setAppMode("select")}
              className="font-pixel text-[12px] text-[#a3b18a] hover:text-[#dda15e] border-4 border-[#382219] hover:border-[#dda15e] px-8 py-3 shadow-[4px_4px_0px_0px_#0f0a07] transition-colors"
            >
              ← Return to Module Menu
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Shared Playground UI ──────────────────────────────────────────────────
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
            ) : appMode === "challenge" ? (
              <button
                onClick={() => { challenge.reset(); setAppMode("select"); }}
                className="text-[#bc4749] hover:text-[#dda15e] font-pixel text-[10px] border border-[#6b2123] px-2 py-1 transition-colors"
              >
                CHALLENGE ↺
              </button>
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

        <nav className="flex items-center gap-2">
          <Link href="/"
            className="px-3 py-1.5 bg-[#1e140e] hover:bg-[#281b12] text-[#5c3d2e] hover:text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#2e1e14] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            ← Dashboard
          </Link>
          <Link href="/playground/perceptron"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            01. Perceptron
          </Link>
          <Link href="/playground/gradient-descent"
            className="px-3 py-1.5 bg-[#dda15e] text-[#1e140e] font-pixel text-[10px] uppercase border-2 border-[#7a5225] shadow-[2px_2px_0px_0px_#0f0a07]">
            02. Gradient Descent
          </Link>
          <Link href="/playground/neural-net"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            03. Neural Net
          </Link>
          <UserAuthWidget />
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
          <MathFormulaPanel module="gradient-descent" preset={preset} learningRate={learningRate} />
        </div>

        {/* Right Column: Controls, Chart, & Readout */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          {/* Challenge Card (only in challenge mode) */}
          {appMode === "challenge" && (
            <ChallengeCard
              challenge={gradientDescentChallenge}
              metrics={{ stepCount, currentLoss, lossHistory }}
              isWon={challenge.isWon}
            />
          )}

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
          onNext={() => {
            if (story.state.currentStepIndex === gradientDescentWalkthrough.steps.length - 1) {
              story.skip();
              enterChallengeMode();
            } else {
              story.advance();
            }
          }}
          onSkip={() => {
            story.skip();
            setAppMode("sandbox");
          }}
        />
      )}

      {/* ── Challenge Result Modal ────────────────────────────────────────── */}
      {challenge.showModal && (
        <ChallengeResultModal
          challenge={gradientDescentChallenge}
          stars={challenge.stars}
          metrics={challenge.lastMetrics}
          onRetry={handleChallengeRetry}
          onNext={handleNextChallenge}
          onDismiss={challenge.dismissModal}
        />
      )}
    </main>
  );
}
