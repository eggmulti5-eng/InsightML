"use client";

/**
 * ByteSprite — a 16×16 pixel-art sprite of BYTE, the robot professor.
 * Three frames for a subtle idle animation:
 *   Frame 0: neutral face (^^)  — base pose
 *   Frame 1: blink (--) — eyes closed
 *   Frame 2: bob up — same as frame 0 but shifted 1px up via transform
 *
 * Colors stay within the warm brown/amber/green palette.
 */

import React, { useEffect, useState } from "react";
import { PixelSprite } from "./PixelSprite";

// ── Palette shorthand ─────────────────────────────────────────────────────────
const _ = null;      // transparent
const B = "#2a1a0e"; // dark body / outline
const R = "#8b4d20"; // rust/copper — head casing
const r = "#6b3615"; // darker copper — shadow
const A = "#dda15e"; // amber — screen glow / accents
const G = "#57c460"; // green — CRT screen face
const g = "#3d9a47"; // darker green — screen shadow
const W = "#fefae0"; // near white — highlights
const T = "#c8891e"; // tawny gold — trim / screws
const N = "#1a1a2e"; // near black — screen pixels for eyes

// ── Frame 0: neutral ^^ eyes ─────────────────────────────────────────────────
const FRAME_0: (string | null)[][] = [
  [_, _, _, B, B, B, B, B, B, B, B, B, B, _, _, _],
  [_, _, B, r, r, r, r, r, r, r, r, r, r, B, _, _],
  [_, B, r, R, R, R, R, R, R, R, R, R, R, r, B, _],
  [B, r, R, T, R, R, R, R, R, R, R, R, T, R, r, B],
  [B, r, R, T, G, G, G, G, G, G, G, G, T, R, r, B],
  [B, r, R, R, G, N, G, G, N, G, G, N, G, R, r, B],  // ^^ eyes (3 pupils)
  [B, r, R, R, G, G, G, G, G, G, G, G, G, R, r, B],
  [B, r, R, R, G, A, G, G, G, G, G, A, G, R, r, B],  // smile glints
  [B, r, R, T, G, G, G, G, G, G, G, G, T, R, r, B],
  [B, r, R, R, R, R, R, R, R, R, R, R, R, R, r, B],
  [_, B, r, R, A, R, R, R, R, R, R, A, R, r, B, _],  // antenna dots
  [_, _, B, r, r, r, B, r, r, B, r, r, r, B, _, _],
  [_, _, _, B, B, r, r, r, r, r, r, B, B, _, _, _],  // shoulder
  [_, _, _, _, B, R, R, R, R, R, R, B, _, _, _, _],
  [_, _, _, _, _, B, B, B, B, B, B, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ── Frame 1: blink (-- eyes) ─────────────────────────────────────────────────
const FRAME_1: (string | null)[][] = [
  [_, _, _, B, B, B, B, B, B, B, B, B, B, _, _, _],
  [_, _, B, r, r, r, r, r, r, r, r, r, r, B, _, _],
  [_, B, r, R, R, R, R, R, R, R, R, R, R, r, B, _],
  [B, r, R, T, R, R, R, R, R, R, R, R, T, R, r, B],
  [B, r, R, T, G, G, G, G, G, G, G, G, T, R, r, B],
  [B, r, R, R, G, G, G, G, G, G, G, G, G, R, r, B],  // blink — no pupils
  [B, r, R, R, G, N, N, G, G, N, N, G, G, R, r, B],  // -- closed bars
  [B, r, R, R, G, A, G, G, G, G, G, A, G, R, r, B],
  [B, r, R, T, G, G, G, G, G, G, G, G, T, R, r, B],
  [B, r, R, R, R, R, R, R, R, R, R, R, R, R, r, B],
  [_, B, r, R, A, R, R, R, R, R, R, A, R, r, B, _],
  [_, _, B, r, r, r, B, r, r, B, r, r, r, B, _, _],
  [_, _, _, B, B, r, r, r, r, r, r, B, B, _, _, _],
  [_, _, _, _, B, R, R, R, R, R, R, B, _, _, _, _],
  [_, _, _, _, _, B, B, B, B, B, B, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// ── Frame 2: bob down (^^ + slight look) ─────────────────────────────────────
const FRAME_2: (string | null)[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, B, B, B, B, B, B, B, B, B, B, _, _, _],
  [_, _, B, r, r, r, r, r, r, r, r, r, r, B, _, _],
  [_, B, r, R, R, R, R, R, R, R, R, R, R, r, B, _],
  [B, r, R, T, R, R, R, R, R, R, R, R, T, R, r, B],
  [B, r, R, T, G, G, G, G, G, G, G, G, T, R, r, B],
  [B, r, R, R, G, N, G, G, N, G, G, N, G, R, r, B],
  [B, r, R, R, G, G, G, G, G, G, G, G, G, R, r, B],
  [B, r, R, R, G, A, G, G, G, G, G, A, G, R, r, B],
  [B, r, R, T, G, G, G, G, G, G, G, G, T, R, r, B],
  [B, r, R, R, R, R, R, R, R, R, R, R, R, R, r, B],
  [_, B, r, R, A, R, R, R, R, R, R, A, R, r, B, _],
  [_, _, B, r, r, r, B, r, r, B, r, r, r, B, _, _],
  [_, _, _, B, B, r, r, r, r, r, r, B, B, _, _, _],
  [_, _, _, _, B, R, R, R, R, R, R, B, _, _, _, _],
  [_, _, _, _, _, B, B, B, B, B, B, _, _, _, _, _],
];

const FRAMES = [FRAME_0, FRAME_1, FRAME_2, FRAME_0]; // sequence: neutral, blink, bob, neutral

// Frame timings in ms
const TIMINGS = [1800, 150, 900, 300];

interface ByteSpriteProps {
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ByteSprite: React.FC<ByteSpriteProps> = ({
  scale = 3,
  className = "",
  style = {},
}) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    let idx = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const advance = () => {
      idx = (idx + 1) % FRAMES.length;
      setFrame(idx);
      timeout = setTimeout(advance, TIMINGS[idx]);
    };

    timeout = setTimeout(advance, TIMINGS[0]);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <PixelSprite
      grid={FRAMES[frame]}
      scale={scale}
      className={className}
      style={style}
      aria-label="BYTE the robot professor pixel sprite"
    />
  );
};
