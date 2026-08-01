import { LossPreset, Point2D, StepResult, PresetConfig } from "@/modules/gradient-descent/types";

export const PRESETS: Record<LossPreset, PresetConfig> = {
  bowl: {
    id: "bowl",
    name: "Isotropic Bowl",
    description: "f(x, y) = x² + y² — Symmetric 2D paraboloid with minimum at (0,0)",
    defaultLr: 0.1,
    formula: "f(x, y) = x² + y²",
  },
  valley: {
    id: "valley",
    name: "Anisotropic Valley",
    description: "f(x, y) = 0.5·x² + 2.5·y² — Steeper in y than x, shows zigzagging",
    defaultLr: 0.15,
    formula: "f(x, y) = 0.5·x² + 2.5·y²",
  },
  saddle: {
    id: "saddle",
    name: "Saddle / Non-Convex",
    description: "f(x, y) = 0.5·x² - 0.5·y² + 0.05·y⁴ + 1 — Local features and saddle behavior",
    defaultLr: 0.1,
    formula: "f(x, y) = 0.5·x² - 0.5·y² + 0.05·y⁴ + 1",
  },
};

/**
 * Computes loss value f(x, y) for a given preset surface.
 */
export function computeLoss(x: number, y: number, preset: LossPreset = "bowl"): number {
  if (!isFinite(x) || !isFinite(y)) return Infinity;

  switch (preset) {
    case "bowl":
      return x * x + y * y;
    case "valley":
      return 0.5 * x * x + 2.5 * y * y;
    case "saddle":
      return 0.5 * x * x - 0.5 * y * y + 0.05 * Math.pow(y, 4) + 1.0;
    default:
      return x * x + y * y;
  }
}

/**
 * Computes exact gradient ∇f(x, y) = (∂f/∂x, ∂f/∂y).
 */
export function computeGradient(
  x: number,
  y: number,
  preset: LossPreset = "bowl"
): { gx: number; gy: number } {
  if (!isFinite(x) || !isFinite(y)) return { gx: 0, gy: 0 };

  switch (preset) {
    case "bowl":
      return { gx: 2 * x, gy: 2 * y };
    case "valley":
      return { gx: 1.0 * x, gy: 5.0 * y };
    case "saddle":
      return { gx: 1.0 * x, gy: -1.0 * y + 0.2 * Math.pow(y, 3) };
    default:
      return { gx: 2 * x, gy: 2 * y };
  }
}

/**
 * Runs ONE gradient descent step:
 * (x_{t+1}, y_{t+1}) = (x_t, y_t) - learningRate * ∇f(x_t, y_t)
 */
export function gradientDescentStep(
  pos: Point2D,
  learningRate: number,
  preset: LossPreset = "bowl"
): StepResult {
  const { gx, gy } = computeGradient(pos.x, pos.y, preset);

  let nextX = pos.x - learningRate * gx;
  let nextY = pos.y - learningRate * gy;

  // Cap extreme values to prevent NaN / Infinity crashes when learning rate explodes
  const MAX_VAL = 100;
  if (!isFinite(nextX) || Math.abs(nextX) > MAX_VAL) {
    nextX = Math.sign(nextX || 1) * MAX_VAL;
  }
  if (!isFinite(nextY) || Math.abs(nextY) > MAX_VAL) {
    nextY = Math.sign(nextY || 1) * MAX_VAL;
  }

  const loss = computeLoss(nextX, nextY, preset);
  const gradNorm = Math.sqrt(gx * gx + gy * gy);

  return {
    nextPos: { x: Number(nextX.toFixed(4)), y: Number(nextY.toFixed(4)) },
    loss: Number(isFinite(loss) ? loss.toFixed(4) : 9999),
    gx: Number(gx.toFixed(4)),
    gy: Number(gy.toFixed(4)),
    gradNorm: Number(gradNorm.toFixed(4)),
  };
}

/**
 * Coordinate mapping: Canvas pixels <-> 2D Cartesian Space [-range, range].
 */
export function canvasToCartesian(
  px: number,
  py: number,
  canvasWidth: number,
  canvasHeight: number,
  range: number = 5
): Point2D {
  const x = ((px - canvasWidth / 2) / (canvasWidth / 2)) * range;
  const y = -((py - canvasHeight / 2) / (canvasHeight / 2)) * range;
  return { x, y };
}

export function cartesianToCanvas(
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number,
  range: number = 5
): { px: number; py: number } {
  const px = ((x / range) + 1) * (canvasWidth / 2);
  const py = ((-y / range) + 1) * (canvasHeight / 2);
  return { px, py };
}
