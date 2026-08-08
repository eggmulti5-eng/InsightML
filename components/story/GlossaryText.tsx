"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { GLOSSARY_DICTIONARY, GlossaryEntry } from "@/lib/story/glossary";

interface GlossaryTextProps {
  text: string;
}

interface MatchToken {
  type: "text" | "glossary";
  content: string;
  entry?: GlossaryEntry;
}

// ── Estimated tooltip dimensions for flip logic ────────────────────────────────
const TOOLTIP_WIDTH  = 320; // w-80 = 320px
const TOOLTIP_HEIGHT = 220; // approximate; we flip above→below when needed
const GAP            = 8;   // px gap between term and tooltip

// ── Portal tooltip rendered at document.body level ───────────────────────────
// Because it lives at the root, no overflow:hidden ancestor can clip it.

interface TooltipPortalProps {
  entry: GlossaryEntry;
  anchorRect: DOMRect;
  clickLocked: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

const TooltipPortal: React.FC<TooltipPortalProps> = ({
  entry,
  anchorRect,
  clickLocked,
  onMouseEnter,
  onMouseLeave,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // ── Compute fixed position ─────────────────────────────────────────────────
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Prefer above; flip to below if too close to top
  const spaceAbove = anchorRect.top;
  const showBelow  = spaceAbove < TOOLTIP_HEIGHT + GAP + 8;

  let top: number;
  if (showBelow) {
    // Below the term
    top = anchorRect.bottom + GAP;
  } else {
    // Above the term
    top = anchorRect.top - TOOLTIP_HEIGHT - GAP;
  }

  // Clamp top so it never goes off-screen
  top = Math.max(8, Math.min(top, vh - TOOLTIP_HEIGHT - 8));

  // Align left with term; clamp right edge
  let left = anchorRect.left;
  left = Math.max(8, Math.min(left, vw - TOOLTIP_WIDTH - 8));

  return createPortal(
    <>
      {/* Invisible bridge between term and tooltip (covers the GAP so mouseleave
          doesn't fire while the mouse crosses that small empty strip). */}
      <span
        aria-hidden="true"
        style={{
          position: "fixed",
          zIndex: 9998,
          left,
          top:  showBelow ? anchorRect.bottom : anchorRect.top - GAP,
          width: TOOLTIP_WIDTH,
          height: GAP + 4,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />

      {/* Actual tooltip card */}
      <div
        style={{ position: "fixed", zIndex: 9999, top, left, width: TOOLTIP_WIDTH }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div
          className="bg-[#18110b] border-4 border-[#dda15e] p-3.5 rounded-none font-vt323 text-left"
          style={{ boxShadow: "6px 6px 0px 0px #0f0a07" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#382219] pb-1 mb-2">
            <span className="font-pixel text-[10px] text-[#dda15e] uppercase tracking-wider flex items-center gap-1.5">
              <span>🤖</span> BYTE Glossary: {entry.term}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="text-[#a3b18a] hover:text-[#bc4749] font-pixel text-[9px] px-1"
            >
              ✕
            </button>
          </div>

          {/* Definition */}
          <p className="text-[#fefae0] text-lg leading-snug">
            {entry.definition}
          </p>

          {/* Analogy */}
          {entry.analogy && (
            <div className="mt-2 pt-2 border-t border-[#382219] text-base">
              <span className="text-[#dda15e] font-pixel text-[9px] uppercase block mb-0.5">
                💡 Real-World Analogy:
              </span>
              <p className="leading-snug text-[#dda15e]/90">
                &quot;{entry.analogy}&quot;
              </p>
            </div>
          )}

          {/* Click-lock indicator */}
          {clickLocked && (
            <span className="block mt-1.5 pt-1.5 border-t border-[#382219] font-pixel text-[8px] text-[#5c3d2e] uppercase">
              📌 Pinned — click term or ✕ to close
            </span>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

// ── Single glossary term component ────────────────────────────────────────────
interface GlossaryTermProps {
  content: string;
  entry: GlossaryEntry;
}

const GlossaryTerm: React.FC<GlossaryTermProps> = ({ content, entry }) => {
  const [visible,     setVisible]     = useState(false);
  const [clickLocked, setClickLocked] = useState(false);
  const [anchorRect,  setAnchorRect]  = useState<DOMRect | null>(null);
  const hideTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const termRef       = useRef<HTMLSpanElement>(null);

  const cancelHide = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    if (clickLocked) return;
    cancelHide();
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setAnchorRect(null);
    }, 180);
  }, [clickLocked, cancelHide]);

  const show = useCallback(() => {
    cancelHide();
    if (termRef.current) setAnchorRect(termRef.current.getBoundingClientRect());
    setVisible(true);
  }, [cancelHide]);

  const handleTermEnter = () => show();
  const handleTermLeave = () => scheduleHide();
  const handleTooltipEnter = () => cancelHide();
  const handleTooltipLeave = () => scheduleHide();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickLocked) {
      setClickLocked(false);
      setVisible(false);
      setAnchorRect(null);
    } else {
      cancelHide();
      if (termRef.current) setAnchorRect(termRef.current.getBoundingClientRect());
      setClickLocked(true);
      setVisible(true);
    }
  };

  const handleClose = useCallback(() => {
    setClickLocked(false);
    setVisible(false);
    setAnchorRect(null);
  }, []);

  // Escape key and outside-click close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    const onOutside = (e: MouseEvent) => {
      // Only close if the click is not on the term itself
      if (termRef.current && !termRef.current.contains(e.target as Node)) {
        // Give a tick so a click ON the term triggers handleClick first
        setTimeout(() => {
          setClickLocked((locked) => {
            if (locked) return locked; // click-lock dismissal handled by handleClick
            setVisible(false);
            setAnchorRect(null);
            return false;
          });
        }, 0);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onOutside);
      cancelHide();
    };
  }, [handleClose, cancelHide]);

  // Refresh anchorRect on scroll/resize while tooltip is open (keeps position accurate)
  useEffect(() => {
    if (!visible) return;
    const refresh = () => {
      if (termRef.current) setAnchorRect(termRef.current.getBoundingClientRect());
    };
    window.addEventListener("scroll", refresh, true);
    window.addEventListener("resize", refresh);
    return () => {
      window.removeEventListener("scroll", refresh, true);
      window.removeEventListener("resize", refresh);
    };
  }, [visible]);

  return (
    <>
      {/* The term span itself */}
      <span
        ref={termRef}
        onClick={handleClick}
        onMouseEnter={handleTermEnter}
        onMouseLeave={handleTermLeave}
        className={`cursor-pointer border-b-2 border-dashed border-[#dda15e] font-semibold text-[#dda15e] px-0.5 rounded transition-colors inline ${
          visible ? "bg-[#dda15e]/30" : "hover:bg-[#dda15e]/20"
        } ${clickLocked ? "outline outline-1 outline-[#dda15e]/60" : ""}`}
        title={`Click or hover for BYTE's glossary: ${entry.term}`}
      >
        {content}
      </span>

      {/* Tooltip — rendered via portal at document.body; never clipped by any ancestor overflow */}
      {visible && anchorRect && (
        <TooltipPortal
          entry={entry}
          anchorRect={anchorRect}
          clickLocked={clickLocked}
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={handleTooltipLeave}
          onClose={handleClose}
        />
      )}
    </>
  );
};

// ── Main GlossaryText renderer ────────────────────────────────────────────────

export const GlossaryText: React.FC<GlossaryTextProps> = ({ text }) => {
  const allAliases = React.useMemo(() => {
    const list: { alias: string; entry: GlossaryEntry }[] = [];
    GLOSSARY_DICTIONARY.forEach((entry) => {
      entry.aliases.forEach((alias) => list.push({ alias, entry }));
    });
    // Longest first so multi-word terms match before their sub-words
    list.sort((a, b) => b.alias.length - a.alias.length);
    return list;
  }, []);

  const tokens = React.useMemo<MatchToken[]>(() => {
    if (allAliases.length === 0) return [{ type: "text", content: text }];

    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      `\\b(${allAliases.map((a) => escapeRegExp(a.alias)).join("|")})\\b`,
      "gi"
    );

    const result: MatchToken[] = [];
    let lastIndex = 0;
    let m: RegExpExecArray | null;

    while ((m = pattern.exec(text)) !== null) {
      if (m.index > lastIndex) {
        result.push({ type: "text", content: text.substring(lastIndex, m.index) });
      }
      const matched = m[0];
      const found = allAliases.find(
        (a) => a.alias.toLowerCase() === matched.toLowerCase()
      );
      result.push(
        found
          ? { type: "glossary", content: matched, entry: found.entry }
          : { type: "text",    content: matched }
      );
      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
      result.push({ type: "text", content: text.substring(lastIndex) });
    }

    return result;
  }, [text, allAliases]);

  return (
    <>
      {tokens.map((token, i) =>
        token.type === "text" || !token.entry ? (
          <React.Fragment key={i}>{token.content}</React.Fragment>
        ) : (
          <GlossaryTerm
            key={`${token.entry.term}-${i}`}
            content={token.content}
            entry={token.entry}
          />
        )
      )}
    </>
  );
};
