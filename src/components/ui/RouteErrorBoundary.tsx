import { useRouteError, useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";

export function RouteErrorBoundary() {
  const error: any = useRouteError();
  const navigate = useNavigate();

  const errorMessage =
    error?.message ||
    error?.statusText ||
    "An unexpected error occurred while loading this view.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans">
      <Card className="max-w-md w-full p-8 bg-white border border-slate-200/90 text-center rounded-2xl shadow-xl space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto border border-rose-100 shadow-2xs">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h2 className="text-xl font-bold text-slate-900">Application Error</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          {errorMessage}
        </p>

        <div className="flex items-center justify-center gap-3 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2 text-xs font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload Page</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs font-semibold shadow-xs"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Return to Home</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
