import { Spinner } from "@/components/ui/spinner";

export function RouteLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading workspace..."
      className="flex min-h-[40vh] w-full flex-col items-center justify-center p-8 text-center animate-in fade-in duration-150"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <Spinner size="lg" className="text-slate-700" />
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500 tracking-wide">
        Loading workspace...
      </p>
    </div>
  );
}

export default RouteLoadingFallback;
