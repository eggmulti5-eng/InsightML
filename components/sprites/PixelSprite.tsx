/**
 * PixelSprite — renders a 2D color array as an SVG of <rect> elements.
 * Each non-null cell in the grid becomes one hard-edged "pixel".
 *
 * @param grid    2D array of hex color strings or null (transparent)
 * @param scale   how many SVG units per grid cell (default 1 — scale in CSS)
 * @param className  additional class names for the <svg> element
 * @param style   additional inline styles for the <svg> element
 */

import React from "react";

interface PixelSpriteProps {
  grid: (string | null)[][];
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

export const PixelSprite: React.FC<PixelSpriteProps> = ({
  grid,
  scale = 1,
  className = "",
  style = {},
  "aria-label": ariaLabel,
}) => {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const w = cols * scale;
  const h = rows * scale;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        imageRendering: "pixelated",
        display: "block",
        shapeRendering: "crispEdges",
        ...style,
      }}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
    >
      {grid.map((row, r) =>
        row.map((color, c) =>
          color ? (
            <rect
              key={`${r}-${c}`}
              x={c * scale}
              y={r * scale}
              width={scale}
              height={scale}
              fill={color}
            />
          ) : null
        )
      )}
    </svg>
  );
};
