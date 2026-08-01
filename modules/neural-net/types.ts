export interface NNDataPoint {
  id: string;
  x: number; // Normalized [-1, 1]
  y: number; // Normalized [-1, 1]
  label: 0 | 1; // 0 = Class B (green), 1 = Class A (red)
}

export interface LayerWeightInfo {
  /** Weights matrix [inputSize][outputSize] */
  weights: number[][];
  /** Bias array [outputSize] */
  biases: number[];
  inputSize: number;
  outputSize: number;
}

export interface NetworkArchitecture {
  hiddenSize: number;
  numHiddenLayers: 1 | 2;
}

export interface NNState {
  points: NNDataPoint[];
  lossHistory: number[];
  stepCount: number;
  isTraining: boolean;
  learningRate: number;
  architecture: NetworkArchitecture;
}
