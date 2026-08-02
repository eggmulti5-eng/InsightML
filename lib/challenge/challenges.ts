import { ChallengeDefinition } from "./types";

// ─── Perceptron: Speed Classifier ───────────────────────────────────────────

export const perceptronChallenge: ChallengeDefinition = {
  id: "speed-classifier",
  module: "perceptron",
  title: "Speed Classifier",
  description:
    "Reach 100% classification accuracy in as few training steps as possible. Place clearly separable points, pick a good learning rate, and train!",
  goalSummary: "100% accuracy • fewer steps = more ★",
  nextChallengeUrl: "/playground/gradient-descent",

  checkWin: (m) => m.stepCount > 0 && (m.accuracy ?? 0) >= 100,

  getStars: (m) => {
    if (m.stepCount <= 3) return 3;
    if (m.stepCount <= 5) return 2;
    return 1;
  },

  getProgressLabel: (m) =>
    `Accuracy: ${m.accuracy ?? 0}%  •  Steps: ${m.stepCount}`,

  getProgressPercent: (m) => m.accuracy ?? 0,
};

// ─── Gradient Descent: Steady Descent ───────────────────────────────────────

export const gradientDescentChallenge: ChallengeDefinition = {
  id: "steady-descent",
  module: "gradient-descent",
  title: "Steady Descent",
  description:
    "Reach loss below 0.05 without the loss EVER increasing between consecutive steps. Pick a safe learning rate and a friendly surface!",
  goalSummary: "Loss < 0.05 • no overshooting = more ★",
  nextChallengeUrl: "/playground/neural-net",

  checkWin: (m) => m.stepCount > 0 && (m.currentLoss ?? Infinity) < 0.05,

  getStars: (m) => {
    const history = m.lossHistory ?? [];
    const hasFluctuation = history.some(
      (loss, i) => i > 0 && loss > history[i - 1] + 0.001
    );
    if (!hasFluctuation && m.stepCount < 15) return 3;
    if (!hasFluctuation) return 2;
    return 1;
  },

  getProgressLabel: (m) => {
    const loss = m.currentLoss != null ? m.currentLoss.toFixed(4) : "—";
    const history = m.lossHistory ?? [];
    const steady = !history.some(
      (l, i) => i > 0 && l > history[i - 1] + 0.001
    );
    return `Loss: ${loss}  •  Steps: ${m.stepCount}  •  Steady: ${steady ? "✓" : "✗"}`;
  },

  getProgressPercent: (m) => {
    const startLoss = (m.lossHistory ?? [])[0] ?? 10;
    const current = m.currentLoss ?? startLoss;
    if (startLoss <= 0.05) return 100;
    return Math.min(100, Math.max(0, ((startLoss - current) / (startLoss - 0.05)) * 100));
  },
};

// ─── Neural Net: Minimal Network ────────────────────────────────────────────

export const neuralNetChallenge: ChallengeDefinition = {
  id: "minimal-network",
  module: "neural-net",
  title: "Minimal Network",
  description:
    "Solve the XOR pattern to 100% accuracy using only 2 hidden nodes in 1 layer. It's possible — but tricky! You may need to retry a few times.",
  goalSummary: "100% accuracy • 2 nodes, 1 layer • speed = more ★",
  nextChallengeUrl: "/playground/perceptron",

  checkWin: (m) =>
    m.stepCount > 0 &&
    (m.nnAccuracy ?? 0) >= 100 &&
    (m.hiddenSize ?? 4) === 2 &&
    (m.numHiddenLayers ?? 1) === 1,

  getStars: (m) => {
    if (m.stepCount < 100) return 3;
    if (m.stepCount < 300) return 2;
    return 1;
  },

  getProgressLabel: (m) => {
    const acc = m.nnAccuracy ?? 0;
    const nodes = m.hiddenSize ?? "?";
    const layers = m.numHiddenLayers ?? "?";
    return `Accuracy: ${acc}%  •  ${nodes} nodes × ${layers} layer  •  Steps: ${m.stepCount}`;
  },

  getProgressPercent: (m) => m.nnAccuracy ?? 0,
};
