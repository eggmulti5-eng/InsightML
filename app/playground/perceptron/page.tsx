"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { PerceptronCanvas } from "@/components/canvas/PerceptronCanvas";
import { RetroButton } from "@/components/ui/RetroButton";
import { RetroSlider } from "@/components/ui/RetroSlider";
import { RetroPanel } from "@/components/ui/RetroPanel";
import {
  DataPoint,
  PerceptronWeights,
  initRandomWeights,
  trainEpoch,
  calculateAccuracy,
} from "@/lib/ml/perceptron";

export default function PerceptronPlayground() {
  const [points, setPoints] = useState<DataPoint[]>([]);
  const [weights, setWeights] = useState<PerceptronWeights>(initRandomWeights());
  const [learningRate, setLearningRate] = useState<number>(0.1);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [stepCount, setStepCount] = useState<number>(0);

  const trainingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add Point
  const handleAddPoint = (newPoint: DataPoint) => {
    setPoints((prev) => [...prev, newPoint]);
  };

  // Run a single training epoch across all current points
  const handleTrainStep = useCallback(() => {
    if (points.length === 0) return;
    setWeights((prevWeights) => trainEpoch(points, prevWeights, learningRate));
    setStepCount((prev) => prev + 1);
  }, [points, learningRate]);

  // Handle continuous training toggle (runs every 300ms)
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
      if (trainingIntervalRef.current) {
        clearInterval(trainingIntervalRef.current);
      }
    };
  }, [isTraining, handleTrainStep]);

  // Reset Weights
  const handleResetWeights = () => {
    setWeights(initRandomWeights());
    setStepCount(0);
  };

  // Clear All Points
  const handleClearPoints = () => {
    setPoints([]);
    setStepCount(0);
    setIsTraining(false);
  };

  // Preset Dataset: Linearly Separable
  const loadPresetSeparable = () => {
    setIsTraining(false);
    setStepCount(0);
    setPoints([
      { id: "1", x: -0.6, y: 0.6, label: 1 },
      { id: "2", x: -0.4, y: 0.8, label: 1 },
      { id: "3", x: -0.7, y: 0.3, label: 1 },
      { id: "4", x: -0.2, y: 0.5, label: 1 },
      { id: "5", x: 0.5, y: -0.6, label: -1 },
      { id: "6", x: 0.7, y: -0.4, label: -1 },
      { id: "7", x: 0.3, y: -0.7, label: -1 },
      { id: "8", x: 0.6, y: -0.2, label: -1 },
    ]);
  };

  const currentAccuracy = calculateAccuracy(points, weights);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-mono selection:bg-emerald-500 selection:text-zinc-950">
      {/* Top Header Bar */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between border-b-4 border-emerald-500 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-zinc-950 font-bold px-2 py-0.5 text-xs uppercase">
              Module 01
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-emerald-400">
              Perceptron & Decision Boundary
            </h1>
          </div>
          <p className="text-zinc-400 text-xs mt-1">
            Single-Layer Neural Unit • Linear Binary Classifier • Custom Pure TS Engine
          </p>
        </div>

        {/* Module Navigation */}
        <nav className="flex items-center gap-2 text-xs">
          <Link
            href="/playground/perceptron"
            className="px-3 py-1.5 bg-emerald-500 text-zinc-950 font-bold border-2 border-zinc-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase"
          >
            01. Perceptron
          </Link>
          <Link
            href="/playground/gradient-descent"
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold border-2 border-zinc-800 uppercase transition-colors"
          >
            02. Gradient Descent
          </Link>
          <Link
            href="/playground/neural-net"
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold border-2 border-zinc-800 uppercase transition-colors"
          >
            03. Neural Net
          </Link>
        </nav>
      </header>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start">
          <PerceptronCanvas
            points={points}
            weights={weights}
            onAddPoint={handleAddPoint}
            width={600}
            height={600}
          />
        </div>

        {/* Right Column: Controls & Live Readout */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          {/* Controls Panel */}
          <RetroPanel title="Hyperparameters & Training" borderColor="border-emerald-500">
            <div className="flex flex-col gap-4">
              {/* Learning Rate Slider */}
              <RetroSlider
                label="Learning Rate (η)"
                min={0.01}
                max={1.0}
                step={0.01}
                value={learningRate}
                onChange={setLearningRate}
                displayValue={learningRate.toFixed(2)}
              />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <RetroButton
                  variant="primary"
                  onClick={handleTrainStep}
                  disabled={points.length === 0}
                >
                  Train Step
                </RetroButton>

                <RetroButton
                  variant={isTraining ? "danger" : "accent"}
                  onClick={() => setIsTraining((prev) => !prev)}
                  disabled={points.length === 0}
                >
                  {isTraining ? "Stop Auto" : "Train Continuously"}
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
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-2 uppercase font-bold">Presets</span>
                <RetroButton
                  variant="secondary"
                  className="w-full text-xs"
                  onClick={loadPresetSeparable}
                >
                  Load Linearly Separable Data
                </RetroButton>
              </div>
            </div>
          </RetroPanel>

          {/* Model Weights & Metrics Readout */}
          <RetroPanel title="Live Weight & Bias Readout" borderColor="border-amber-500">
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-950 p-2 border border-zinc-800">
                  <span className="text-zinc-500 block">W1 (X1)</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {weights.w1 >= 0 ? `+${weights.w1.toFixed(4)}` : weights.w1.toFixed(4)}
                  </span>
                </div>
                <div className="bg-zinc-950 p-2 border border-zinc-800">
                  <span className="text-zinc-500 block">W2 (X2)</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {weights.w2 >= 0 ? `+${weights.w2.toFixed(4)}` : weights.w2.toFixed(4)}
                  </span>
                </div>
                <div className="bg-zinc-950 p-2 border border-zinc-800">
                  <span className="text-zinc-500 block">BIAS (b)</span>
                  <span className="text-amber-400 font-bold text-sm">
                    {weights.bias >= 0 ? `+${weights.bias.toFixed(4)}` : weights.bias.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-zinc-950 p-3 border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Total Samples:</span>
                  <span className="text-zinc-100 font-bold">{points.length} points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Training Steps:</span>
                  <span className="text-amber-400 font-bold">{stepCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Classification Accuracy:</span>
                  <span
                    className={`font-bold ${
                      currentAccuracy === 100
                        ? "text-emerald-400"
                        : currentAccuracy >= 75
                        ? "text-amber-400"
                        : "text-red-400"
                    }`}
                  >
                    {currentAccuracy}%
                  </span>
                </div>
              </div>

              {/* Formula display */}
              <div className="bg-zinc-950/70 p-2 border border-zinc-900 text-[11px] text-zinc-500 leading-relaxed font-mono">
                <p className="text-zinc-400 font-bold mb-0.5">Decision Equation:</p>
                <code>
                  {weights.w1.toFixed(2)}·x₁ + {weights.w2.toFixed(2)}·x₂ + {weights.bias.toFixed(2)} = 0
                </code>
              </div>
            </div>
          </RetroPanel>
        </div>
      </div>
    </main>
  );
}
