import { WalkthroughScript } from "@/lib/story/types";

/**
 * Gradient Descent Module Walkthrough
 * 6-step guided tour of the loss surface optimizer.
 * NPC: "BYTE" the robot professor.
 */
export const gradientDescentWalkthrough: WalkthroughScript = {
  moduleTitle: "Gradient Descent Visualizer",
  npcName: "BYTE",
  npcPortrait: "/npc-portrait.png",
  steps: [
    {
      id: "intro",
      dialogue:
        "Welcome back! This time we're not drawing a line — we're finding the BOTTOM OF A VALLEY.\n\nGradient descent is the algorithm that powers almost all of machine learning. It's how neural networks actually learn.\n\nThe canvas shows a LOSS SURFACE — a mathematical landscape where the lowest point is the best answer. Our ball starts somewhere on the slope and we roll it downhill!",
      requiredAction: "click-next",
      nextButtonLabel: "Let's roll! ▶",
    },
    {
      id: "explain-surface",
      dialogue:
        "Look at the contour map on the left. Each ring is like a topographic line — darker = lower = less loss.\n\nThe dot is YOUR CURRENT POSITION in parameter space. The golden trail behind it shows the path taken so far.\n\nThe Loss Chart on the right plots loss over time. A falling line = the optimizer is working. A rising or flat line = something is wrong.\n\nPress Next when you've had a look!",
      highlightElementId: "story-gd-canvas",
      requiredAction: "click-next",
    },
    {
      id: "step-it",
      dialogue:
        "Time to move! Click the STEP (1x) button once.\n\nEach click nudges the position one step in the direction of STEEPEST DESCENT — the direction that reduces loss the fastest.\n\nWatch the dot move on the canvas, and watch the Loss Chart get an extra point. That's one gradient descent step!",
      highlightElementId: "story-gd-step-btn",
      requiredAction: "gd-step",
      minActionCount: 1,
    },
    {
      id: "explain-lr",
      dialogue:
        "See the LEARNING RATE slider? That's the step SIZE — how far we move each time we compute the gradient.\n\nRight now it's set to a safe value. A small learning rate means slow, steady progress. Too large and the ball OVERSHOOTS the valley and bounces around — or flies off completely!\n\nThis is the most important hyperparameter in machine learning. Press Next to see what happens when we push it too high.",
      highlightElementId: "story-gd-lr-slider",
      requiredAction: "click-next",
    },
    {
      id: "diverge",
      dialogue:
        "Crank the learning rate slider to 0.9 or higher, then click RESET PATH and hit RUN AUTO.\n\nWatch what happens — the ball should start oscillating wildly or fly off the surface entirely. The Status badge will flash DIVERGING.\n\nThis is exactly what happens in real neural nets when the learning rate is too high: loss goes UP instead of down, and training fails. Seen it? Press Next!",
      highlightElementId: "story-gd-controls",
      requiredAction: "click-next",
      nextButtonLabel: "Seen it! ▶",
    },
    {
      id: "finish",
      dialogue:
        "Now you understand gradient descent — the engine inside every neural network!\n\nEvery time a network trains, it's doing exactly this: computing a gradient, taking a step, checking the loss, repeating.\n\nBring the learning rate back down to around 0.1, reset the path, and try the other surface presets (Banana, Saddle). Each one shows a different challenge gradient descent faces in the real world!\n\nYou're in Sandbox Mode now. Have fun exploring! ⭐",
      requiredAction: "click-next",
      nextButtonLabel: "Start Exploring! ★",
    },
  ],
};
