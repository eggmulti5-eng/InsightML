/**
 * ModuleBadge — three 16×16 pixel-art badge icons, one per module.
 *
 * Perceptron:      Two clusters of dots (data points) split by a diagonal
 *                  separator line — the classic perceptron picture.
 * GradientDescent: A ball rolling down a parabolic hill, golden trail behind.
 * NeuralNet:       A 2-input → 2-hidden → 1-output node diagram with edges.
 *
 * All badges are static SVG (no animation needed — ByteSprite handles animation).
 * Colors stay within warm brown/amber/green palette + module accent colors.
 */

import React from "react";
import { PixelSprite } from "./PixelSprite";

// ── Shared palette ────────────────────────────────────────────────────────────
const _ = null;

// ── PERCEPTRON badge: dot clusters + decision line ───────────────────────────
// Green-tinted red dots (class A) + blue-tinted dots (class B) + gold separator
const P_R = "#bc4749"; // red points
const P_B = "#386641"; // green/blue points
const P_L = "#dda15e"; // amber decision line
const P_D = "#1e140e"; // dark bg

const PERCEPTRON_GRID: (string | null)[][] = [
  [P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D],
  [P_D, P_R, P_R, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D],
  [P_D, P_R, P_R, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_L, P_D, P_D, P_D, P_D],
  [P_D, P_D, P_D, P_R, P_R, P_D, P_D, P_D, P_D, P_D, P_L, P_D, P_D, P_D, P_D, P_D],
  [P_D, P_D, P_D, P_R, P_R, P_D, P_D, P_D, P_D, P_L, P_D, P_D, P_D, P_D, P_D, P_D],
  [P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_L, P_D, P_D, P_D, P_D, P_D, P_D, P_D],
  [P_D, P_D, P_D, P_D, P_D, P_R, P_R, P_L, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D],
  [P_D, P_D, P_D, P_D, P_D, P_R, P_L, P_D, P_D, P_D, P_B, P_B, P_D, P_D, P_D, P_D],
  [P_D, P_D, P_D, P_D, P_D, P_L, P_D, P_D, P_D, P_D, P_B, P_B, P_D, P_D, P_D, P_D],
  [P_D, P_D, P_D, P_D, P_L, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_B, P_B, P_D, P_D],
  [P_D, P_D, P_D, P_L, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_B, P_B, P_D, P_D],
  [P_D, P_D, P_L, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D],
  [P_D, P_L, P_D, P_D, P_D, P_D, P_B, P_B, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D],
  [P_L, P_D, P_D, P_D, P_D, P_D, P_B, P_B, P_D, P_D, P_D, P_B, P_B, P_D, P_D, P_D],
  [P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_B, P_B, P_D, P_D, P_D],
  [P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D, P_D],
];

// ── GRADIENT DESCENT badge: hill + ball + trail ───────────────────────────────
const G_H = "#4a7c59"; // hill surface (green)
const G_B = "#dda15e"; // ball (amber)
const G_T = "#b37d36"; // trail (darker amber)
const G_D = "#0d1a10"; // dark green bg
const G_S = "#386641"; // hill shadow

const GRADIENT_GRID: (string | null)[][] = [
  [G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D],
  [G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_B, G_B, G_D],
  [G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_B, G_B, G_D],
  [G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_T, G_D, G_D, G_D, G_D],
  [G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_T, G_D, G_D, G_D, G_D, G_D, G_D],
  [G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_T, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D],
  [G_D, G_D, G_D, G_D, G_D, G_T, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D],
  [G_D, G_D, G_D, G_T, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D],
  [G_D, G_T, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D],
  [G_H, G_H, G_H, G_H, G_H, G_H, G_H, G_H, G_H, G_H, G_H, G_H, G_H, G_H, G_H, G_D],
  [G_S, G_S, G_S, G_S, G_S, G_S, G_S, G_S, G_S, G_S, G_S, G_S, G_S, G_S, G_S, G_D],
  [G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D],
  [G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D],
  [G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D],
  [G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D],
  [G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D, G_D],
];

// ── NEURAL NET badge: 2-2-1 network diagram with edges ───────────────────────
const N_D = "#1a0d0e"; // dark bg
const N_N = "#dda15e"; // node (amber)
const N_E = "#5c3d2e"; // edge (muted brown)
const N_O = "#bc4749"; // output node (red accent)
const N_H = "#6b2123"; // output node dark

const NEURAL_GRID: (string | null)[][] = [
  [N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D],
  [N_D, N_N, N_N, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D],
  [N_D, N_N, N_N, N_E, N_D, N_D, N_D, N_E, N_D, N_D, N_N, N_N, N_D, N_D, N_D, N_D],
  [N_D, N_D, N_D, N_D, N_E, N_D, N_D, N_D, N_D, N_N, N_N, N_D, N_D, N_D, N_D, N_D],
  [N_D, N_D, N_D, N_D, N_D, N_E, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D],
  [N_D, N_D, N_D, N_D, N_D, N_D, N_E, N_D, N_D, N_D, N_D, N_D, N_E, N_D, N_D, N_D],
  [N_D, N_N, N_N, N_E, N_D, N_D, N_D, N_N, N_N, N_D, N_D, N_E, N_D, N_O, N_O, N_D],
  [N_D, N_N, N_N, N_D, N_D, N_D, N_D, N_N, N_N, N_D, N_D, N_E, N_D, N_O, N_O, N_D],
  [N_D, N_D, N_D, N_D, N_D, N_D, N_E, N_D, N_D, N_D, N_D, N_D, N_E, N_D, N_D, N_D],
  [N_D, N_D, N_D, N_D, N_D, N_E, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D],
  [N_D, N_D, N_D, N_D, N_E, N_D, N_D, N_D, N_D, N_N, N_N, N_D, N_D, N_D, N_D, N_D],
  [N_D, N_N, N_N, N_E, N_D, N_D, N_D, N_E, N_D, N_N, N_N, N_D, N_D, N_D, N_D, N_D],
  [N_D, N_N, N_N, N_D, N_D, N_D, N_D, N_D, N_E, N_D, N_D, N_D, N_D, N_D, N_D, N_D],
  [N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D],
  [N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D],
  [N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D, N_D],
];

// ── Public API ────────────────────────────────────────────────────────────────
type ModuleId = "perceptron" | "gradient-descent" | "neural-net";

const BADGE_GRIDS: Record<ModuleId, (string | null)[][]> = {
  "perceptron": PERCEPTRON_GRID,
  "gradient-descent": GRADIENT_GRID,
  "neural-net": NEURAL_GRID,
};

const BADGE_LABELS: Record<ModuleId, string> = {
  "perceptron": "Perceptron badge: data points split by decision line",
  "gradient-descent": "Gradient descent badge: ball rolling down a hill",
  "neural-net": "Neural network badge: 2-2-1 node diagram",
};

interface ModuleBadgeProps {
  moduleId: ModuleId;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ModuleBadge: React.FC<ModuleBadgeProps> = ({
  moduleId,
  scale = 2,
  className = "",
  style = {},
}) => {
  const grid = BADGE_GRIDS[moduleId];
  if (!grid) return null;

  return (
    <PixelSprite
      grid={grid}
      scale={scale}
      className={className}
      style={style}
      aria-label={BADGE_LABELS[moduleId]}
    />
  );
};
