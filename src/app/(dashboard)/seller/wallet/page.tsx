"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import Header from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TransactionStatusBadge } from "@/components/ui/Badge";
import { useStore } from "@/lib/store";
import { formatMAD } from "@/lib/utils";
import { Upload, TrendingDown, TrendingUp, Info } from "lucide-react";

const BANK = { bank: "CIH BANK", rib: "230 810 4165823013 23", name: "WinWinCOD SARL" };

export default function WalletPage() {
  const t = useTranslations("SellerWallet");
  const { getCurrentUser, getSellerTransactions, submitDeposit } = useStore();
  const user    = getCurrentUser();
  const [amount, setAmount] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) return null;

  const txs      = getSellerTransactions(user.sellerId).reverse();
  const totalIn  = txs.filter((tx) => tx.type === "DEPOSIT"   && tx.status === "APPROVED").reduce((s, tx) => s + tx.amount, 0);
  const totalOut = txs.filter((tx) => tx.type === "DEDUCTION").reduce((s, tx) => s + tx.amount, 0);

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!receipt) { toast.error(t("errNoReceipt")); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    submitDeposit(user!.sellerId, Number(amount), receipt.name);
    setLoading(false);
    setDone(true);
    setAmount(""); setReceipt(null);
    toast.success(t("toastSubmitted"));
  }

  const colHeaders = [
    t("colId"), t("colType"), t("colAmount"),
    t("colDesc"), t("colStatus"), t("colDate"),
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      <Header title={t("headerTitle")} />

      <div className="flex-1 p-6 space-y-6">
        {/* Wallet hero */}
        <div className="rounded-2xl p-8 text-white" style={{ background: "linear-gradient(135deg, #4361EE, #3254D4)" }}>
          <p className="text-white/70 text-sm font-medium">{t("availableBalance")} — {user.sellerId}</p>
          <p className="text-5xl font-black mt-2">{formatMAD(user.walletBalance)}</p>
          <div className="flex gap-4 mt-5">
            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.15)" }}>
              <p className="text-white/60 text-[10px]">{t("totalDeposits")}</p>
              <p className="text-white font-bold">{formatMAD(totalIn)}</p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.15)" }}>
              <p className="text-white/60 text-[10px]">{t("totalDeductions")}</p>
              <p className="text-white font-bold">{formatMAD(totalOut)}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Deposit form */}
          <Card variant="financial">
            <CardHeader>
              <CardTitle>{t("depositRequestTitle")}</CardTitle>
              <TrendingUp className="w-5 h-5" style={{ color: "#FB923C" }} />
            </CardHeader>

            {done ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F0FDF4] border-2 border-[#BBF7D0] flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-7 h-7 text-[#16A34A]" />
                </div>
                <p className="font-bold text-[#1E293B]">{t("sentTitle")}</p>
                <p className="text-[#64748B] text-sm mt-1">{t("sentDesc")}</p>
                <Button variant="ghost" size="sm" className="mt-4" onClick={() => setDone(false)}>{t("anotherDeposit")}</Button>
              </div>
            ) : (
              <form onSubmit={handleDeposit} className="space-y-4">
                {/* Bank info */}
                <div className="p-3 rounded-xl bg-[#FFF7ED] border border-[#FED7AA]">
                  <p className="text-xs font-bold mb-1" style={{ color: "#FB923C" }}>{t("bankInfoTitle")}</p>
                  <div className="space-y-0.5 text-xs text-[#64748B]">
                    <p>{t("bank")}: <span className="font-semibold text-[#1E293B]">{BANK.bank}</span></p>
                    <p>{t("rib")}: <span className="font-mono font-semibold text-[#1E293B]">{BANK.rib}</span></p>
                    <p>{t("name")}: <span className="font-semibold text-[#1E293B]">{BANK.name}</span></p>
                  </div>
                </div>

                <Input id="amount" type="number" label={t("amountLabel")} placeholder={t("amountPlaceholder")}
                  value={amount} onChange={(e) => setAmount(e.target.value)} min="100" required />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#1E293B]">{t("receiptLabel")}</label>
                  <label className="flex flex-col items-center justify-center gap-2 h-24 border-2 border-dashed border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#4361EE] hover:bg-[#EEF2FF] transition-all">
                    <input type="file" accept="image/*,.pdf" className="hidden"
                      onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} />
                    <Upload className="w-5 h-5 text-[#94A3B8]" />
                    <span className="text-xs text-[#64748B]">{receipt ? receipt.name : t("uploadHint")}</span>
                  </label>
                </div>

                <div className="flex items-start gap-2 text-xs text-[#64748B]">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#4361EE]" />
                  <span>{t("reviewNote")}</span>
                </div>

                <Button type="submit" variant="financial" loading={loading} className="w-full">{t("submitBtn")}</Button>
              </form>
            )}
          </Card>

          {/* Quick stats */}
          <div className="space-y-4">
            {[
              { label: t("approvedDepositsLabel"), val: totalIn,  icon: TrendingDown, color: "#16A34A", bg: "#F0FDF4" },
              { label: t("deductionsLabel"),       val: totalOut, icon: TrendingUp,   color: "#DC2626", bg: "#FEF2F2" },
            ].map(({ label, val, icon: Icon, color, bg }) => (
              <Card key={label} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs text-[#64748B]">{label}</p>
                  <p className="text-xl font-black" style={{ color }}>{formatMAD(val)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Transaction table */}
        <Card noPad>
          <div className="p-5 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-bold text-[#1E293B]">{t("transactionLog")}</h3>
          </div>
          {txs.length === 0 ? (
            <p className="text-center text-[#94A3B8] py-10 text-sm">{t("noTx")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F1F5F9]">
                    {colHeaders.map((h) => (
                      <th key={h} className="py-3 px-4 text-right text-xs font-semibold text-[#94A3B8]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FAFC]">
                  {txs.map((tx) => {
                    const isIn = tx.type === "DEPOSIT" || tx.type === "REFUND";
                    const typeStr =
                      tx.type === "DEPOSIT"   ? t("txDeposit")   :
                      tx.type === "REFUND"    ? t("txRefund")    : t("txDeduction");
                    return (
                      <tr key={tx.transactionId} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-mono font-bold text-xs" style={{ color: "#4361EE" }}>{tx.transactionId}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-semibold ${isIn ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                            {typeStr}
                          </span>
                        </td>
                        <td className={`py-3 px-4 font-bold ${isIn ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                          {isIn ? "+" : "−"}{formatMAD(tx.amount)}
                        </td>
                        <td className="py-3 px-4 text-[#64748B]">{tx.description}</td>
                        <td className="py-3 px-4"><TransactionStatusBadge status={tx.status} /></td>
                        <td className="py-3 px-4 text-[#94A3B8] text-xs">{tx.createdAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
