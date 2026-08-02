// ─── Challenge Mode Type System ─────────────────────────────────────────────
// Pure TypeScript — no DOM or React imports here.

export type ChallengeModule = "perceptron" | "gradient-descent" | "neural-net";

/**
 * Bag of metrics that each module page populates for the challenge system.
 * Different challenges read different subsets of these fields.
 */
export interface ChallengeMetrics {
  /** Number of training steps taken since last reset. */
  stepCount: number;

  // ── Perceptron ──
  /** Classification accuracy (0–100). */
  accuracy?: number;

  // ── Gradient Descent ──
  /** Current loss value. */
  currentLoss?: number;
  /** Full loss history (index 0 = initial loss before any steps). */
  lossHistory?: number[];

  // ── Neural Net ──
  /** Latest NN training loss (null if untrained). */
  nnLoss?: number | null;
  /** NN classification accuracy (0–100). */
  nnAccuracy?: number;
  /** Nodes per hidden layer. */
  hiddenSize?: number;
  /** Number of hidden layers. */
  numHiddenLayers?: number;
}

/**
 * Definition of a single challenge.
 */
export interface ChallengeDefinition {
  /** Unique identifier. */
  id: string;
  /** Which module this challenge belongs to. */
  module: ChallengeModule;
  /** Display title (e.g. "Speed Classifier"). */
  title: string;
  /** Full description shown on the challenge card. */
  description: string;
  /** Short one-liner for the goal (shown in progress area). */
  goalSummary: string;
  /** Returns true when the challenge is won. */
  checkWin: (metrics: ChallengeMetrics) => boolean;
  /** Returns 1–3 star rating based on performance. */
  getStars: (metrics: ChallengeMetrics) => 1 | 2 | 3;
  /** Returns a human-readable progress label. */
  getProgressLabel: (metrics: ChallengeMetrics) => string;
  /** Returns progress percentage (0–100) for the progress bar. */
  getProgressPercent: (metrics: ChallengeMetrics) => number;
  /** URL to navigate to for the next challenge (optional). */
  nextChallengeUrl?: string;
}
