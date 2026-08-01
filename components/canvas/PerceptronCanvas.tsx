"use client";

import React, { useRef, useEffect } from "react";
import {
  DataPoint,
  PerceptronWeights,
  canvasToCartesian,
  cartesianToCanvas,
  getDecisionBoundaryEndpoints,
  predictPoint,
} from "@/lib/ml/perceptron";

interface PerceptronCanvasProps {
  points: DataPoint[];
  weights: PerceptronWeights;
  onAddPoint: (point: DataPoint) => void;
  width?: number;
  height?: number;
}

export const PerceptronCanvas: React.FC<PerceptronCanvasProps> = ({
  points,
  weights,
  onAddPoint,
  width = 600,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, width, height);

    // Decision region background shading (retro pixel grid fill)
    const gridSize = 30;
    const cellW = width / gridSize;
    const cellH = height / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const px = (i + 0.5) * cellW;
        const py = (j + 0.5) * cellH;
        const cartesian = canvasToCartesian(px, py, width, height);
        const pred = predictPoint(cartesian, weights);

        ctx.fillStyle = pred === 1 ? "rgba(239, 68, 68, 0.08)" : "rgba(59, 130, 246, 0.08)";
        ctx.fillRect(i * cellW, j * cellH, cellW, cellH);
      }
    }

    // Grid lines
    ctx.strokeStyle = "#27272a";
    ctx.lineWidth = 1;
    const gridStep = width / 10;
    for (let x = 0; x <= width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Main Axes
    ctx.strokeStyle = "#52525b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "bold 12px monospace";
    ctx.fillText("x1", width - 20, height / 2 - 8);
    ctx.fillText("x2", width / 2 + 8, 18);

    // Decision Boundary Line
    const line = getDecisionBoundaryEndpoints(weights, width, height);
    if (line) {
      ctx.save();
      ctx.strokeStyle = "#10b981"; // Emerald green
      ctx.lineWidth = 4;
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(line.px1, line.py1);
      ctx.lineTo(line.px2, line.py2);
      ctx.stroke();
      ctx.restore();
    }

    // Data Points
    points.forEach((p) => {
      const { px, py } = cartesianToCanvas(p.x, p.y, width, height);
      const isClassA = p.label === 1;

      ctx.save();
      ctx.shadowColor = isClassA ? "#ef4444" : "#3b82f6";
      ctx.shadowBlur = 8;

      ctx.fillStyle = isClassA ? "#ef4444" : "#3b82f6";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(isClassA ? "+" : "−", px, py);
    });
  }, [points, weights, width, height]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const { x, y } = canvasToCartesian(px, py, width, height);
    const label: 1 | -1 = e.button === 2 ? -1 : 1;

    const newPoint: DataPoint = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      x: Number(x.toFixed(4)),
      y: Number(y.toFixed(4)),
      label,
    };

    onAddPoint(newPoint);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleCanvasClick(e);
  };

  return (
    <div className="relative border-4 border-emerald-500 shadow-[8px_8px_0px_0px_rgba(16,185,129,0.3)] bg-zinc-950 p-2 inline-block">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={(e) => {
          if (e.button === 0) handleCanvasClick(e);
        }}
        onContextMenu={handleContextMenu}
        className="cursor-crosshair block"
      />
      <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mt-2 px-1">
        <span>
          LEFT CLICK = <strong className="text-red-400">Class A (+1)</strong>
        </span>
        <span>
          RIGHT CLICK = <strong className="text-blue-400">Class B (-1)</strong>
        </span>
      </div>
    </div>
  );
};
