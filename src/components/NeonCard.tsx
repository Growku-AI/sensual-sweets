"use client";

import { cn } from "@/lib/utils";

interface NeonCardProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  speed?: number;
}

export function NeonCard({
  children,
  className,
  innerClassName,
  speed = 3,
}: NeonCardProps) {
  return (
    <div
      className={cn("neon-card-outer", className)}
      style={{ "--neon-speed": `${speed}s` } as React.CSSProperties}
    >
      <div className={cn("neon-card-inner", innerClassName)}>{children}</div>
    </div>
  );
}
