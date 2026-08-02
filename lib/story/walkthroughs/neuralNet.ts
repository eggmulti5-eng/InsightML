import { WalkthroughScript } from "@/lib/story/types";

/**
 * Neural Net Module Walkthrough
 * 6-step guided tour of the multi-layer neural network visualizer.
 * NPC: "BYTE" the robot professor.
 */
export const neuralNetWalkthrough: WalkthroughScript = {
  moduleTitle: "Neural Net Visualizer",
  npcName: "BYTE",
  npcPortrait: "/npc-portrait.png",
  steps: [
    {
      id: "intro",
      dialogue:
        "Welcome to the most powerful module yet!\n\nSome problems CAN'T be solved with a straight line. Look at the XOR pattern — red points at top-left and bottom-right, blue at top-right and bottom-left. No single line can separate them!\n\nTo solve XOR, we need HIDDEN LAYERS — extra layers of neurons between the inputs and output that let the network learn curved, non-linear boundaries. Let's see this in action!",
      requiredAction: "click-next",
      nextButtonLabel: "Let's go! ▶",
    },
    {
      id: "load-xor",
      dialogue:
        "First, load the XOR preset data so we have something to learn from.\n\nClick the LOAD XOR PATTERN button in the controls panel. You'll see 8 points appear on the canvas in the classic diagonal XOR arrangement.\n\nThis is the same pattern that proved a single-layer perceptron was useless back in the 1960s — and caused a decade-long \"AI winter\"!",
      highlightElementId: "story-nn-xor-btn",
      requiredAction: "nn-load-preset",
      minActionCount: 1,
    },
    {
      id: "explain-arch",
      dialogue:
        "See the architecture display? It shows: 2 inputs → hidden neurons → 1 output.\n\nEach hidden neuron applies a non-linear activation (ReLU), which \"bends\" the decision boundary. More neurons = more bends = more complex shapes.\n\nThe canvas background shows the PREDICTION GRID — the colored region the network thinks is red vs. blue. Right now with an untrained model it's probably random!\n\nThe node count buttons let you change how many neurons are in the hidden layer.",
      highlightElementId: "story-nn-arch-panel",
      requiredAction: "click-next",
    },
    {
      id: "train-small",
      dialogue:
        "Let's start with just 2 hidden nodes — the minimum. Select \"2\" from the node count buttons, then click TRAIN AUTO and watch it try to learn.\n\nWith only 2 nodes, the network is too simple. It will struggle to fit the XOR pattern — the boundary may never cleanly separate the diagonals.\n\nWatch the loss chart: if it plateaus high (above 0.3) and barely drops, the network doesn't have enough capacity. Stop auto-training when you've seen it struggle, then press Next.",
      highlightElementId: "story-nn-nodes-panel",
      requiredAction: "nn-train",
      minActionCount: 1,
    },
    {
      id: "train-big",
      dialogue:
        "Now select 8 or 16 nodes, then click RESET MODEL and TRAIN AUTO again.\n\nWith more hidden neurons, the network has enough capacity to learn non-linear boundaries. Watch the prediction grid develop a curved, bent boundary that correctly separates the four XOR quadrants!\n\nThe loss should drop much lower — ideally below 0.1. This is the power of hidden layers: they transform the input space until the problem becomes linearly separable internally.",
      highlightElementId: "story-nn-nodes-panel",
      requiredAction: "nn-train",
      minActionCount: 1,
    },
    {
      id: "finish",
      dialogue:
        "Incredible! You just trained a neural network to solve an \"impossible\" problem!\n\nHidden layers are what makes deep learning so powerful. Each layer learns to represent the data in a new way — edges, then shapes, then concepts — until the final layer can make accurate predictions.\n\nYou're in Sandbox Mode. Try adding your own points, changing the number of layers, or experimenting with the learning rate. The whole canvas is your playground now! ⭐",
      requiredAction: "click-next",
      nextButtonLabel: "Start Exploring! ★",
    },
  ],
};
