import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "financial" | "success";
  noPad?: boolean;
}

export function Card({ className, variant = "default", noPad, children, ...props }: CardProps) {
  const accent = {
    default:   "border-t-[#4361EE]",
    financial: "border-t-[#FB923C]",
    success:   "border-t-[#16A34A]",
  }[variant];

  return (
    <div
      className={cn(
        "bg-white border border-[#E2E8F0] rounded-xl border-t-4",
        accent,
        noPad ? "" : "p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-bold text-[#1E293B]", className)} {...props}>
      {children}
    </h3>
  );
}
