"use client";

import { useState, useEffect, useRef } from "react";

interface UseTypewriterOptions {
  /** The full target text to type out. */
  text: string;
  /** Characters per second. Default: 40. */
  speed?: number;
  /** Whether to pause typing (e.g. while skipping). */
  paused?: boolean;
}

interface UseTypewriterReturn {
  /** Currently visible portion of the text. */
  displayedText: string;
  /** True when the full text has been typed out. */
  isDone: boolean;
  /** Call to instantly reveal all remaining text. */
  skipToEnd: () => void;
  /** Call to restart from the beginning (e.g. when text changes). */
  reset: () => void;
}

/**
 * Pure logic hook for a typewriter / character-by-character text reveal.
 * No DOM dependencies — just state and a timer.
 *
 * FIX (2026-08-02): The original implementation had a race condition where
 * two separate useEffects both depended on [text]. When text changed:
 *   1. Effect-A queued setCharIndex(0) but hadn't rendered yet.
 *   2. Effect-B ran with the STALE charIndex from the previous step's
 *      closure, so the "charIndex >= text.length" guard was evaluated
 *      against the old (fully-typed) index — preventing the interval
 *      from ever starting for the new step.
 *
 * Fix: Merge both effects into one. Use a ref (charIndexRef) as the
 * authoritative index inside the interval callback so the closure never
 * goes stale, and reset both the ref and the state atomically before
 * scheduling the new interval.
 */
export function useTypewriter({
  text,
  speed = 40,
  paused = false,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [charIndex, setCharIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ref keeps the interval callback's view of charIndex always current,
  // avoiding stale closures without adding charIndex to the effect deps.
  const charIndexRef = useRef(0);

  // Single effect that atomically resets and restarts whenever text,
  // speed, or paused changes. No stale-closure risk from charIndex.
  useEffect(() => {
    // Clear any running interval from the previous step/config.
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Reset to the beginning of the new text.
    charIndexRef.current = 0;
    setCharIndex(0);

    // Don't start if paused or the text is empty.
    if (paused || text.length === 0) {
      return;
    }

    const msPerChar = 1000 / speed;
    intervalRef.current = setInterval(() => {
      const next = charIndexRef.current + 1;
      charIndexRef.current = next;
      setCharIndex(next);

      if (next >= text.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
      }
    }, msPerChar);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, paused, speed]);

  const skipToEnd = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    charIndexRef.current = text.length;
    setCharIndex(text.length);
  };

  const reset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    charIndexRef.current = 0;
    setCharIndex(0);
  };

  return {
    displayedText: text.slice(0, charIndex),
    isDone: charIndex >= text.length,
    skipToEnd,
    reset,
  };
}
