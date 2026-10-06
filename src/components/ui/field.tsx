import type { ReactNode } from "react";

export const Field = ({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}) => (
  <label className="block space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold tracking-wide text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
    </div>
    {children}
    {error && <span className="block text-xs font-medium text-rose-600 animate-in fade-in duration-150">{error}</span>}
  </label>
);
