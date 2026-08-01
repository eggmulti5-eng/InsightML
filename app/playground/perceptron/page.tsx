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
          </div>
          <p className="text-[#a3b18a] text-lg mt-1 font-vt323">
            Single-Layer Neural Unit • Linear Binary Classifier • Pure TS Engine
          </p>
        </div>

        {/* Module Navigation */}
        <nav className="flex items-center gap-2">
          <Link
            href="/playground/perceptron"
            className="px-3 py-1.5 bg-[#386641] text-[#fefae0] font-pixel text-[10px] uppercase border-2 border-[#1b3521] shadow-[2px_2px_0px_0px_#0f0a07]"
          >
            01. Perceptron
          </Link>
          <Link
            href="/playground/gradient-descent"
            className="px-3 py-1.5 bg-[#3e271c] hover:bg-[#5c3d2e] text-[#a3b18a] font-pixel text-[10px] uppercase border-2 border-[#1e140e] shadow-[2px_2px_0px_0px_#0f0a07] transition-colors"
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
          <RetroPanel title="Hyperparameters & Training" borderColor="border-[#382219]">
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
          <RetroPanel title="Live Weight & Bias Readout" borderColor="border-[#b37d36]">
            <div className="space-y-3">
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
                  <span
                    className={`font-bold ${
                      currentAccuracy === 100
                        ? "text-[#a3b18a]"
                        : currentAccuracy >= 75
                        ? "text-[#dda15e]"
                        : "text-[#bc4749]"
                    }`}
                  >
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
    </main>
  );
}
