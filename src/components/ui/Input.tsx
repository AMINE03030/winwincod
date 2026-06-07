import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-[#1E293B]">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[#1E293B] placeholder:text-[#94A3B8] text-sm outline-none transition-all",
            "focus:border-[#4361EE] focus:ring-2 focus:ring-[rgba(67,97,238,0.15)]",
            error && "border-[#DC2626] focus:border-[#DC2626] focus:ring-[rgba(220,38,38,0.15)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
