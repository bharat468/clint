import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDisplayDate(isoDateStr?: string): string {
  if (!isoDateStr) return "";
  try {
    const [y, m, d] = isoDateStr.split("-").map(Number);
    if (!y || !m || !d) return isoDateStr;
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDateStr;
  }
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "Select date...",
  min,
  max,
  disabled,
  className,
  name,
  id,
}: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<string>(
    value ?? defaultValue ?? ""
  );

  useEffect(() => {
    if (value !== undefined) {
      setSelectedDate(value);
    }
  }, [value]);

  // Current view year & month for calendar navigation
  const initialView = useMemo(() => {
    const base = selectedDate ? new Date(selectedDate) : new Date();
    return {
      year: isNaN(base.getFullYear()) ? new Date().getFullYear() : base.getFullYear(),
      month: isNaN(base.getMonth()) ? new Date().getMonth() : base.getMonth(),
    };
  }, [selectedDate]);

  const [viewYear, setViewYear] = useState<number>(initialView.year);
  const [viewMonth, setViewMonth] = useState<number>(initialView.month);

  // Sync view when opened
  useEffect(() => {
    if (open && selectedDate) {
      const parts = selectedDate.split("-").map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setViewYear(parts[0]);
        setViewMonth(parts[1] - 1);
      }
    }
  }, [open, selectedDate]);

  // Click outside listener
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Calendar calculations
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay();
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    setSelectedDate(formatted);
    setOpen(false);

    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = formatted;
      const event = new Event("change", { bubbles: true });
      hiddenInputRef.current.dispatchEvent(event);
    }

    if (onChange) {
      onChange(formatted);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate("");
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = "";
      const event = new Event("change", { bubbles: true });
      hiddenInputRef.current.dispatchEvent(event);
    }
    if (onChange) {
      onChange("");
    }
  };

  const handleToday = () => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;
    setSelectedDate(formatted);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setOpen(false);

    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = formatted;
      const event = new Event("change", { bubbles: true });
      hiddenInputRef.current.dispatchEvent(event);
    }
    if (onChange) {
      onChange(formatted);
    }
  };

  const isToday = (day: number) => {
    const now = new Date();
    return (
      now.getFullYear() === viewYear &&
      now.getMonth() === viewMonth &&
      now.getDate() === day
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const [y, m, d] = selectedDate.split("-").map(Number);
    return y === viewYear && m === viewMonth + 1 && d === day;
  };

  const isDateDisabled = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    if (min && dateStr < min) return true;
    if (max && dateStr > max) return true;
    return false;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden input for form integration */}
      <input
        ref={hiddenInputRef}
        type="hidden"
        name={name}
        id={id}
        value={selectedDate}
      />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "h-10.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 transition-all outline-hidden flex items-center justify-between text-left select-none",
          "hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
          open && "border-blue-500 ring-4 ring-blue-500/10",
          disabled && "cursor-not-allowed bg-slate-50 opacity-60",
          className
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarIcon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              selectedDate ? "text-blue-600" : "text-slate-400"
            )}
          />
          <span
            className={cn(
              "truncate font-medium text-xs sm:text-sm",
              !selectedDate && "text-slate-400 font-normal"
            )}
          >
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </span>
        </div>

        {selectedDate && !disabled ? (
          <div
            role="button"
            tabIndex={0}
            onClick={handleClear}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="h-3.5 w-3.5" />
          </div>
        ) : (
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 rotate-90",
              open && "rotate-270 text-blue-600"
            )}
          />
        )}
      </button>

      {/* Calendar Popover */}
      {open && (
        <div className="absolute left-0 mt-1.5 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs font-bold text-slate-800">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAY_NAMES.map((d) => (
              <span
                key={d}
                className="text-[11px] font-semibold text-slate-400 uppercase py-1"
              >
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="h-8" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const today = isToday(day);
              const disabledDay = isDateDisabled(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "h-8 w-8 mx-auto rounded-xl text-xs font-semibold flex items-center justify-center transition-all",
                    selected
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : today
                      ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                    disabledDay &&
                      "opacity-25 cursor-not-allowed hover:bg-transparent text-slate-400"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Selection */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleToday}
              className="px-2.5 py-1 font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
            >
              Today
            </button>
            {selectedDate && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
