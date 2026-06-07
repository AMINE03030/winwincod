import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSellerId(id: number) {
  return `USR-${1000 + id}`;
}

export function generateProductId(id: number) {
  return `PRD-${2000 + id}`;
}

export function generateOrderId(id: number) {
  return `ORD-${5000 + id}`;
}

export function generateTransactionId(id: number) {
  return `WLT-${8000 + id}`;
}

export function formatMAD(amount: number | string) {
  return `${Number(amount).toLocaleString("fr-MA", { minimumFractionDigits: 2 })} درهم`;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_BALANCE: "رصيد غير كافٍ",
  PENDING_CONFIRM: "في انتظار التأكيد",
  READY_TO_SHIP:   "جاهز للشحن",
  SHIPPED:         "في الطريق",
  DELIVERED:       "تم التسليم",
  CANCELLED:       "ملغي",
  NO_ANSWER:       "لا يرد",
};

export const ORDER_STATUS_CLASS: Record<string, string> = {
  PENDING_BALANCE: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
  PENDING_CONFIRM: "bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]",
  READY_TO_SHIP:   "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]",
  SHIPPED:         "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]",
  DELIVERED:       "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]",
  CANCELLED:       "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
  NO_ANSWER:       "bg-[#F8FAFC] text-[#64748B] border border-[#CBD5E1]",
};

export const MOROCCAN_CITIES = [
  "الدار البيضاء","الرباط","مراكش","فاس","طنجة","أكادير","مكناس","سطات",
  "خريبكة","وجدة","الجديدة","القنيطرة","تطوان","الناظور","بني ملال",
  "الحسيمة","خنيفرة","إفران","ورزازات","تيزنيت","العيون",
];

export const MOROCCAN_REGIONS = [
  "الدار البيضاء-سطات","الرباط-سلا-القنيطرة","مراكش-آسفي","فاس-مكناس",
  "طنجة-تطوان-الحسيمة","سوس-ماسة","الشرق","بني ملال-خنيفرة",
  "درعة-تافيلالت","كلميم-واد نون","العيون-الساقية الحمراء","الداخلة-وادي الذهب",
];
