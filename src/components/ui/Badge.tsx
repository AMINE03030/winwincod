import { cn } from "@/lib/utils";
import { ORDER_STATUS_CLASS, ORDER_STATUS_LABELS } from "@/lib/utils";
import type { OrderStatus } from "@/types";

interface BadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
      ORDER_STATUS_CLASS[status],
      className
    )}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

interface TransactionBadgeProps {
  status: "PENDING" | "APPROVED" | "REJECTED";
  className?: string;
}

export function TransactionStatusBadge({ status, className }: TransactionBadgeProps) {
  const map = {
    PENDING:  { cls: "bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]", label: "قيد المراجعة" },
    APPROVED: { cls: "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]", label: "موافق عليه" },
    REJECTED: { cls: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]", label: "مرفوض" },
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", map[status].cls, className)}>
      {map[status].label}
    </span>
  );
}
