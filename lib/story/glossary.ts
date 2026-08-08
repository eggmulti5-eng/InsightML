export interface GlossaryEntry {
  term: string;
  aliases: string[];
  definition: string;
  analogy?: string;
}

export const GLOSSARY_DICTIONARY: GlossaryEntry[] = [
  {
    term: "Perceptron",
    aliases: ["PERCEPTRON", "perceptron", "Perceptrons"],
    definition: "The fundamental building block of neural networks — a single artificial neuron that calculates a weighted sum of inputs to make a binary decision.",
    analogy: "Like a sports referee weighing multiple pieces of evidence before calling a penalty.",
  },
  {
    term: "Loss Surface",
    aliases: ["LOSS SURFACE", "loss surface", "Loss Surface"],
    definition: "A mathematical landscape representing the model's prediction error across different parameter values, where lower elevation means better accuracy.",
    analogy: "A hilly landscape at night where your goal is to find the deepest valley floor.",
  },
  {
    term: "Gradient Descent",
    aliases: ["GRADIENT DESCENT", "gradient descent", "Gradient Descent", "gradient", "GRADIENT", "gradients"],
    definition: "An optimization algorithm that iteratively calculates the slope of error and steps in the direction of steepest loss reduction.",
    analogy: "Like feeling your way down a foggy mountain by stepping in whichever direction slopes downhill most steeply.",
  },
  {
    term: "Learning Rate",
    aliases: ["LEARNING RATE", "learning rate", "Learning Rate", "learning rate slider"],
    definition: "A hyperparameter (η) that controls how large a step the model takes during each update towards the minimum loss.",
    analogy: "The stride length of a walker — taking leaps can jump over the target, while taking tiny steps takes forever.",
  },
  {
    term: "Hidden Layer",
    aliases: ["HIDDEN LAYERS", "hidden layers", "HIDDEN LAYER", "hidden layer", "hidden neurons", "hidden node", "hidden nodes"],
    definition: "Intermediate layers of artificial neurons between input and output that combine signals to learn complex, non-linear patterns.",
    analogy: "Like specialized departments in a factory processing raw materials into refined features before handing them to assembly.",
  },
  {
    term: "Overfitting",
    aliases: ["OVERFITTING", "overfitting", "overfit", "memorise noise", "memorising noise"],
    definition: "When a model memorizes specific noise and quirks of training data instead of general patterns, causing poor performance on new data.",
    analogy: "Like memorizing exact test questions instead of learning the subject — failing when the test questions change.",
  },
  {
    term: "Convergence",
    aliases: ["CONVERGING", "converging", "CONVERGED", "converged", "convergence"],
    definition: "The state reached during training when the loss plateaus near its minimum and model parameter updates become negligible.",
    analogy: "Like a rolling marble finally settling to rest at the very bottom of a bowl.",
  },
  {
    term: "Divergence",
    aliases: ["DIVERGING", "diverging", "diverge", "diverged"],
    definition: "When training updates become unstable and loss increases rapidly toward infinity, usually due to an excessively high learning rate.",
    analogy: "Like pushing a swing too hard and out of sync until it flips out of control.",
  },
  {
    term: "XOR Pattern",
    aliases: ["XOR", "XOR pattern", "XOR arrangement"],
    definition: "A classic non-linearly separable classification problem where points arranged diagonally belong to the same class.",
    analogy: "Like a checkerboard pattern — you cannot draw a single straight line to divide all red squares from black squares.",
  },
  {
    term: "Activation Function",
    aliases: ["activation", "activations", "ReLU", "sigmoid"],
    definition: "A non-linear mathematical function applied to a neuron's output, enabling neural networks to model non-linear boundaries.",
    analogy: "Like a dimmer switch that decides how strongly a neuron passes its signal forward.",
  },
];
