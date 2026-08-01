export interface PerceptronWeights {
  w1: number;
  w2: number;
  bias: number;
}

export interface DataPoint {
  id: string;
  x: number; // Normalized coordinate in [-1, 1]
  y: number; // Normalized coordinate in [-1, 1]
  label: 1 | -1; // 1 = Class A (Red), -1 = Class B (Blue)
}

/**
 * Initializes random weights for 2D inputs plus a bias.
 * Weights are initialized to small random values around 0 (e.g. [-0.5, 0.5]).
 */
export function initRandomWeights(): PerceptronWeights {
  return {
    w1: Number(((Math.random() - 0.5) * 1.5).toFixed(4)),
    w2: Number(((Math.random() - 0.5) * 1.5).toFixed(4)),
    bias: Number(((Math.random() - 0.5) * 1.5).toFixed(4)),
  };
}

/**
 * Computes prediction for a 2D point using current weights and bias.
 * Linear combination: z = w1 * x + w2 * y + bias
 * Activation: Step function -> returns 1 if z >= 0, else -1.
 */
export function predictPoint(point: { x: number; y: number }, weights: PerceptronWeights): 1 | -1 {
  const z = weights.w1 * point.x + weights.w2 * point.y + weights.bias;
  return z >= 0 ? 1 : -1;
}

/**
 * Runs ONE training step on a SINGLE labeled point.
 * Given a labeled point (x, y, label), learning rate (lr), and current weights,
 * calculates the prediction, error = (label - prediction), and returns updated weights.
 * Update formula:
 *   w1 = w1 + lr * (label - prediction) * x
 *   w2 = w2 + lr * (label - prediction) * y
 *   bias = bias + lr * (label - prediction)
 */
export function trainStepSingle(
  point: DataPoint,
  weights: PerceptronWeights,
  learningRate: number
): PerceptronWeights {
  const pred = predictPoint(point, weights);
  const error = point.label - pred; // If pred == label, error is 0

  if (error === 0) {
    return { ...weights };
  }

  return {
    w1: Number((weights.w1 + learningRate * error * point.x).toFixed(4)),
    w2: Number((weights.w2 + learningRate * error * point.y).toFixed(4)),
    bias: Number((weights.bias + learningRate * error).toFixed(4)),
  };
}

/**
 * Runs one full training pass (epoch) over a dataset of labeled points.
 * Iterates through all points, applying trainStepSingle.
 */
export function trainEpoch(
  points: DataPoint[],
  weights: PerceptronWeights,
  learningRate: number
): PerceptronWeights {
  let currentWeights = { ...weights };
  for (const p of points) {
    currentWeights = trainStepSingle(p, currentWeights, learningRate);
  }
  return currentWeights;
}

/**
 * Calculates dataset accuracy (0 to 100%).
 */
export function calculateAccuracy(points: DataPoint[], weights: PerceptronWeights): number {
  if (points.length === 0) return 100;
  let correct = 0;
  for (const p of points) {
    if (predictPoint(p, weights) === p.label) {
      correct++;
    }
  }
  return Math.round((correct / points.length) * 100);
}

/**
 * Helper utilities for 2D Canvas <-> Cartesian Normalized Space [-1, 1].
 */
export function canvasToCartesian(
  px: number,
  py: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  const x = (px - canvasWidth / 2) / (canvasWidth / 2);
  const y = -((py - canvasHeight / 2) / (canvasHeight / 2));
  return { x, y };
}

export function cartesianToCanvas(
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number
): { px: number; py: number } {
  const px = (x + 1) * (canvasWidth / 2);
  const py = (-y + 1) * (canvasHeight / 2);
  return { px, py };
}

/**
 * Returns line endpoints in canvas pixels (px1, py1, px2, py2) for the decision boundary line.
 * Line equation in Cartesian space: w1 * x + w2 * y + bias = 0
 * => y = (-w1 * x - bias) / w2 (if w2 != 0)
 * => x = (-w2 * y - bias) / w1 (if w1 != 0)
 */
export function getDecisionBoundaryEndpoints(
  weights: PerceptronWeights,
  width: number,
  height: number
): { px1: number; py1: number; px2: number; py2: number } | null {
  const { w1, w2, bias } = weights;
  if (Math.abs(w1) < 1e-6 && Math.abs(w2) < 1e-6) {
    return null;
  }

  const points: { x: number; y: number }[] = [];

  if (Math.abs(w2) > 1e-6) {
    // Intersections with x = -10 and x = 10 to draw line smoothly beyond visible canvas
    const yAtMinX = (-w1 * -10 - bias) / w2;
    points.push({ x: -10, y: yAtMinX });

    const yAtMaxX = (-w1 * 10 - bias) / w2;
    points.push({ x: 10, y: yAtMaxX });
  } else {
    // Vertical line x = -bias / w1
    const x = -bias / w1;
    points.push({ x, y: -10 });
    points.push({ x, y: 10 });
  }

  if (points.length < 2) return null;

  const p1 = cartesianToCanvas(points[0].x, points[0].y, width, height);
  const p2 = cartesianToCanvas(points[1].x, points[1].y, width, height);

  return { px1: p1.px, py1: p1.py, px2: p2.px, py2: p2.py };
}
