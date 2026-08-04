"use client";

/**
 * ModuleBadges — three 16×16 pixel-art icon sprites for module cards.
 *
 * Each badge is a PixelSprite (SVG of <rect> elements) representing:
 *  - PerceptronBadge   : a single neuron node with input lines and decision boundary
 *  - GradientBadge     : a descending staircase / loss curve with a ball marker at minimum
 *  - NeuralNetBadge    : a 2-3-1 network of nodes connected by lines
 *
 * Colors stay within the warm amber/green/brown theme of InsightML.
 */

import React from "react";
import { PixelSprite } from "./PixelSprite";

// ── Shared palette shorthand ──────────────────────────────────────────────────
const _ = null;        // transparent

// ─────────────────────────────────────────────────────────────────────────────
// PERCEPTRON BADGE — 16×16
// A single circular node (center) with two input lines from the left and one
// output line to the right, plus a decision boundary marker.
// Accent: forest green #386641 & amber #dda15e
// ─────────────────────────────────────────────────────────────────────────────
const P_0 = "#386641"; // dark green node fill
const P_1 = "#4a7c59"; // mid green node rim
const P_2 = "#7ecb8a"; // light green glow / output
const P_3 = "#2a5232"; // dim wire
const P_4 = "#1e4023"; // dark wire shadow
const P_5 = "#dda15e"; // amber highlight

const PERCEPTRON_GRID: (string | null)[][] = [
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 0
  [_,  _,  P_3,P_3,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 1 — top input wire start
  [_,  P_3,P_4,P_3,P_3,P_3,_,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 2
  [P_3,P_4,P_3,_,  _,  P_4,P_3,_,  _,  _,  _,  _,  _,  _,  _,  _],  // 3
  [_,  _,  _,  _,  _,  P_3,P_1,P_0,P_0,P_1,_,  _,  P_2,P_2,_,  _],  // 4 — node top + output wire
  [_,  _,  _,  _,  _,  P_1,P_0,P_5,P_0,P_0,P_1,_,  P_2,P_2,P_2,_],  // 5 — node with amber core
  [_,  _,  _,  _,  _,  P_1,P_0,P_0,P_0,P_0,P_1,P_2,P_2,_,  _,  _],  // 6 — node bottom half
  [_,  _,  _,  _,  _,  P_3,P_1,P_0,P_0,P_1,_,  _,  _,  _,  _,  _],  // 7
  [P_3,P_4,P_3,_,  _,  P_4,P_3,_,  _,  _,  _,  _,  _,  _,  _,  _],  // 8 — bottom input wire
  [_,  P_3,P_4,P_3,P_3,P_3,_,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 9
  [_,  _,  P_3,P_3,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 10
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 11
  [_,  _,  _,  _,  _,  P_4,P_3,P_3,P_3,P_3,P_4,_,  _,  _,  _,  _],  // 12 — decision boundary line
  [_,  _,  _,  _,  _,  P_3,_,  _,  _,  _,  P_3,_,  _,  _,  _,  _],  // 13
  [_,  _,  _,  _,  _,  P_4,P_3,P_3,P_3,P_3,P_4,_,  _,  _,  _,  _],  // 14
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 15
];

// ─────────────────────────────────────────────────────────────────────────────
// GRADIENT DESCENT BADGE — 16×16
// Descending staircase / loss curve on X-Y axes with a rolling ball marker
// converging at the global minimum.
// Palette: G_0 (amber), G_1 (mid amber), G_2 (dark axis), G_3 (white spark),
//          G_4 (green minimum marker), G_5 (dim axis tick)
// ─────────────────────────────────────────────────────────────────────────────
const G_0 = "#dda15e"; // amber — loss curve & ball
const G_1 = "#b37d36"; // mid amber — step edge & shadow
const G_2 = "#7a5225"; // deep amber/brown — main axis line
const G_3 = "#fefae0"; // near-white — ball top highlight
const G_4 = "#4a7c59"; // forest green — found minimum core
const G_5 = "#3a2512"; // dim background axis shadow

const GRADIENT_GRID: (string | null)[][] = [
  [_,  G_1,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 0 — Y-axis top arrow
  [_,  G_2,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 1 — Y-axis line
  [_,  G_2,G_0,G_0,G_0,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 2 — high loss starting step
  [_,  G_2,_,  _,  G_1,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 3 — step down line
  [_,  G_2,_,  _,  G_0,G_0,G_0,_,  _,  _,  _,  _,  _,  _,  _,  _],  // 4 — second step
  [_,  G_2,_,  _,  _,  _,  G_1,_,  _,  _,  _,  _,  _,  _,  _,  _],  // 5 — step down line
  [_,  G_2,_,  _,  _,  _,  G_0,G_0,G_0,_,  _,  _,  _,  _,  _,  _],  // 6 — third step
  [_,  G_2,_,  _,  _,  _,  _,  _,  G_1,_,  G_3,_,  _,  _,  _,  _],  // 7 — step down line + ball top
  [_,  G_2,_,  _,  _,  _,  _,  _,  G_0,G_3,G_4,G_3,_,  _,  _,  _],  // 8 — ball with green core (found min)
  [_,  G_2,_,  _,  _,  _,  _,  _,  _,  G_0,G_0,G_0,_,  _,  _,  _],  // 9 — ball base on plateau
  [_,  G_2,_,  _,  _,  _,  _,  _,  _,  G_0,G_0,G_0,G_0,G_0,_,  _],  // 10 — minimum plateau floor
  [_,  G_2,_,  _,  _,  _,  _,  _,  _,  G_1,G_1,G_1,G_1,G_1,_,  _],  // 11 — plateau shadow line
  [_,  G_2,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 12
  [_,  G_2,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 13
  [_,  G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_1,_],  // 14 — X-axis line + arrow
  [_,  G_5,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 15
];

// ─────────────────────────────────────────────────────────────────────────────
// NEURAL NET BADGE — 16×16
// A 2-3-1 network:  2 input nodes | 3 hidden nodes | 1 output node
// with connecting signal lines.
// Palette: N_0, N_1 (rose-red output), N_2, N_3 (amber hidden),
//          N_4, N_5 (green input), N_6 (wire), N_7 (bright pulse)
// ─────────────────────────────────────────────────────────────────────────────
const N_0 = "#bc4749"; // rose-red — output node center
const N_1 = "#8b2f30"; // dark rose — output node rim
const N_2 = "#dda15e"; // amber — hidden node center
const N_3 = "#b37d36"; // dark amber — hidden node rim
const N_4 = "#4a7c59"; // green — input node center
const N_5 = "#386641"; // dark green — input node rim
const N_6 = "#5c3d2e"; // connector wire line
const N_7 = "#a3b18a"; // active signal pulse pixel

const NEURAL_GRID: (string | null)[][] = [
  [_,  _,  _,  _,  _,  _,  _,  N_3,N_2,N_3,_,  _,  _,  _,  _,  _],  // 0 — Hidden 1 node top
  [_,  N_5,N_4,N_5,_,  N_6,N_2,N_2,N_2,N_2,N_3,N_6,_,  _,  _,  _],  // 1 — Input 1 top + Hidden 1 mid
  [_,  N_4,N_4,N_4,N_6,N_6,_,  N_3,N_2,N_3,_,  N_6,N_6,_,  _,  _],  // 2 — Input 1 core + wires
  [_,  N_5,N_4,N_5,_,  _,  N_6,_,  _,  _,  N_6,_,  _,  N_6,_,  _],  // 3 — Input 1 bottom + diagonal wires
  [_,  _,  _,  _,  N_6,_,  _,  _,  _,  _,  _,  N_6,_,  _,  _,  _],  // 4 — Wires crossing
  [_,  _,  _,  _,  _,  N_6,_,  N_3,N_2,N_3,_,  _,  N_6,_,  _,  _],  // 5 — Hidden 2 top
  [_,  _,  _,  _,  N_6,_,  N_2,N_2,N_2,N_2,N_3,N_7,_,  N_1,N_0,N_1],// 6 — Hidden 2 core + Output top
  [_,  _,  _,  N_6,_,  _,  _,  N_3,N_2,N_3,_,  _,  N_7,N_0,N_0,N_0],// 7 — Hidden 2 bottom + Output core
  [_,  _,  _,  _,  N_6,_,  _,  _,  _,  _,  _,  N_6,_,  N_1,N_0,N_1],// 8 — Output bottom
  [_,  _,  _,  _,  _,  N_6,_,  _,  _,  _,  N_6,_,  _,  _,  _,  _],  // 9 — Wires crossing
  [_,  N_5,N_4,N_5,_,  _,  N_6,_,  _,  N_6,_,  _,  N_6,_,  _,  _],  // 10 — Input 2 top
  [_,  N_4,N_4,N_4,N_6,N_6,_,  N_3,N_2,N_3,_,  N_6,_,  _,  _,  _],  // 11 — Input 2 core + Hidden 3 top
  [_,  N_5,N_4,N_5,_,  N_6,N_2,N_2,N_2,N_2,N_3,_,  _,  _,  _,  _],  // 12 — Input 2 bottom + Hidden 3 core
  [_,  _,  _,  _,  _,  _,  _,  N_3,N_2,N_3,_,  _,  _,  _,  _,  _],  // 13 — Hidden 3 bottom
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 14
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 15
];

// ── Public components ──────────────────────────────────────────────────────────

interface BadgeProps {
  /** CSS pixel size of each grid cell. Default: 2 → renders 32×32px. */
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const PerceptronBadge: React.FC<BadgeProps> = ({
  scale = 2,
  className = "",
  style = {},
}) => (
  <PixelSprite
    grid={PERCEPTRON_GRID}
    scale={scale}
    className={className}
    style={style}
    aria-label="Perceptron icon: single neuron with inputs and decision boundary"
  />
);

export const GradientBadge: React.FC<BadgeProps> = ({
  scale = 2,
  className = "",
  style = {},
}) => (
  <PixelSprite
    grid={GRADIENT_GRID}
    scale={scale}
    className={className}
    style={style}
    aria-label="Gradient Descent icon: descending loss curve with a ball at the minimum"
  />
);

export const NeuralNetBadge: React.FC<BadgeProps> = ({
  scale = 2,
  className = "",
  style = {},
}) => (
  <PixelSprite
    grid={NEURAL_GRID}
    scale={scale}
    className={className}
    style={style}
    aria-label="Neural Network icon: 2-3-1 layered network of nodes"
  />
);
