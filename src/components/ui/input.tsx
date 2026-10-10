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
    const hiddenSelectRef = useRef<HTMLSelectElement | null>(null);
    const [open, setOpen] = useState(false);

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

    // Close on click outside
    useEffect(() => {
      if (!open) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
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
      <div ref={containerRef} className="relative w-full">
        {/* Hidden select for React Hook Form integration */}
        <select
          ref={(el) => {
            hiddenSelectRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) (ref as React.MutableRefObject<HTMLSelectElement | null>).current = el;
          }}
          name={name}
          value={selectedVal}
          onChange={(e) => setSelectedVal(e.target.value)}
          className="sr-only pointer-events-none"
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

        {/* Custom Select Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
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

        {/* Custom Dropdown Popover */}
        {open && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl animate-in fade-in zoom-in-95 duration-150">
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
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
