export type { DataPoint, PerceptronWeights } from "@/lib/ml/perceptron";

export interface PerceptronState {
  points: import("@/lib/ml/perceptron").DataPoint[];
  weights: import("@/lib/ml/perceptron").PerceptronWeights;
  learningRate: number;
  isTraining: boolean;
  stepCount: number;
}
