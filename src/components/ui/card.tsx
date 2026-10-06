import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = ({ className, hoverEffect = false, ...p }: CardProps) => (
  <div
    className={cn(
      "rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-200",
      hoverEffect && "hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5",
      className
    )}
    {...p}
  />
);
