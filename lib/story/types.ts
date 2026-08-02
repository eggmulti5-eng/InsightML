// ─── Story Mode Type System ──────────────────────────────────────────────────
// Pure TypeScript — no DOM or React imports here.

/**
 * What the user must do for the step to auto-advance.
 * 'click-next'  → user clicks the Next button in the dialogue box.
 * 'add-point'   → user clicks the canvas to place at least one new point.
 * 'train-step'  → user clicks the "Train Step" button at least once.
 * 'train-auto'  → user toggles "Train Auto" on.
 */
export type StoryAction =
  | "click-next"
  | "add-point"
  | "train-step"
  | "train-auto"
  // Gradient Descent module
  | "gd-step"
  // Neural Net module
  | "nn-load-preset"
  | "nn-train";

/**
 * A single step in a walkthrough script.
 */
export interface StoryStep {
  /** Unique identifier for this step (used to track completion). */
  id: string;

  /** The NPC's dialogue text. Supports newlines (\n). */
  dialogue: string;

  /**
   * Optional DOM element ID to visually highlight.
   * The overlay will draw a glowing ring around that element.
   */
  highlightElementId?: string;

  /**
   * How to advance to the next step.
   * Defaults to 'click-next' if omitted.
   */
  requiredAction?: StoryAction;

  /**
   * Optional label for the advance button when requiredAction is 'click-next'.
   * Defaults to "Next ▶".
   */
  nextButtonLabel?: string;

  /**
   * Minimum number of actions needed before auto-advancing
   * (e.g. for 'add-point': must place at least N points to proceed).
   * Defaults to 1.
   */
  minActionCount?: number;
}

/**
 * A complete walkthrough script for one module.
 */
export interface WalkthroughScript {
  /** Display name shown at the top of the dialogue box. */
  moduleTitle: string;

  /** NPC name shown above dialogue text. */
  npcName: string;

  /** Optional path to NPC portrait image (relative to /public). */
  npcPortrait?: string;

  /** Ordered sequence of dialogue steps. */
  steps: StoryStep[];
}

/**
 * Runtime state for the story controller hook.
 */
export interface StoryState {
  isActive: boolean;
  currentStepIndex: number;
  actionCount: number; // how many qualifying actions completed in current step
}
