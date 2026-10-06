import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "sm" | "md" | "lg" | "icon";
};

const variants = {
  default:
    "bg-blue-600 text-white shadow-xs hover:bg-blue-700 active:scale-[0.98] focus-visible:ring-blue-500",
  secondary:
    "bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-[0.98] focus-visible:ring-blue-400",
  outline:
    "border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] focus-visible:ring-slate-400",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] focus-visible:ring-slate-400",
  destructive:
    "bg-rose-600 text-white shadow-xs hover:bg-rose-700 active:scale-[0.98] focus-visible:ring-rose-500",
};

const sizes = {
  sm: "h-8.5 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-11 px-5 text-base rounded-xl gap-2.5",
  icon: "h-9 w-9 p-0 rounded-xl justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 outline-none select-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
