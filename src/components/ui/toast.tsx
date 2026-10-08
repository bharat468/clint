import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  show: boolean;
  type?: "success" | "error" | "info";
  message: string;
  onClose?: () => void;
  duration?: number;
}

export function Toast({
  show,
  type = "success",
  message,
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    if (!show || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto"
    >
      <div
        className={cn(
          "flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4",
          type === "success" &&
            "bg-emerald-950/95 text-emerald-100 border-emerald-700/60 shadow-emerald-900/40",
          type === "error" &&
            "bg-rose-950/95 text-rose-100 border-rose-700/60 shadow-rose-900/40",
          type === "info" &&
            "bg-slate-900/95 text-slate-100 border-slate-700/60 shadow-slate-900/40"
        )}
      >
        {type === "success" && (
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        )}
        {type === "error" && (
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
        )}
        {type === "info" && (
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
        )}

        <span className="leading-snug">{message}</span>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-2 rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss message"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
