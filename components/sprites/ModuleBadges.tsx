"use client";

/**
 * ModuleBadges — three 16×16 pixel-art icon sprites for module cards.
 *
 * Each badge is a PixelSprite (SVG of <rect> elements) representing:
 *  - PerceptronBadge   : a single neuron node with two input lines and a weight dot
 *  - GradientBadge     : a descending staircase / loss curve with a ball marker
 *  - NeuralNetBadge    : a 2-3-1 network of nodes connected by lines
 *
 * Colors stay within the warm amber/green/brown theme of InsightML.
 */

import React from "react";
import { PixelSprite } from "./PixelSprite";

// ── Shared palette ─────────────────────────────────────────────────────────────
const _ = null;        // transparent

// ─────────────────────────────────────────────────────────────────────────────
// PERCEPTRON BADGE — 16×16
// A single circular node (center) with two input lines from the left and one
// output line to the right, plus a decision boundary marker.
// Accent: forest green #386641
// ─────────────────────────────────────────────────────────────────────────────
const P_0 = "#386641"; // dark green node fill
const P_1 = "#4a7c59"; // mid green node rim
const P_2 = "#7ecb8a"; // light green glow / output
const P_3 = "#2a5232"; // dim wire
const P_4 = "#1e4023"; // dark wire shadow
const P_5 = "#dda15e"; // amber highlight

const PERCEPTRON_GRID: (string | null)[][] = [
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 0
  [_,  _,  P_3,P_3,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 1 — top-left input wire start
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
  [_,  _,  _,  _,  _,  P_4,P_3,P_3,P_3,P_3,P_4,_,  _,  _,  _,  _],  // 12 — decision boundary
  [_,  _,  _,  _,  _,  P_3,_,  _,  _,  _,  P_3,_,  _,  _,  _,  _],  // 13
  [_,  _,  _,  _,  _,  P_4,P_3,P_3,P_3,P_3,P_4,_,  _,  _,  _,  _],  // 14
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 15
];

// ─────────────────────────────────────────────────────────────────────────────
// GRADIENT DESCENT BADGE — 16×16
// A descending staircase loss curve with a rolling ball marker at the bottom.
// Accent: amber #dda15e
// ─────────────────────────────────────────────────────────────────────────────
const G_0 = "#dda15e"; // amber — curve / ball
const G_1 = "#b37d36"; // darker amber — shadow / axis
const G_2 = "#7a5225"; // deep amber — axis line
const G_3 = "#fefae0"; // near-white ball highlight
const G_4 = "#4a7c59"; // green — minimum marker

const GRADIENT_GRID: (string | null)[][] = [
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 0
  [_,  G_2,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 1 — Y-axis top
  [_,  G_2,G_0,G_0,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 2 — high loss
  [_,  G_2,_,  _,  G_1,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 3
  [_,  G_2,_,  _,  G_0,G_0,_,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 4 — step down
  [_,  G_2,_,  _,  _,  _,  G_1,_,  _,  _,  _,  _,  _,  _,  _,  _],  // 5
  [_,  G_2,_,  _,  _,  _,  G_0,G_0,_,  _,  _,  _,  _,  _,  _,  _],  // 6 — step down
  [_,  G_2,_,  _,  _,  _,  _,  _,  G_1,_,  _,  _,  _,  _,  _,  _],  // 7
  [_,  G_2,_,  _,  _,  _,  _,  _,  G_0,G_0,_,  _,  _,  _,  _,  _],  // 8 — step down
  [_,  G_2,_,  _,  _,  _,  _,  _,  _,  _,  G_1,_,  _,  _,  _,  _],  // 9
  [_,  G_2,_,  _,  _,  _,  _,  _,  _,  _,  G_0,G_0,G_0,_,  _,  _],  // 10 — minimum plateau
  [_,  G_2,_,  _,  _,  _,  _,  _,  _,  G_3,G_0,G_3,_,  _,  _,  _],  // 11 — ball at min
  [_,  G_2,_,  _,  _,  _,  _,  _,  _,  G_0,G_4,G_0,_,  _,  _,  _],  // 12 — ball (green core = found min)
  [_,  G_2,_,  _,  _,  _,  _,  _,  _,  _,  G_0,_,  _,  _,  _,  _],  // 13
  [_,  G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_2,G_2,_],  // 14 — X-axis
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 15
];

// ─────────────────────────────────────────────────────────────────────────────
// NEURAL NET BADGE — 16×16
// A 2-3-1 network:  2 input nodes | 3 hidden nodes | 1 output node
// with connecting lines. Accent: rose/red #bc4749
// ─────────────────────────────────────────────────────────────────────────────
const N_0 = "#bc4749"; // rose-red — output node
const N_1 = "#8b2f30"; // dark red — output shadow
const N_2 = "#dda15e"; // amber — hidden nodes
const N_3 = "#b37d36"; // darker amber — hidden shadow
const N_4 = "#4a7c59"; // green — input nodes
const N_5 = "#386641"; // dark green — input shadow
const N_6 = "#3e271c"; // dim wire
const N_7 = "#5c3d2e"; // slightly brighter wire

const NEURAL_GRID: (string | null)[][] = [
  [_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 0
  [_,  N_5,N_4,N_5,_,  N_6,_,  N_3,N_2,N_3,_,  N_6,_,  _,  _,  _],  // 1 — top: in1 + hid1 (partial)
  [_,  N_4,N_4,N_4,_,  N_6,N_2,N_2,N_2,N_2,N_3,N_6,_,  _,  _,  _],  // 2 — in1 filled + hid1 top
  [_,  N_5,N_4,N_5,N_6,N_2,N_2,_,  _,  N_2,N_2,N_7,_,  N_1,N_0,N_1],  // 3 — wires + out node
  [_,  _,  _,  N_6,N_2,_,  _,  _,  _,  _,  N_3,_,  N_6,N_0,N_0,N_0],  // 4 — output node mid
  [_,  _,  N_6,N_2,_,  _,  N_3,N_2,N_3,_,  _,  N_7,N_6,N_1,N_0,N_1],  // 5 — hid2 top + wires
  [_,  _,  N_6,N_2,_,  N_2,N_2,N_2,N_2,N_2,_,  N_7,_,  _,  _,  _],  // 6 — hid2 filled
  [_,  N_5,N_4,N_5,N_6,N_2,_,  _,  _,  N_2,N_2,N_7,_,  _,  _,  _],  // 7 — in2 top + hid2 bottom
  [_,  N_4,N_4,N_4,_,  N_6,_,  _,  _,  N_2,N_2,N_7,_,  _,  _,  _],  // 8 — in2 mid
  [_,  N_5,N_4,N_5,_,  _,  N_7,_,  _,  _,  N_7,_,  _,  _,  _,  _],  // 9 — in2 bottom + wires
  [_,  _,  _,  _,  N_7,_,  _,  _,  _,  _,  _,  _,  _,  _,  _,  _],  // 10
  [_,  _,  _,  _,  _,  N_7,N_3,N_2,N_3,_,  _,  _,  _,  _,  _,  _],  // 11 — hid3 top
  [_,  _,  _,  _,  _,  N_2,N_2,N_2,N_2,N_2,_,  _,  _,  _,  _,  _],  // 12 — hid3 filled
  [_,  _,  _,  _,  _,  N_7,N_3,N_2,N_3,_,  N_7,_,  _,  _,  _,  _],  // 13 — hid3 bottom + wire
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
