import React from "react";
import { cn } from "@/lib/utils";

export type RainbowButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function RainbowButton({
  children,
  className,
  style,
  ...props
}: RainbowButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 text-sm font-semibold text-white transition-all duration-300 [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        // Glow effect
        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/4 before:w-3/4 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))] before:opacity-75 group-hover:before:opacity-100 before:transition-opacity",
        // Light mode button gradient
        "bg-[linear-gradient(#0f172a,#0f172a),linear-gradient(#0f172a_50%,rgba(15,23,42,0.6)_80%,rgba(15,23,42,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        // Dark mode button gradient
        "dark:bg-[linear-gradient(#0f172a,#0f172a),linear-gradient(#0f172a_50%,rgba(15,23,42,0.6)_80%,rgba(15,23,42,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        className
      )}
      style={
        {
          "--color-1": "0 100% 63%",
          "--color-2": "270 100% 63%",
          "--color-3": "210 100% 63%",
          "--color-4": "195 100% 63%",
          "--color-5": "90 100% 63%",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}

export function RainbowButtonDemo() {
  return <RainbowButton>Get Unlimited Access</RainbowButton>;
}
