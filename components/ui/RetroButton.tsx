import React from "react";

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "accent";
  children: React.ReactNode;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyle =
    "font-mono font-bold uppercase tracking-wider text-sm px-4 py-2 border-2 transition-all active:translate-x-1 active:translate-y-1 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const variants = {
    primary:
      "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
    secondary:
      "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
    danger:
      "bg-red-500 hover:bg-red-400 text-zinc-950 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
    accent:
      "bg-amber-500 hover:bg-amber-400 text-zinc-950 border-zinc-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]",
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
