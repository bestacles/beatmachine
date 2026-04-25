import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500",
        variant === "secondary" && "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700 focus-visible:ring-zinc-500",
        variant === "ghost" && "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 focus-visible:ring-zinc-500",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500",
        size === "sm" && "px-2.5 py-1 text-xs",
        size === "md" && "px-3 py-1.5 text-sm",
        size === "lg" && "px-5 py-2.5 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
