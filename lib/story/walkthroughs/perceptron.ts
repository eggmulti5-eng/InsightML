import { WalkthroughScript } from "@/lib/story/types";

/**
 * Perceptron Module Walkthrough
 * 6-step guided tour of the single-layer perceptron.
 * NPC: "BYTE" the robot professor.
 */
export const perceptronWalkthrough: WalkthroughScript = {
  moduleTitle: "Perceptron Visualizer",
  npcName: "BYTE",
  npcPortrait: "/npc-portrait.png",
  steps: [
    {
      id: "intro",
      dialogue:
        "Hello! I'm BYTE, your ML guide!\n\nThis module is about the PERCEPTRON — the simplest possible neural network. It draws a straight line that tries to separate two groups of points.\n\nLet me walk you through it. Press Next when you're ready!",
      requiredAction: "click-next",
      nextButtonLabel: "Let's go! ▶",
    },
    {
      id: "add-points",
      dialogue:
        "First, let's give the perceptron some data to learn from.\n\nLEFT CLICK on the canvas to place a RED point (Class A).\nRIGHT CLICK to place a BLUE point (Class B).\n\nTry placing at least 3 red points on one side and 3 blue points on the other side of the canvas. The more spread out, the better!",
      highlightElementId: "story-canvas-area",
      requiredAction: "add-point",
      minActionCount: 6,
      nextButtonLabel: "I've placed points ▶",
    },
    {
      id: "explain-weights",
      dialogue:
        "Great work! See the W1, W2, and BIAS numbers in the readout panel?\n\nThese three numbers define the line. Together they make the equation:\n  W1·x₁ + W2·x₂ + BIAS = 0\n\nRight now the numbers are random — so the line is probably in the wrong place. That's okay! Training will fix it.",
      highlightElementId: "story-weights-panel",
      requiredAction: "click-next",
    },
    {
      id: "train-step",
      dialogue:
        "Now for the magic!\n\nClick the TRAIN STEP button. The perceptron will look at each of your points, check if it guessed the class correctly, and nudge the line a little in the right direction.\n\nWatch the golden line on the canvas move, and watch W1, W2, and BIAS change!",
      highlightElementId: "story-train-step-btn",
      requiredAction: "train-step",
      minActionCount: 1,
    },
    {
      id: "explain-why",
      dialogue:
        "Did you see it move?\n\nThe perceptron uses a simple rule called the PERCEPTRON UPDATE:\n  w = w + η × (correct − predicted) × x\n\nη (eta) is the learning rate slider — it controls how big each nudge is. Small η = slow & steady. Large η = big jumps that might overshoot!\n\nKeep clicking Train Step (or try Train Auto) until the Accuracy hits 100%.",
      highlightElementId: "story-lr-slider",
      requiredAction: "click-next",
    },
    {
      id: "finish",
      dialogue:
        "Excellent! You've just trained your first machine learning model!\n\nThe perceptron learned — purely from examples — to draw a line separating your red and blue points. No one told it where the line should be.\n\nYou're now in Sandbox Mode. Experiment freely: try overlapping points, change the learning rate, or load the preset data. Have fun! ⭐",
      requiredAction: "click-next",
      nextButtonLabel: "Start Exploring! ★",
    },
  ],
};
