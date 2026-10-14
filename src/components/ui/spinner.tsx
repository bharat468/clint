import React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizeMap = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
  "2xl": "h-10 w-10",
};

/**
 * Premium shadcn-style radial petal spinner (8 rounded capsule bars with graduated opacity)
 * Matching Apple / shadcn design system.
 */
export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("animate-spin text-slate-700", sizeMap[size], className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      {/* 8 radial bars with graduated opacity matching the shadcn design */}
      <rect x="11" y="2" width="2" height="5" rx="1" fill="currentColor" opacity="1.0" />
      <rect
        x="11"
        y="2"
        width="2"
        height="5"
        rx="1"
        fill="currentColor"
        opacity="0.875"
        transform="rotate(45 12 12)"
      />
      <rect
        x="11"
        y="2"
        width="2"
        height="5"
        rx="1"
        fill="currentColor"
        opacity="0.75"
        transform="rotate(90 12 12)"
      />
      <rect
        x="11"
        y="2"
        width="2"
        height="5"
        rx="1"
        fill="currentColor"
        opacity="0.625"
        transform="rotate(135 12 12)"
      />
      <rect
        x="11"
        y="2"
        width="2"
        height="5"
        rx="1"
        fill="currentColor"
        opacity="0.5"
        transform="rotate(180 12 12)"
      />
      <rect
        x="11"
        y="2"
        width="2"
        height="5"
        rx="1"
        fill="currentColor"
        opacity="0.375"
        transform="rotate(225 12 12)"
      />
      <rect
        x="11"
        y="2"
        width="2"
        height="5"
        rx="1"
        fill="currentColor"
        opacity="0.25"
        transform="rotate(270 12 12)"
      />
      <rect
        x="11"
        y="2"
        width="2"
        height="5"
        rx="1"
        fill="currentColor"
        opacity="0.125"
        transform="rotate(315 12 12)"
      />
    </svg>
  );
}

export default Spinner;
