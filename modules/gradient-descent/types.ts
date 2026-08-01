export type LossPreset = "bowl" | "valley" | "saddle";

export interface Point2D {
  x: number;
  y: number;
}

export interface StepResult {
  nextPos: Point2D;
  loss: number;
  gx: number;
  gy: number;
  gradNorm: number;
}

export interface PresetConfig {
  id: LossPreset;
  name: string;
  description: string;
  defaultLr: number;
  formula: string;
}
