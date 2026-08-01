import React from "react";

interface RetroPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
}

export const RetroPanel: React.FC<RetroPanelProps> = ({
  title,
  children,
  className = "",
  borderColor = "border-zinc-800",
}) => {
  return (
    <div
      className={`bg-zinc-900 border-4 ${borderColor} p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-mono ${className}`}
    >
      {title && (
        <div className="border-b-2 border-zinc-800 pb-2 mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            {title}
          </h2>
          <span className="inline-block w-2 h-2 bg-emerald-400 animate-pulse" />
        </div>
      )}
      {children}
    </div>
  );
};
