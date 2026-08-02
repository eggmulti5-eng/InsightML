"use client";

import { useState, useCallback, useRef } from "react";
import { ChallengeDefinition, ChallengeMetrics } from "./types";

export interface UseChallengeReturn {
  /** True once the win condition has been met. */
  isWon: boolean;
  /** Star rating achieved (only meaningful when isWon). */
  stars: 1 | 2 | 3;
  /** Whether the result modal is currently visible. */
  showModal: boolean;
  /** Last metrics snapshot (for display in the result modal). */
  lastMetrics: ChallengeMetrics;
  /** Call on every state change with current metrics. Checks win condition. */
  update: (metrics: ChallengeMetrics) => void;
  /** Dismiss the result modal without resetting the challenge. */
  dismissModal: () => void;
  /** Full reset — clears win state so the user can retry. */
  reset: () => void;
}

/**
 * Hook that tracks progress toward a challenge's win condition.
 * Call `update(metrics)` whenever module state changes.
 * When checkWin returns true, the modal is shown automatically.
 */
export function useChallengeMode(challenge: ChallengeDefinition): UseChallengeReturn {
  const [isWon, setIsWon] = useState(false);
  const [stars, setStars] = useState<1 | 2 | 3>(1);
  const [showModal, setShowModal] = useState(false);
  const [lastMetrics, setLastMetrics] = useState<ChallengeMetrics>({ stepCount: 0 });

  // Ref prevents double-triggering if update is called multiple times
  // in the same render cycle after the win condition is first met.
  const wonRef = useRef(false);

  const update = useCallback(
    (metrics: ChallengeMetrics) => {
      setLastMetrics(metrics);
      if (wonRef.current) return;
      if (challenge.checkWin(metrics)) {
        wonRef.current = true;
        setIsWon(true);
        setStars(challenge.getStars(metrics));
        setShowModal(true);
      }
    },
    [challenge]
  );

  const dismissModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const reset = useCallback(() => {
    wonRef.current = false;
    setIsWon(false);
    setStars(1);
    setShowModal(false);
    setLastMetrics({ stepCount: 0 });
  }, []);

  return { isWon, stars, showModal, lastMetrics, update, dismissModal, reset };
}
