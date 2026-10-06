import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones: Record<string, { bg: string; dot: string }> = {
  green: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200/60", dot: "bg-emerald-500" },
  yellow: { bg: "bg-amber-50 text-amber-700 border-amber-200/60", dot: "bg-amber-500" },
  red: { bg: "bg-rose-50 text-rose-700 border-rose-200/60", dot: "bg-rose-500" },
  blue: { bg: "bg-sky-50 text-sky-700 border-sky-200/60", dot: "bg-sky-500" },
  purple: { bg: "bg-indigo-50 text-indigo-700 border-indigo-200/60", dot: "bg-indigo-500" },
  gray: { bg: "bg-slate-100 text-slate-700 border-slate-200/80", dot: "bg-slate-400" },
};

export const Badge = ({
  tone = "gray",
  dot = false,
  children,
  className,
}: {
  tone?: keyof typeof tones;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) => {
  const current = tones[tone] || tones.gray;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        current.bg,
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", current.dot)} />}
      {children}
    </span>
  );
};
