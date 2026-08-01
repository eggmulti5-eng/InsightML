"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LossChartProps {
  lossHistory: number[];
}

export const LossChart: React.FC<LossChartProps> = ({ lossHistory }) => {
  const labels = lossHistory.map((_, idx) => `Step ${idx}`);

  const data = {
    labels,
    datasets: [
      {
        label: "Loss f(x, y)",
        data: lossHistory,
        borderColor: "#dda15e",
        backgroundColor: "rgba(221, 161, 94, 0.15)",
        borderWidth: 3,
        pointBackgroundColor: "#fefae0",
        pointBorderColor: "#382219",
        pointRadius: lossHistory.length > 30 ? 2 : 4,
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#281b12",
        titleColor: "#dda15e",
        bodyColor: "#fefae0",
        borderColor: "#382219",
        borderWidth: 2,
        titleFont: { family: "monospace", size: 14 },
        bodyFont: { family: "monospace", size: 14 },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#2c1e15",
        },
        ticks: {
          color: "#a3b18a",
          font: { family: "monospace", size: 12 },
          maxTicksLimit: 10,
        },
      },
      y: {
        grid: {
          color: "#2c1e15",
        },
        ticks: {
          color: "#dda15e",
          font: { family: "monospace", size: 12 },
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-[#1e140e] border-2 border-[#382219] p-3 shadow-[3px_3px_0px_0px_#0f0a07] h-48 w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="font-pixel text-[10px] uppercase text-[#a3b18a] font-bold">
          Loss Curve (f(x, y) vs Step)
        </span>
        <span className="text-xs text-[#dda15e] font-mono">
          Latest Loss: {lossHistory.length > 0 ? lossHistory[lossHistory.length - 1].toFixed(4) : "0.0000"}
        </span>
      </div>
      <div className="h-36 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
