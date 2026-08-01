"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { WalkthroughScript, StoryState, StoryAction } from "@/lib/story/types";

interface UseStoryModeReturn {
  state: StoryState;
  currentStep: WalkthroughScript["steps"][number] | null;
  script: WalkthroughScript | null;
  /** Call this when a qualifying user action happens (e.g. point added, train clicked). */
  registerAction: (action: StoryAction) => void;
  /** Advance to next step (called by Next button or auto-advance). */
  advance: () => void;
  /** Skip/close the walkthrough entirely. */
  skip: () => void;
  /** Start the walkthrough from the beginning. */
  start: (script: WalkthroughScript) => void;
}

/**
 * Orchestrates story mode state: which step we're on, action counting,
 * auto-advance when required actions are completed.
 */
export function useStoryMode(): UseStoryModeReturn {
  const [script, setScript] = useState<WalkthroughScript | null>(null);
  const [state, setState] = useState<StoryState>({
    isActive: false,
    currentStepIndex: 0,
    actionCount: 0,
  });

  // Keep a ref so registerAction callback doesn't get stale
  const stateRef = useRef(state);
  const scriptRef = useRef(script);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { scriptRef.current = script; }, [script]);

  const advance = useCallback(() => {
    const s = scriptRef.current;
    if (!s) return;
    setState((prev) => {
      const next = prev.currentStepIndex + 1;
      if (next >= s.steps.length) {
        // Walkthrough complete — switch to sandbox (inactive)
        return { isActive: false, currentStepIndex: 0, actionCount: 0 };
      }
      return { isActive: true, currentStepIndex: next, actionCount: 0 };
    });
  }, []);

  const skip = useCallback(() => {
    setState({ isActive: false, currentStepIndex: 0, actionCount: 0 });
  }, []);

  const start = useCallback((newScript: WalkthroughScript) => {
    setScript(newScript);
    setState({ isActive: true, currentStepIndex: 0, actionCount: 0 });
  }, []);

  const registerAction = useCallback((action: StoryAction) => {
    const s = scriptRef.current;
    const st = stateRef.current;
    if (!s || !st.isActive) return;

    const step = s.steps[st.currentStepIndex];
    if (!step) return;

    const requiredAction = step.requiredAction ?? "click-next";
    if (requiredAction !== action) return;

    // Increment action count
    const newCount = st.actionCount + 1;
    const minNeeded = step.minActionCount ?? 1;

    setState((prev) => {
      const updated = { ...prev, actionCount: newCount };
      return updated;
    });

    // Auto-advance if action threshold met
    if (newCount >= minNeeded) {
      // Small delay so user sees the action take effect first
      setTimeout(() => advance(), 400);
    }
  }, [advance]);

  const currentStep =
    script && state.isActive ? script.steps[state.currentStepIndex] ?? null : null;

  return { state, currentStep, script, registerAction, advance, skip, start };
}
