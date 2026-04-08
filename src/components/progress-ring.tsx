"use client";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 6,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-700 ease-out",
            clamped >= 100 ? "text-accent" : "text-accent/80"
          )}
        />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}
