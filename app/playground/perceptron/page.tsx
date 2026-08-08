"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PerceptronCanvas } from "@/components/canvas/PerceptronCanvas";
import { RetroButton } from "@/components/ui/RetroButton";
import { RetroSlider } from "@/components/ui/RetroSlider";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { MathFormulaPanel } from "@/components/ui/MathFormulaPanel";
import { NPCDialogueBox } from "@/components/story/NPCDialogueBox";
import { ChallengeCard } from "@/components/challenge/ChallengeCard";
import { ChallengeResultModal } from "@/components/challenge/ChallengeResultModal";
import { useStoryMode } from "@/lib/story/useStoryMode";
import { useChallengeMode } from "@/lib/challenge/useChallengeMode";
import { perceptronWalkthrough } from "@/lib/story/walkthroughs/perceptron";
import { perceptronChallenge } from "@/lib/challenge/challenges";
import { UserAuthWidget } from "@/components/auth/UserAuthWidget";
import {
  DataPoint,
  PerceptronWeights,
  initRandomWeights,
  trainEpoch,
  calculateAccuracy,
} from "@/lib/ml/perceptron";

type AppMode = "select" | "story" | "sandbox" | "challenge" | "applied";

export default function PerceptronPlayground() {
  const router = useRouter();
  const [appMode, setAppMode] = useState<AppMode>("select");

  const [points, setPoints] = useState<DataPoint[]>([]);
  const [weights, setWeights] = useState<PerceptronWeights>(initRandomWeights());
  const [learningRate, setLearningRate] = useState<number>(0.1);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [stepCount, setStepCount] = useState<number>(0);

  const trainingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Story mode controller
  const story = useStoryMode();

  // Challenge mode controller
  const challenge = useChallengeMode(perceptronChallenge);

  // ── Point handling ───────────────────────────────────────────────────────
  const handleAddPoint = (newPoint: DataPoint) => {
    setPoints((prev) => [...prev, newPoint]);
    story.registerAction("add-point");
  };

  // ── Training ─────────────────────────────────────────────────────────────
  const handleTrainStep = useCallback(() => {
    if (points.length === 0) return;
    setWeights((prevWeights) => trainEpoch(points, prevWeights, learningRate));
    setStepCount((prev) => prev + 1);
    story.registerAction("train-step");
  }, [points, learningRate, story]);

  useEffect(() => {
    if (isTraining) {
      trainingIntervalRef.current = setInterval(() => {
        handleTrainStep();
      }, 300);
    } else if (trainingIntervalRef.current) {
      clearInterval(trainingIntervalRef.current);
      trainingIntervalRef.current = null;
    }
    return () => {
      if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
    };
  }, [isTraining, handleTrainStep]);

  const handleResetWeights = () => {
    setWeights(initRandomWeights());
    setStepCount(0);
  };

  const handleClearPoints = () => {
    setPoints([]);
    setStepCount(0);
    setIsTraining(false);
  };

  const loadPresetSeparable = () => {
    setIsTraining(false);
    setStepCount(0);
    setPoints([
      { id: "1", x: -0.6, y: 0.6,  label:  1 },
      { id: "2", x: -0.4, y: 0.8,  label:  1 },
      { id: "3", x: -0.7, y: 0.3,  label:  1 },
      { id: "4", x: -0.2, y: 0.5,  label:  1 },
      { id: "5", x:  0.5, y: -0.6, label: -1 },
      { id: "6", x:  0.7, y: -0.4, label: -1 },
      { id: "7", x:  0.3, y: -0.7, label: -1 },
      { id: "8", x:  0.6, y: -0.2, label: -1 },
    ]);
  };

  const currentAccuracy = calculateAccuracy(points, weights);

  // ── Mode selection handlers ───────────────────────────────────────────────
  const enterStoryMode = () => {
    setAppMode("story");
    story.start(perceptronWalkthrough);
  };

  const enterSandboxMode = () => {
    setAppMode("sandbox");
    story.skip();
  };

  const enterChallengeMode = () => {
    setAppMode("challenge");
    challenge.reset();
    setPoints([]);
    setWeights(initRandomWeights());
    setStepCount(0);
    setIsTraining(false);
  };

  const enterAppliedMode = () => {
    setIsTraining(false);
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
      challenge.update({ stepCount, accuracy: currentAccuracy });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appMode, stepCount, currentAccuracy]);

  const handleChallengeRetry = () => {
    challenge.reset();
    setPoints([]);
    setWeights(initRandomWeights());
    setStepCount(0);
    setIsTraining(false);
  };

  const handleNextChallenge = () => {
    router.push(perceptronChallenge.nextChallengeUrl ?? "/playground/gradient-descent");
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
            className="px-3 py-1.5 bg-[#386641] text-[#fefae0] font-pixel text-[10px] uppercase border-2 border-[#1b3521] shadow-[2px_2px_0px_0px_#0f0a07]">
            01. Perceptron
          </Link>
          <Link href="/playground/gradient-descent"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            02. Gradient Descent
          </Link>
          <Link href="/playground/neural-net"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            03. Neural Net
          </Link>
          <UserAuthWidget />
        </nav>

        <div className="max-w-3xl w-full text-center flex flex-col items-center gap-8">
          {/* Title */}
          <div>
            <span className="bg-[#386641] text-[#fefae0] font-pixel text-[10px] uppercase px-2 py-1 border border-[#1b3521] inline-block mb-4">
              Module 01
            </span>
            <h1 className="text-3xl font-pixel text-[#dda15e] uppercase tracking-wider mb-2">
              Perceptron Visualizer
            </h1>
            <p className="text-[#a3b18a] text-xl">Choose your experience:</p>
          </div>

          {/* Mode cards — 2×2 grid */}
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
                  Guided walkthrough with BYTE the robot professor.
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
                  &quot;{perceptronChallenge.title}&quot; — {perceptronChallenge.goalSummary}
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
                  Jump straight in and experiment freely.
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
              <div className="text-4xl">🚀</div>
              <div>
                <h2 className="font-pixel text-[12px] text-[#a3b18a] uppercase mb-2">Applied Project</h2>
                <p className="text-[#a3b18a] text-lg leading-snug">
                  BYTE explains how to build a real spam classifier using what you&apos;ve learned.
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

  // ── Applied Project: Spam Classifier Narrative ─────────────────────────
  if (appMode === "applied") {
    const byteLines = [
      {
        heading: "The Goal: Detect Spam Emails",
        text: "Imagine your company receives 10,000 emails per day. Maybe 30% are spam — ads, phishing attempts, fake invoices. You need a fast filter. A perceptron is a perfect first weapon.",
      },
      {
        heading: "Step 1 — Choose Your Features",
        text: "Every email becomes a vector of numbers. For example: x₁ = fraction of words that are ALL CAPS, x₂ = number of hyperlinks, x₃ = presence of words like 'FREE' or 'WINNER' (0 or 1), x₄ = email length in characters. These are your inputs — the axes of your feature space.",
      },
      {
        heading: "Step 2 — Label Your Training Data",
        text: "Gather ~5,000 emails you've manually labeled: 'spam' (label = +1) and 'ham' (label = −1). This labeled dataset is your training set. The perceptron will learn where to draw the boundary between them in that 4-dimensional feature space.",
      },
      {
        heading: "Step 3 — Train the Perceptron",
        text: "Run the Perceptron Learning Rule: for each misclassified email, update w ← w + η·label·x. After enough epochs the weights w1, w2, w3, w4 and bias b will settle. The decision boundary is: w1·x1 + w2·x2 + w3·x3 + w4·x4 + b = 0. Emails above this threshold → spam. Below → ham.",
      },
      {
        heading: "Step 4 — The Catch (Linear Separability)",
        text: "A perceptron only converges if the data is linearly separable — i.e., a single flat hyperplane can cleanly separate spam from ham. Real email data rarely is. That's why production spam filters use logistic regression, SVMs, or neural networks. But a perceptron teaches you the exact conceptual foundation they all build on.",
      },
      {
        heading: "Step 5 — Evaluation & Deployment",
        text: "Split your dataset: 80% train, 20% test. Measure precision (fraction of spam calls that were correct) and recall (fraction of actual spam you caught). A false negative (missed spam) is annoying. A false positive (blocking a real email) can be catastrophic. Tune your bias b to shift the tradeoff. Deploy behind an API — every incoming email gets feature-extracted, then your dot product gives an instant spam/ham verdict.",
      },
      {
        heading: "What You've Actually Built",
        text: "Congratulations — you've just described the architecture of SpamAssassin, Gmail's early filter, and every rule-based classifier from the 2000s. Modern spam filters use transformer models and learn on billions of messages, but they still optimize the same fundamental loss: correctly separating two classes by adjusting weights. You now understand the origin story.",
      },
    ];

    return (
      <main className="min-h-screen bg-[#1e140e] text-[#fefae0] p-4 md:p-8 font-vt323">
        {/* Header */}
        <header className="max-w-4xl mx-auto mb-8 bg-[#281b12] border-4 border-[#5a6e3a] p-4 shadow-[6px_6px_0px_0px_#0f0a07] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-[#386641] text-[#fefae0] font-pixel text-[10px] uppercase px-2 py-1 border border-[#1b3521]">
                Module 01
              </span>
              <h1 className="text-2xl md:text-3xl font-pixel text-[#dda15e] tracking-wider uppercase">
                Applied Project
              </h1>
              <span className="bg-[#5a6e3a] text-[#fefae0] font-pixel text-[10px] px-2 py-1 border border-[#3a5220]">
                NARRATIVE
              </span>
            </div>
            <p className="text-[#a3b18a] text-lg mt-1 font-vt323">
              Building a Spam Classifier with the Perceptron
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
                Excellent work making it this far, human. Now let me show you what a real perceptron looks like in the wild.
                We&apos;re going to design a <span className="text-[#dda15e]">spam email classifier</span> — step by step,
                in plain English. No checkboxes, no buttons. Just the architecture in your head.
              </p>
            </div>
          </div>

          {/* Steps */}
          {byteLines.map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              {/* Step number marker */}
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
                That&apos;s the complete perceptron pipeline. For your actual implementation I&apos;d recommend:
                Python + scikit-learn&apos;s <code className="text-[#dda15e]">Perceptron</code> class,
                <code className="text-[#dda15e]"> TfidfVectorizer</code> for feature extraction,
                and the SpamAssassin public dataset. Start there, then graduate to logistic regression once you hit the
                linearity ceiling. See you in Module 02.
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

  // ── Shared Playground UI (Story + Sandbox + Challenge all render this) ────
  return (
    <main className="min-h-screen bg-[#1e140e] text-[#fefae0] p-4 md:p-8 font-vt323 selection:bg-[#dda15e] selection:text-[#1e140e]">
      {/* Top Header Bar */}
      <header className="max-w-7xl mx-auto mb-6 bg-[#281b12] border-4 border-[#382219] p-4 shadow-[6px_6px_0px_0px_#0f0a07] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-[#386641] text-[#fefae0] font-pixel text-[10px] uppercase px-2 py-1 border border-[#1b3521]">
              Module 01
            </span>
            <h1 className="text-2xl md:text-3xl font-pixel text-[#dda15e] tracking-wider uppercase">
              Perceptron Visualizer
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
            Single-Layer Neural Unit • Linear Binary Classifier • Pure TS Engine
          </p>
        </div>

        <nav className="flex items-center gap-2">
          <Link href="/"
            className="px-3 py-1.5 bg-[#1e140e] hover:bg-[#281b12] text-[#5c3d2e] hover:text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#2e1e14] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            ← Dashboard
          </Link>
          <Link href="/playground/perceptron"
            className="px-3 py-1.5 bg-[#386641] text-[#fefae0] font-pixel text-[10px] uppercase border-2 border-[#1b3521] shadow-[2px_2px_0px_0px_#0f0a07]">
            01. Perceptron
          </Link>
          <Link href="/playground/gradient-descent"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            02. Gradient Descent
          </Link>
          <Link href="/playground/neural-net"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors">
            03. Neural Net
          </Link>
          <UserAuthWidget />
        </nav>
      </header>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Canvas */}
        <div id="story-canvas-area" className="lg:col-span-7 flex flex-col items-center lg:items-start">
          <PerceptronCanvas
            points={points}
            weights={weights}
            onAddPoint={handleAddPoint}
            width={600}
            height={600}
          />
          <MathFormulaPanel module="perceptron" weights={weights} />
        </div>

        {/* Right Column: Controls & Live Readout */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          {/* Challenge Card (only in challenge mode) */}
          {appMode === "challenge" && (
            <ChallengeCard
              challenge={perceptronChallenge}
              metrics={{ stepCount, accuracy: currentAccuracy }}
              isWon={challenge.isWon}
            />
          )}

          {/* Controls Panel */}
          <RetroPanel title="Hyperparameters & Training" borderColor="border-[#382219]">
            <div className="flex flex-col gap-4">
              {/* Learning Rate Slider */}
              <div id="story-lr-slider">
                <RetroSlider
                  label="Learning Rate (η)"
                  min={0.01}
                  max={1.0}
                  step={0.01}
                  value={learningRate}
                  onChange={setLearningRate}
                  displayValue={learningRate.toFixed(2)}
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <div id="story-train-step-btn">
                  <RetroButton
                    variant="primary"
                    onClick={handleTrainStep}
                    disabled={points.length === 0}
                    className="w-full"
                  >
                    Train Step
                  </RetroButton>
                </div>

                <RetroButton
                  variant={isTraining ? "danger" : "accent"}
                  onClick={() => {
                    setIsTraining((prev) => !prev);
                    story.registerAction("train-auto");
                  }}
                  disabled={points.length === 0}
                >
                  {isTraining ? "Stop Auto" : "Train Auto"}
                </RetroButton>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <RetroButton variant="secondary" onClick={handleResetWeights}>
                  Reset Weights
                </RetroButton>
                <RetroButton variant="secondary" onClick={handleClearPoints}>
                  Clear Canvas
                </RetroButton>
              </div>

              {/* Preset Dataset */}
              <div className="pt-3 border-t-2 border-[#382219]">
                <span className="font-pixel text-[10px] text-[#a3b18a] block mb-2 uppercase">
                  Presets
                </span>
                <RetroButton
                  variant="secondary"
                  className="w-full text-[10px]"
                  onClick={loadPresetSeparable}
                >
                  Load Linearly Separable Data
                </RetroButton>
              </div>
            </div>
          </RetroPanel>

          {/* Model Weights & Metrics Readout */}
          <RetroPanel
            title="Live Weight & Bias Readout"
            borderColor="border-[#b37d36]"
          >
            <div id="story-weights-panel" className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#1e140e] p-2 border-2 border-[#382219]">
                  <span className="text-[#a3b18a] block text-sm font-pixel text-[9px]">W1 (X1)</span>
                  <span className="text-[#dda15e] font-vt323 text-2xl font-bold">
                    {weights.w1 >= 0 ? `+${weights.w1.toFixed(4)}` : weights.w1.toFixed(4)}
                  </span>
                </div>
                <div className="bg-[#1e140e] p-2 border-2 border-[#382219]">
                  <span className="text-[#a3b18a] block text-sm font-pixel text-[9px]">W2 (X2)</span>
                  <span className="text-[#dda15e] font-vt323 text-2xl font-bold">
                    {weights.w2 >= 0 ? `+${weights.w2.toFixed(4)}` : weights.w2.toFixed(4)}
                  </span>
                </div>
                <div className="bg-[#1e140e] p-2 border-2 border-[#382219]">
                  <span className="text-[#a3b18a] block text-sm font-pixel text-[9px]">BIAS (b)</span>
                  <span className="text-[#fefae0] font-vt323 text-2xl font-bold">
                    {weights.bias >= 0 ? `+${weights.bias.toFixed(4)}` : weights.bias.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-[#1e140e] p-3 border-2 border-[#382219] space-y-2 text-xl">
                <div className="flex justify-between items-center">
                  <span className="text-[#a3b18a]">Total Samples:</span>
                  <span className="text-[#fefae0] font-bold">{points.length} points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#a3b18a]">Training Steps:</span>
                  <span className="text-[#dda15e] font-bold">{stepCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#a3b18a]">Accuracy:</span>
                  <span className={`font-bold ${
                    currentAccuracy === 100 ? "text-[#a3b18a]"
                    : currentAccuracy >= 75 ? "text-[#dda15e]"
                    : "text-[#bc4749]"
                  }`}>
                    {currentAccuracy}%
                  </span>
                </div>
              </div>

              {/* Formula display */}
              <div className="bg-[#1e140e] p-2.5 border-2 border-[#382219] text-lg text-[#a3b18a] leading-relaxed">
                <p className="text-[#dda15e] font-pixel text-[9px] uppercase mb-1">
                  Decision Equation:
                </p>
                <code className="font-vt323 text-xl text-[#fefae0]">
                  {weights.w1.toFixed(2)}·x₁ + {weights.w2.toFixed(2)}·x₂ + {weights.bias.toFixed(2)} = 0
                </code>
              </div>
            </div>
          </RetroPanel>
        </div>
      </div>

      {/* ── Story Mode Dialogue Overlay ───────────────────────────────────── */}
      {appMode === "story" && story.currentStep && (
        <NPCDialogueBox
          step={story.currentStep}
          script={perceptronWalkthrough}
          stepIndex={story.state.currentStepIndex}
          totalSteps={perceptronWalkthrough.steps.length}
          actionCount={story.state.actionCount}
          onNext={() => {
            if (story.state.currentStepIndex === perceptronWalkthrough.steps.length - 1) {
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
          challenge={perceptronChallenge}
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
