import React from "react";

interface RetroSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  displayValue?: string | number;
}

export const RetroSlider: React.FC<RetroSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
}) => {
  return (
    <div className="font-mono flex flex-col gap-1 text-sm bg-zinc-900 border-2 border-zinc-800 p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-center text-zinc-300">
        <span className="uppercase text-xs tracking-wider text-emerald-400 font-bold">{label}</span>
        <span className="bg-zinc-950 px-2 py-0.5 border border-zinc-700 font-mono text-xs text-amber-400">
          {displayValue !== undefined ? displayValue : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-emerald-500 cursor-pointer bg-zinc-950 h-2 border border-zinc-700 rounded-none"
      />
    </div>
  );
};
