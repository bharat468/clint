import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { RouteLoadingFallback } from "@/components/ui/RouteLoadingFallback";

export default function SettingsLayout() {
  return (
    <div className="animate-in fade-in duration-150">
      <Suspense fallback={<RouteLoadingFallback />}>
        <Outlet />
      </Suspense>
    </div>
  );
}
