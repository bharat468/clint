import type { ReactNode } from "react";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import { Card } from "./card";

export const PageHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action && <div className="flex items-center gap-2.5">{action}</div>}
  </div>
);

export const State = ({
  loading,
  error,
  empty,
  emptyMessage = "No records found yet.",
  emptyAction,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
}) => {
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <div className="rounded-2xl bg-indigo-50/80 p-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-500">Loading data...</p>
      </div>
    );

  if (error)
    return (
      <Card className="flex items-start gap-3 border-rose-200 bg-rose-50/50 p-5 text-sm text-rose-700">
        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
        <div>
          <p className="font-semibold text-rose-800">An error occurred</p>
          <p className="mt-0.5">{error}</p>
        </div>
      </Card>
    );

  if (empty)
    return (
      <Card className="flex flex-col items-center justify-center border-dashed border-slate-300/80 p-12 text-center">
        <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
          <Inbox className="h-8 w-8" />
        </div>
        <h3 className="mt-3 text-base font-semibold text-slate-800">Nothing here yet</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-sm">{emptyMessage}</p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </Card>
    );

  return null;
};
