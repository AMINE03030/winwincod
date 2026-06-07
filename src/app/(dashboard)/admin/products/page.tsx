"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import type { MockProduct } from "@/lib/store";
import { formatMAD } from "@/lib/utils";
import {
  Plus, Pencil, Search, Watch, Headphones, ShoppingBag,
  Utensils, Lightbulb, Sparkles, Package, X, AlertTriangle,
  TrendingUp, Layers,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getProductIcon(title: string): React.ElementType {
  const t = title.toLowerCase();
  if (t.includes("montre") || t.includes("watch")) return Watch;
  if (t.includes("écouteur") || t.includes("bluetooth") || t.includes("audio")) return Headphones;
  if (t.includes("robot") || t.includes("cuisine")) return Utensils;
  if (t.includes("lampe") || t.includes("led") || t.includes("lumière")) return Lightbulb;
  if (t.includes("sac") || t.includes("bag") || t.includes("backpack")) return ShoppingBag;
  if (t.includes("crème") || t.includes("soin") || t.includes("argan")) return Sparkles;
  return Package;
}

const CARD_PALETTE = [
  { bg: "#EEF2FF", color: "#4361EE" },
  { bg: "#FFF7ED", color: "#EA580C" },
  { bg: "#F0FDF4", color: "#16A34A" },
  { bg: "#FEF9C3", color: "#CA8A04" },
  { bg: "#F0F9FF", color: "#0284C7" },
  { bg: "#FDF4FF", color: "#9333EA" },
];

function margin(sourcing: number, selling: number) {
  return Math.round(((selling - sourcing) / sourcing) * 100);
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative w-10 h-5 rounded-full transition-colors duration-300 flex-shrink-0"
      style={{ background: checked ? "#4361EE" : "#CBD5E1" }}
      aria-label={checked ? "Désactiver" : "Activer"}
    >
      <span
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

// ── Add / Edit Modal ──────────────────────────────────────────────────────────

interface FormState {
  title: string;
  description: string;
  sourcingPrice: string;
  sellingPrice: string;
  stockQuantity: string;
}

const EMPTY_FORM: FormState = {
  title: "", description: "", sourcingPrice: "", sellingPrice: "", stockQuantity: "",
};

function ProductModal({
  mode,
  initial,
  onClose,
}: {
  mode: "add" | "edit";
  initial?: MockProduct;
  onClose: () => void;
}) {
  const { addProduct, updateProduct } = useStore();
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          title: initial.title,
          description: initial.description ?? "",
          sourcingPrice: String(initial.sourcingPrice),
          sellingPrice: String(initial.sellingPrice),
          stockQuantity: String(initial.stockQuantity),
        }
      : EMPTY_FORM
  );
  const [loading, setLoading] = useState(false);

  const cost = parseFloat(form.sourcingPrice) || 0;
  const sell = parseFloat(form.sellingPrice) || 0;
  const previewMargin = cost > 0 && sell > cost ? Math.round(((sell - cost) / cost) * 100) : null;

  function set(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = form.title.trim();
    const sourcingPrice = parseFloat(form.sourcingPrice);
    const sellingPrice = parseFloat(form.sellingPrice);
    const stockQuantity = parseInt(form.stockQuantity, 10);

    if (!title) { toast.error("Le nom du produit est requis"); return; }
    if (isNaN(sourcingPrice) || sourcingPrice <= 0) { toast.error("Prix d'achat invalide"); return; }
    if (isNaN(sellingPrice) || sellingPrice <= sourcingPrice) {
      toast.error("Le prix de vente doit être supérieur au prix d'achat");
      return;
    }
    if (isNaN(stockQuantity) || stockQuantity < 0) { toast.error("Stock invalide"); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    if (mode === "add") {
      addProduct({ title, description: form.description.trim() || undefined, sourcingPrice, sellingPrice, stockQuantity });
      toast.success(`Produit "${title}" ajouté avec succès`);
    } else if (initial) {
      updateProduct(initial.productId, { title, description: form.description.trim() || undefined, sourcingPrice, sellingPrice, stockQuantity });
      toast.success(`Produit "${title}" mis à jour`);
    }
    setLoading(false);
    onClose();
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE] bg-white transition-all";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-backdropIn"
        style={{ background: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]"
          style={{ background: "linear-gradient(135deg, #4361EE 0%, #3254D4 100%)" }}>
          <div>
            <h2 className="text-base font-bold text-white">
              {mode === "add" ? "Ajouter un produit" : "Modifier le produit"}
            </h2>
            {mode === "edit" && initial && (
              <p className="text-white/70 text-xs mt-0.5 font-mono">{initial.productId}</p>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
              Nom du produit <span className="text-[#DC2626]">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="ex: Montre connectée Pro"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
              Description <span className="text-[#94A3B8]">(optionnel)</span>
            </label>
            <textarea
              className={inputClass + " resize-none"}
              rows={2}
              placeholder="Description courte du produit..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                Prix d'achat (MAD) <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                className={inputClass}
                placeholder="120"
                value={form.sourcingPrice}
                onChange={(e) => set("sourcingPrice", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                Prix de vente (MAD) <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                className={inputClass}
                placeholder="299"
                value={form.sellingPrice}
                onChange={(e) => set("sellingPrice", e.target.value)}
              />
            </div>
          </div>

          {/* Margin preview */}
          {previewMargin !== null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}>
              <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#16A34A" }} />
              <span className="text-xs font-semibold" style={{ color: "#16A34A" }}>
                Marge estimée : {previewMargin}% — Bénéfice : {formatMAD(sell - cost)} / unité
              </span>
            </div>
          )}

          {/* Stock */}
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
              Stock initial <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="number"
              min="0"
              className={inputClass}
              placeholder="0"
              value={form.stockQuantity}
              onChange={(e) => set("stockQuantity", e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #4361EE, #3254D4)" }}>
              {loading ? "En cours..." : mode === "add" ? "Ajouter le produit" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#64748B] border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({
  product,
  index,
  onEdit,
}: {
  product: MockProduct;
  index: number;
  onEdit: (p: MockProduct) => void;
}) {
  const { toggleProductActive } = useStore();
  const palette = CARD_PALETTE[index % CARD_PALETTE.length];
  const Icon = getProductIcon(product.title);
  const mgn = margin(product.sourcingPrice, product.sellingPrice);
  const profit = product.sellingPrice - product.sourcingPrice;

  const stockStatus =
    product.stockQuantity === 0
      ? { label: "Rupture", cls: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]" }
      : product.stockQuantity < 10
      ? { label: `${product.stockQuantity} restants`, cls: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]" }
      : { label: `${product.stockQuantity} en stock`, cls: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]" };

  return (
    <div className={`card flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${!product.isActive ? "opacity-60" : ""}`}>
      {/* Image placeholder */}
      <div className="relative w-full h-36 rounded-t-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ background: palette.bg }}>
        <Icon className="w-14 h-14 opacity-70" style={{ color: palette.color }} />
        {/* Product ID chip */}
        <span className="absolute bottom-2 right-2 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-sm"
          style={{ color: "#64748B" }}>
          {product.productId}
        </span>
        {/* Inactive overlay */}
        {!product.isActive && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.5)" }}>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#DC2626] border border-[#FECACA] shadow-sm">
              Inactif
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Name + description */}
        <div>
          <h3 className="font-bold text-[#1E293B] text-sm leading-snug">{product.title}</h3>
          {product.description && (
            <p className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-1">{product.description}</p>
          )}
        </div>

        {/* Pricing grid */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl" style={{ background: "#F8FAFC" }}>
          <div>
            <p className="text-[10px] text-[#94A3B8] font-medium">Prix d'achat</p>
            <p className="font-bold text-sm text-[#1E293B]">{formatMAD(product.sourcingPrice)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#94A3B8] font-medium">Prix de vente</p>
            <p className="font-bold text-sm" style={{ color: "#FB923C" }}>{formatMAD(product.sellingPrice)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#94A3B8] font-medium">Marge</p>
            <p className="font-black text-sm" style={{ color: "#16A34A" }}>+{mgn}%</p>
          </div>
          <div>
            <p className="text-[10px] text-[#94A3B8] font-medium">Bénéfice / unité</p>
            <p className="font-bold text-sm" style={{ color: "#4361EE" }}>{formatMAD(profit)}</p>
          </div>
        </div>

        {/* Stock badge */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${stockStatus.cls}`}>
            {product.stockQuantity === 0 && <AlertTriangle className="w-3 h-3" />}
            {stockStatus.label}
          </span>
          {product.stockQuantity > 0 && (
            <div className="flex-1 mx-3 h-1.5 rounded-full overflow-hidden" style={{ background: "#E2E8F0" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((product.stockQuantity / 100) * 100, 100)}%`,
                  background: product.stockQuantity < 10 ? "#FB923C" : "#4361EE",
                }}
              />
            </div>
          )}
        </div>

        {/* Footer: toggle + edit */}
        <div className="flex items-center justify-between pt-1 mt-auto border-t border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <Toggle
              checked={product.isActive}
              onChange={() => {
                toggleProductActive(product.productId);
                toast.success(product.isActive ? "Produit désactivé" : "Produit activé");
              }}
            />
            <span className="text-xs text-[#64748B]">
              {product.isActive ? "Actif" : "Inactif"}
            </span>
          </div>
          <button
            onClick={() => onEdit(product)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] text-[#64748B] hover:text-[#4361EE] hover:border-[#4361EE] hover:bg-[#EEF2FF] transition-all">
            <Pencil className="w-3 h-3" />
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type FilterStatus = "all" | "active" | "inactive";

export default function AdminProductsPage() {
  const { products } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; product?: MockProduct } | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.productId.includes(search);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.isActive) ||
        (statusFilter === "inactive" && !p.isActive);
      return matchSearch && matchStatus;
    });
  }, [products, search, statusFilter]);

  const activeCount   = products.filter((p) => p.isActive).length;
  const inactiveCount = products.filter((p) => !p.isActive).length;
  const outOfStock    = products.filter((p) => p.stockQuantity === 0).length;
  const totalStock    = products.reduce((s, p) => s + p.stockQuantity, 0);

  return (
    <div className="p-6 space-y-5 animate-fadeIn">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total produits", value: products.length, icon: Layers,       iconBg: "#EEF2FF", iconColor: "#4361EE" },
          { label: "Actifs",         value: activeCount,     icon: TrendingUp,   iconBg: "#F0FDF4", iconColor: "#16A34A" },
          { label: "Inactifs",       value: inactiveCount,   icon: Package,      iconBg: "#F8FAFC", iconColor: "#94A3B8" },
          { label: "Rupture stock",  value: outOfStock,      icon: AlertTriangle,iconBg: "#FEF2F2", iconColor: "#DC2626" },
        ].map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: iconBg }}>
              <Icon className="w-4.5 h-4.5" style={{ color: iconColor, width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-xl font-black text-[#1E293B] leading-none">{value}</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Rechercher par nom ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE] bg-white"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex gap-1.5">
          {([
            { key: "all",      label: `Tous (${products.length})` },
            { key: "active",   label: `Actifs (${activeCount})` },
            { key: "inactive", label: `Inactifs (${inactiveCount})` },
          ] as { key: FilterStatus; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
              style={
                statusFilter === key
                  ? { background: "#4361EE", color: "#fff", borderColor: "#4361EE" }
                  : { background: "#fff", color: "#64748B", borderColor: "#E2E8F0" }
              }>
              {label}
            </button>
          ))}
        </div>

        {/* Stock summary pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#64748B]">
          <Layers className="w-3.5 h-3.5 text-[#4361EE]" />
          {totalStock} unités en stock
        </div>

        {/* Add button — pushed to start (right in RTL) */}
        <button
          onClick={() => setModal({ mode: "add" })}
          className="mr-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #4361EE 0%, #3254D4 100%)" }}>
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </button>
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-20 text-[#4361EE]" />
          <p className="text-[#64748B] text-sm">Aucun produit ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.productId}
              product={product}
              index={products.indexOf(product)}
              onEdit={(p) => setModal({ mode: "edit", product: p })}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ProductModal
          mode={modal.mode}
          initial={modal.product}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
