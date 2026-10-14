import { Loader2 } from "lucide-react";

export function RouteLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="flex min-h-[60vh] w-full flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200"
    >
      <div className="relative flex items-center justify-center">
        {/* Soft radial pulse blur */}
        <div className="absolute h-16 w-16 rounded-full bg-blue-500/10 animate-ping" />
        
        {/* Primary spinning brand indicator */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200/80 shadow-md">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-sm font-semibold text-slate-800 tracking-tight">
          Loading view...
        </p>
        <p className="text-xs text-slate-400">
          Fetching modular components and data
        </p>
      </div>
    </div>
  );
}

export default RouteLoadingFallback;
