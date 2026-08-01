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
 */
export function useTypewriter({
  text,
  speed = 40,
  paused = false,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [charIndex, setCharIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const textRef = useRef(text);

  // Reset when text changes (new step)
  useEffect(() => {
    textRef.current = text;
    setCharIndex(0);
  }, [text]);

  useEffect(() => {
    if (paused || charIndex >= text.length) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const msPerChar = 1000 / speed;
    intervalRef.current = setInterval(() => {
      setCharIndex((prev) => {
        if (prev >= textRef.current.length - 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return textRef.current.length;
        }
        return prev + 1;
      });
    }, msPerChar);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, paused, speed]);

  const skipToEnd = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCharIndex(text.length);
  };

  const reset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCharIndex(0);
  };

  return {
    displayedText: text.slice(0, charIndex),
    isDone: charIndex >= text.length,
    skipToEnd,
    reset,
  };
}
