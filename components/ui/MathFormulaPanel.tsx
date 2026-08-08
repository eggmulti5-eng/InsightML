"use client";

import React from "react";
import { RetroPanel } from "@/components/ui/RetroPanel";
import { LossPreset } from "@/modules/gradient-descent/types";
import { PRESETS } from "@/lib/ml/gradientDescent";

interface PerceptronFormulaProps {
  module: "perceptron";
  weights: { w1: number; w2: number; bias: number };
}

interface GradientDescentFormulaProps {
  module: "gradient-descent";
  preset: LossPreset;
  learningRate: number;
}

interface NeuralNetFormulaProps {
  module: "neural-net";
  hiddenSize?: number;
  numHiddenLayers?: number;
}

export type MathFormulaPanelProps =
  | PerceptronFormulaProps
  | GradientDescentFormulaProps
  | NeuralNetFormulaProps;

export const MathFormulaPanel: React.FC<MathFormulaPanelProps> = (props) => {
  return (
    <RetroPanel
      title="📐 Mathematical Formula"
      borderColor="border-[#382219]"
      className="mt-4 w-full max-w-[600px] text-left"
    >
      {props.module === "perceptron" && (
        <div className="flex flex-col gap-2 text-lg">
          <div className="flex justify-between items-center">
            <span className="text-[#dda15e] font-pixel text-[9px] uppercase tracking-wider">
              Decision Boundary Equation:
            </span>
            <span className="font-pixel text-[8px] text-[#a3b18a] bg-[#1e140e] px-2 py-0.5 border border-[#382219]">
              w₁·x₁ + w₂·x₂ + b = 0
            </span>
          </div>

          <div className="bg-[#1e140e] p-2.5 border-2 border-[#382219] font-vt323 text-xl leading-snug">
            <span className="text-[#a3b18a] font-pixel text-[8px] block mb-1 uppercase">
              Live Substituted Equation:
            </span>
            <code className="text-[#fefae0] font-bold text-2xl tracking-wide">
              ({props.weights.w1 >= 0 ? `+${props.weights.w1.toFixed(2)}` : props.weights.w1.toFixed(2)})·x₁ + ({props.weights.w2 >= 0 ? `+${props.weights.w2.toFixed(2)}` : props.weights.w2.toFixed(2)})·x₂ + ({props.weights.bias >= 0 ? `+${props.weights.bias.toFixed(2)}` : props.weights.bias.toFixed(2)}) = 0
            </code>
          </div>
        </div>
      )}

      {props.module === "gradient-descent" && (
        <div className="flex flex-col gap-2 text-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-[#1e140e] p-2 border-2 border-[#382219]">
              <span className="text-[#dda15e] font-pixel text-[8px] uppercase tracking-wider block mb-0.5">
                Loss Surface f(x, y):
              </span>
              <code className="font-vt323 text-xl text-[#fefae0]">
                {getSurfaceFormula(props.preset)}
              </code>
            </div>

            <div className="bg-[#1e140e] p-2 border-2 border-[#382219]">
              <span className="text-[#dda15e] font-pixel text-[8px] uppercase tracking-wider block mb-0.5">
                Update Rule:
              </span>
              <code className="font-vt323 text-xl text-[#dda15e]">
                w{"_{t+1}"} = w_t − η · ∇L
              </code>
            </div>
          </div>

          <div className="bg-[#18110b] px-3 py-1.5 border border-[#382219] flex justify-between items-center text-base">
            <span className="text-[#a3b18a] font-pixel text-[8px] uppercase">Active Surface: {PRESETS[props.preset]?.name || props.preset}</span>
            <span className="text-[#fefae0] font-vt323 text-lg">
              Live Learning Rate: <strong className="text-[#dda15e]">η = {props.learningRate.toFixed(3)}</strong>
            </span>
          </div>
        </div>
      )}

      {props.module === "neural-net" && (
        <div className="flex flex-col gap-2 text-lg">
          <div className="flex justify-between items-center">
            <span className="text-[#dda15e] font-pixel text-[9px] uppercase tracking-wider">
              Forward Pass Formulation:
            </span>
            {props.hiddenSize && (
              <span className="font-pixel text-[8px] text-[#a3b18a] bg-[#1e140e] px-2 py-0.5 border border-[#382219]">
                Arch: 2 → {props.hiddenSize}{props.numHiddenLayers === 2 ? ` → ${props.hiddenSize}` : ""} → 1
              </span>
            )}
          </div>

          <div className="bg-[#1e140e] p-2.5 border-2 border-[#382219]">
            <code className="font-vt323 text-2xl text-[#fefae0] block text-center">
              output = σ( W₂ · σ( W₁ · x + b₁ ) + b₂ )
            </code>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center text-xs font-vt323">
            <div className="bg-[#18110b] p-1 border border-[#382219]">
              <span className="text-[#dda15e] font-pixel text-[8px] block">W₁, W₂</span>
              <span className="text-[#a3b18a]">Weights</span>
            </div>
            <div className="bg-[#18110b] p-1 border border-[#382219]">
              <span className="text-[#dda15e] font-pixel text-[8px] block">b₁, b₂</span>
              <span className="text-[#a3b18a]">Biases</span>
            </div>
            <div className="bg-[#18110b] p-1 border border-[#382219]">
              <span className="text-[#dda15e] font-pixel text-[8px] block">σ(·)</span>
              <span className="text-[#a3b18a]">Activation</span>
            </div>
            <div className="bg-[#18110b] p-1 border border-[#382219]">
              <span className="text-[#dda15e] font-pixel text-[8px] block">x → output</span>
              <span className="text-[#a3b18a]">Input/Prediction</span>
            </div>
          </div>
        </div>
      )}
    </RetroPanel>
  );
};

function getSurfaceFormula(preset: LossPreset): string {
  if (PRESETS[preset]) {
    return PRESETS[preset].formula;
  }
  switch (preset) {
    case "bowl":
      return "f(x, y) = x² + y²";
    case "valley":
      return "f(x, y) = 0.5·x² + 2.5·y²";
    case "saddle":
      return "f(x, y) = 0.5·x² − 0.5·y² + 0.05·y⁴ + 1";
    default:
      return "f(x, y)";
  }
}
