import {
  useState,
  useRef,
  useEffect,
  useMemo,
  forwardRef,
  Children,
  isValidElement,
  type ReactNode,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const baseInput =
  "h-10.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(baseInput, className)} {...props} />
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all outline-none hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export interface SelectOptionItem {
  value: string;
  label: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  children?: ReactNode;
  options?: SelectOptionItem[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      children,
      options: directOptions,
      value,
      defaultValue,
      onChange,
      name,
      disabled,
      placeholder,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement | null>(null);
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number; placeAbove?: boolean }>({
      top: 0,
      left: 0,
      width: 0,
    });

    // Extract option items from props.options or children
    const options: SelectOptionItem[] = useMemo(() => {
      if (directOptions && directOptions.length > 0) {
        return directOptions;
      }
      const extracted: SelectOptionItem[] = [];
      Children.forEach(children, (child) => {
        if (isValidElement(child)) {
          const p = child.props as {
            value?: string;
            children?: ReactNode;
            disabled?: boolean;
            icon?: React.ComponentType<{ className?: string }>;
          };
          extracted.push({
            value: p.value !== undefined ? String(p.value) : "",
            label: p.children ?? p.value ?? "",
            disabled: p.disabled,
            icon: p.icon,
          });
        }
      });
      return extracted;
    }, [directOptions, children]);

    const [selectedVal, setSelectedVal] = useState<string>(() => {
      if (value !== undefined) return String(value);
      if (defaultValue !== undefined) return String(defaultValue);
      return options[0]?.value ?? "";
    });

    // Update if controlled value changes
    useEffect(() => {
      if (value !== undefined) {
        setSelectedVal(String(value));
      }
    }, [value]);

    const updateCoords = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < 220 && rect.top > 220;
      setCoords({
        top: placeAbove ? rect.top - 6 : rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        placeAbove,
      });
    };

    useEffect(() => {
      if (!open) return;
      updateCoords();

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          containerRef.current &&
          !containerRef.current.contains(target) &&
          popoverRef.current &&
          !popoverRef.current.contains(target)
        ) {
          setOpen(false);
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };

      const handleScroll = () => {
        updateCoords();
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleScroll);
      };
    }, [open]);

    const handleSelect = (optVal: string) => {
      setSelectedVal(optVal);
      setOpen(false);

      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = optVal;
        const event = new Event("change", { bubbles: true });
        hiddenSelectRef.current.dispatchEvent(event);
      }

      if (onChange) {
        const syntheticEvent = {
          target: { name: name || "", value: optVal },
          currentTarget: { name: name || "", value: optVal },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
    };

    const currentOption = options.find((o) => o.value === selectedVal);
    const TriggerIcon = currentOption?.icon;

    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        {/* Strictly hidden native select for React Hook Form integration (zero dimension, no pointer events) */}
        <select
          ref={(el) => {
            hiddenSelectRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) (ref as React.MutableRefObject<HTMLSelectElement | null>).current = el;
          }}
          name={name}
          value={selectedVal}
          onChange={(e) => setSelectedVal(e.target.value)}
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            width: 0,
            height: 0,
            margin: 0,
            padding: 0,
            border: 0,
          }}
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {typeof opt.label === "string" ? opt.label : opt.value}
            </option>
          ))}
        </select>

        {/* Custom Styled Select Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              updateCoords();
              setOpen((prev) => !prev);
            }
          }}
          className={cn(
            baseInput,
            "cursor-pointer flex items-center justify-between text-left font-normal select-none pr-3.5",
            open && "border-blue-500 ring-4 ring-blue-500/10",
            disabled && "cursor-not-allowed bg-slate-50 opacity-60",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate min-w-0">
            {TriggerIcon && <TriggerIcon className="h-4 w-4 text-blue-600 shrink-0" />}
            <span className={cn("truncate", !currentOption?.value && "text-slate-400 font-normal")}>
              {currentOption ? currentOption.label : placeholder || "Select..."}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ml-2",
              open && "rotate-180 text-blue-600"
            )}
          />
        </button>

        {/* Custom Dropdown Popover Rendered via Portal to Document Body */}
        {open &&
          createPortal(
            <div
              ref={popoverRef}
              style={{
                position: "fixed",
                top: coords.placeAbove ? undefined : coords.top,
                bottom: coords.placeAbove ? window.innerHeight - coords.top : undefined,
                left: coords.left,
                width: coords.width,
                minWidth: Math.max(coords.width, 140),
                zIndex: 99999,
              }}
              className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            >
              {options.map((opt) => {
                const isSelected = opt.value === selectedVal;
                const OptIcon = opt.icon;
                return (
                  <div
                    key={opt.value}
                    onClick={() => !opt.disabled && handleSelect(opt.value)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors select-none",
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                      opt.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0">
                      {OptIcon && (
                        <OptIcon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isSelected ? "text-blue-600" : "text-slate-400"
                          )}
                        />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-blue-600 shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>,
            document.body
          )}
      </div>
    );
  }
);
Select.displayName = "Select";
