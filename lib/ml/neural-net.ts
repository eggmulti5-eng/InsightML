/**
 * /lib/ml/neural-net.ts
 *
 * TensorFlow.js-backed feedforward neural network helpers.
 * All functions receive the tf module and model as arguments so this file
 * stays importable in a Next.js "use client" component without SSR issues.
 * Do NOT import tf at module scope — pass it in from the component.
 */

import type * as TF from "@tensorflow/tfjs";
import type { NNDataPoint, LayerWeightInfo, NetworkArchitecture } from "@/modules/neural-net/types";

export type TFType = typeof TF;
export type TFModel = TF.Sequential;

/**
 * Build and compile a fresh Sequential model.
 * Architecture: 2 inputs → [hiddenSize] × numHiddenLayers (ReLU) → 1 output (sigmoid)
 */
export function buildModel(
  tf: TFType,
  arch: NetworkArchitecture,
  learningRate: number
): TFModel {
  const model = tf.sequential();

  // First hidden layer (takes 2 inputs)
  model.add(
    tf.layers.dense({
      units: arch.hiddenSize,
      inputShape: [2],
      activation: "relu",
      kernelInitializer: "glorotUniform",
      biasInitializer: "zeros",
    })
  );

  // Optional second hidden layer
  if (arch.numHiddenLayers === 2) {
    model.add(
      tf.layers.dense({
        units: arch.hiddenSize,
        activation: "relu",
        kernelInitializer: "glorotUniform",
        biasInitializer: "zeros",
      })
    );
  }

  // Output layer — sigmoid for binary classification
  model.add(
    tf.layers.dense({
      units: 1,
      activation: "sigmoid",
      kernelInitializer: "glorotUniform",
      biasInitializer: "zeros",
    })
  );

  model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}

/**
 * Run one training epoch on all provided labeled points.
 * Returns the scalar loss value for this step.
 */
export async function trainStep(
  tf: TFType,
  model: TFModel,
  points: NNDataPoint[]
): Promise<number> {
  if (points.length === 0) return 0;

  const xs = tf.tensor2d(
    points.map((p) => [p.x, p.y]),
    [points.length, 2]
  );
  const ys = tf.tensor2d(
    points.map((p) => [p.label]),
    [points.length, 1]
  );

  const history = await model.fit(xs, ys, {
    epochs: 1,
    batchSize: Math.min(points.length, 32),
    shuffle: true,
    verbose: 0,
  });

  xs.dispose();
  ys.dispose();

  const loss = history.history.loss[0] as number;
  return Number(isFinite(loss) ? loss.toFixed(4) : 9999);
}

/**
 * Sample the model on a regular grid of (x, y) values in [-1, 1].
 * Returns a flat Float32Array of length gridRes*gridRes where each value is
 * the sigmoid output (0–1), row-major (y outer, x inner... adjusted for canvas).
 */
export async function getPredictionGrid(
  tf: TFType,
  model: TFModel,
  gridRes: number = 50
): Promise<Float32Array> {
  const coords: number[][] = [];
  // Iterate x (cols) outer, y (rows) inner — canvas-friendly row-major
  for (let j = 0; j < gridRes; j++) {
    for (let i = 0; i < gridRes; i++) {
      const x = (i / (gridRes - 1)) * 2 - 1;
      const y = 1 - (j / (gridRes - 1)) * 2; // flip y: top=+1
      coords.push([x, y]);
    }
  }

  const inputTensor = tf.tensor2d(coords, [gridRes * gridRes, 2]);
  const predictions = model.predict(inputTensor) as TF.Tensor;
  const data = await predictions.data() as Float32Array;
  inputTensor.dispose();
  predictions.dispose();
  return data;
}

/**
 * Extract current weights & biases from each layer as plain JS arrays.
 * Returns one LayerWeightInfo per dense layer (hidden + output).
 */
export function getLayerWeights(model: TFModel): LayerWeightInfo[] {
  const results: LayerWeightInfo[] = [];

  for (const layer of model.layers) {
    const layerWeights = layer.getWeights();
    if (layerWeights.length < 2) continue; // Skip layers without weights

    const kernelTensor = layerWeights[0]; // shape [inputSize, outputSize]
    const biasTensor = layerWeights[1];   // shape [outputSize]

    const kernelData = kernelTensor.dataSync() as Float32Array;
    const biasData = biasTensor.dataSync() as Float32Array;

    const [inputSize, outputSize] = kernelTensor.shape as [number, number];

    // Convert flat kernel to 2D array [inputSize][outputSize]
    const weights: number[][] = [];
    for (let i = 0; i < inputSize; i++) {
      weights.push([]);
      for (let o = 0; o < outputSize; o++) {
        weights[i].push(kernelData[i * outputSize + o]);
      }
    }

    results.push({
      weights,
      biases: Array.from(biasData),
      inputSize,
      outputSize,
    });
  }

  return results;
}

/** Coordinate helpers matching perceptron module conventions (space [-1, 1]) */
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
