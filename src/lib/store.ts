"use client";

import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "SELLER" | "CALL_CENTER" | "ADMIN";
export type OrderStatus =
  | "PENDING_BALANCE" | "PENDING_CONFIRM" | "READY_TO_SHIP"
  | "SHIPPED" | "DELIVERED" | "CANCELLED" | "NO_ANSWER";
export type TransactionType   = "DEPOSIT" | "DEDUCTION" | "PAYOUT" | "REFUND";
export type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface MockSeller {
  id: number;
  sellerId: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  walletBalance: number;
  blocked: boolean;
  createdAt: string;
}

export interface MockProduct {
  id: number;
  productId: string;
  title: string;
  description?: string;
  sourcingPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface MockOrder {
  id: number;
  orderId: string;
  sellerId: string;
  productId: string;
  productTitle: string;
  customerName: string;
  customerPhone: string;
  city: string;
  region: string;
  address: string;
  quantity: number;
  shippingFee: number;
  totalCost: number;
  status: OrderStatus;
  notes: string;
  callAttempts: number;
  createdAt: string;
}

export interface MockTransaction {
  id: number;
  transactionId: string;
  sellerId: string;
  amount: number;
  type: TransactionType;
  description: string;
  receiptFileName?: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: number;
  requestId: string;
  sellerId: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  status: "PENDING" | "PAID" | "REJECTED";
  createdAt: string;
}

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const INIT_SELLERS: MockSeller[] = [
  { id: 1,  sellerId: "USR-1001", name: "محمد العلوي",        email: "seller@test.com",  password: "password123", phone: "0661234567", role: "SELLER",      walletBalance: 1850, blocked: false, createdAt: "2026-05-01" },
  { id: 2,  sellerId: "USR-1002", name: "نور الهدى المنصوري", email: "seller2@test.com", password: "password123", phone: "0712345678", role: "SELLER",      walletBalance: 520,  blocked: false, createdAt: "2026-05-15" },
  { id: 3,  sellerId: "USR-1003", name: "كريم الإدريسي",      email: "seller3@test.com", password: "password123", phone: "0623456789", role: "SELLER",      walletBalance: 340,  blocked: false, createdAt: "2026-05-20" },
  { id: 4,  sellerId: "USR-1004", name: "خالد بنسعيد",        email: "khaled@test.com",  password: "password123", phone: "0651122334", role: "SELLER",      walletBalance: 1450, blocked: false, createdAt: "2026-05-22" },
  { id: 5,  sellerId: "USR-1005", name: "منى الرشيدي",        email: "mona@test.com",    password: "password123", phone: "0662233445", role: "SELLER",      walletBalance: 320,  blocked: false, createdAt: "2026-05-25" },
  { id: 6,  sellerId: "USR-1006", name: "عمر بن يوسف",        email: "omar@test.com",    password: "password123", phone: "0673344556", role: "SELLER",      walletBalance: 2800, blocked: false, createdAt: "2026-05-28" },
  { id: 7,  sellerId: "USR-1007", name: "رانية الأمين",       email: "rania@test.com",   password: "password123", phone: "0684455667", role: "SELLER",      walletBalance: 0,    blocked: true,  createdAt: "2026-06-01" },
  { id: 8,  sellerId: "USR-1008", name: "يحيى النجاري",       email: "yahya@test.com",   password: "password123", phone: "0695566778", role: "SELLER",      walletBalance: 750,  blocked: false, createdAt: "2026-06-03" },
  { id: 10, sellerId: "AGT-001",  name: "حسناء المرابط",       email: "agent@test.com",   password: "password123", phone: "0634567890", role: "CALL_CENTER", walletBalance: 0,    blocked: false, createdAt: "2026-04-01" },
  { id: 11, sellerId: "ADM-001",  name: "الإدارة",             email: "admin@test.com",   password: "password123", phone: "0600000000", role: "ADMIN",       walletBalance: 0,    blocked: false, createdAt: "2026-01-01" },
];

const INIT_PRODUCTS: MockProduct[] = [
  { id: 1, productId: "PRD-2001", title: "ساعة ذكية X1",          sourcingPrice: 120, sellingPrice: 299, stockQuantity: 45, isActive: true },
  { id: 2, productId: "PRD-2002", title: "سماعات لاسلكية Pro",     sourcingPrice: 85,  sellingPrice: 199, stockQuantity: 22, isActive: true },
  { id: 3, productId: "PRD-2003", title: "حقيبة ظهر مدرسية",      sourcingPrice: 95,  sellingPrice: 249, stockQuantity: 18, isActive: true },
  { id: 4, productId: "PRD-2004", title: "حذاء رياضي نايكي",      sourcingPrice: 140, sellingPrice: 349, stockQuantity: 0,  isActive: true },
  { id: 5, productId: "PRD-2005", title: "مجموعة عناية بالبشرة",  sourcingPrice: 65,  sellingPrice: 149, stockQuantity: 30, isActive: true },
  { id: 6, productId: "PRD-2006", title: "مرطب شعر أرغان",        sourcingPrice: 45,  sellingPrice: 99,  stockQuantity: 60, isActive: true },
];

const INIT_ORDERS: MockOrder[] = [
  { id: 1,  orderId: "ORD-5001", sellerId: "USR-1001", productId: "PRD-2001", productTitle: "ساعة ذكية X1",          customerName: "أحمد العلوي",    customerPhone: "0661234567", city: "الدار البيضاء", region: "الدار البيضاء-سطات",  address: "حي الحسني، شارع محمد الخامس 12",  quantity: 1, shippingFee: 30, totalCost: 150, status: "PENDING_CONFIRM", notes: "",            callAttempts: 0, createdAt: "2026-06-07 10:23" },
  { id: 2,  orderId: "ORD-5002", sellerId: "USR-1001", productId: "PRD-2002", productTitle: "سماعات لاسلكية Pro",    customerName: "فاطمة الزهراء",  customerPhone: "0712345678", city: "مراكش",          region: "مراكش-آسفي",           address: "حي جليز، شارع الحسن الثاني",       quantity: 2, shippingFee: 30, totalCost: 200, status: "READY_TO_SHIP",   notes: "",            callAttempts: 1, createdAt: "2026-06-07 09:15" },
  { id: 3,  orderId: "ORD-5003", sellerId: "USR-1001", productId: "PRD-2003", productTitle: "حقيبة ظهر مدرسية",     customerName: "يوسف بنسالم",   customerPhone: "0623456789", city: "الرباط",          region: "الرباط-سلا-القنيطرة",  address: "أكدال، شارع محمد بيلا 7",          quantity: 1, shippingFee: 35, totalCost: 130, status: "DELIVERED",        notes: "",            callAttempts: 1, createdAt: "2026-06-06 14:00" },
  { id: 4,  orderId: "ORD-5004", sellerId: "USR-1001", productId: "PRD-2001", productTitle: "ساعة ذكية X1",          customerName: "نور الهدى",      customerPhone: "0634567890", city: "فاس",             region: "فاس-مكناس",            address: "حي النصر، زنقة 3",                  quantity: 1, shippingFee: 30, totalCost: 150, status: "PENDING_BALANCE",  notes: "",            callAttempts: 0, createdAt: "2026-06-06 11:30" },
  { id: 5,  orderId: "ORD-5005", sellerId: "USR-1001", productId: "PRD-2004", productTitle: "حذاء رياضي نايكي",     customerName: "كريم الإدريسي", customerPhone: "0645678901", city: "طنجة",            region: "طنجة-تطوان-الحسيمة",  address: "حي البلدة، شارع 9 أبريل",          quantity: 1, shippingFee: 40, totalCost: 180, status: "CANCELLED",        notes: "رفض العميل",  callAttempts: 2, createdAt: "2026-06-05 16:45" },
  { id: 6,  orderId: "ORD-5006", sellerId: "USR-1002", productId: "PRD-2002", productTitle: "سماعات لاسلكية Pro",    customerName: "سارة المنصوري", customerPhone: "0712233445", city: "أكادير",          region: "سوس-ماسة",             address: "حي الأمل، عمارة B",                 quantity: 2, shippingFee: 40, totalCost: 210, status: "PENDING_CONFIRM", notes: "",            callAttempts: 0, createdAt: "2026-06-07 08:50" },
  { id: 7,  orderId: "ORD-5007", sellerId: "USR-1002", productId: "PRD-2005", productTitle: "مجموعة عناية بالبشرة", customerName: "إيمان بنعلي",   customerPhone: "0661122334", city: "مكناس",           region: "فاس-مكناس",            address: "حي المطار، رقم 22",                 quantity: 1, shippingFee: 30, totalCost: 95,  status: "PENDING_CONFIRM", notes: "",            callAttempts: 1, createdAt: "2026-06-07 07:30" },
  { id: 8,  orderId: "ORD-5008", sellerId: "USR-1004", productId: "PRD-2001", productTitle: "ساعة ذكية X1",          customerName: "لمياء الحسيني", customerPhone: "0671234567", city: "الدار البيضاء", region: "الدار البيضاء-سطات",  address: "درب السلطان، زنقة 5",              quantity: 1, shippingFee: 30, totalCost: 150, status: "DELIVERED",        notes: "",            callAttempts: 1, createdAt: "2026-06-06 09:00" },
  { id: 9,  orderId: "ORD-5009", sellerId: "USR-1004", productId: "PRD-2003", productTitle: "حقيبة ظهر مدرسية",     customerName: "ياسين البوهالي",customerPhone: "0682345678", city: "الرباط",          region: "الرباط-سلا-القنيطرة",  address: "حي التقدم، شارع 2",                quantity: 2, shippingFee: 35, totalCost: 225, status: "READY_TO_SHIP",   notes: "",            callAttempts: 1, createdAt: "2026-06-05 11:00" },
  { id: 10, orderId: "ORD-5010", sellerId: "USR-1006", productId: "PRD-2006", productTitle: "مرطب شعر أرغان",       customerName: "زينب الطاهري",  customerPhone: "0693456789", city: "مراكش",          region: "مراكش-آسفي",           address: "حي الورود، رقم 14",                quantity: 3, shippingFee: 30, totalCost: 165, status: "DELIVERED",        notes: "",            callAttempts: 1, createdAt: "2026-06-04 15:30" },
  { id: 11, orderId: "ORD-5011", sellerId: "USR-1006", productId: "PRD-2005", productTitle: "مجموعة عناية بالبشرة", customerName: "حنان المسعودي", customerPhone: "0654567890", city: "أكادير",          region: "سوس-ماسة",             address: "حي الزيتون، شارع 7",               quantity: 1, shippingFee: 40, totalCost: 105, status: "DELIVERED",        notes: "",            callAttempts: 1, createdAt: "2026-06-03 10:00" },
  { id: 12, orderId: "ORD-5012", sellerId: "USR-1008", productId: "PRD-2004", productTitle: "حذاء رياضي نايكي",     customerName: "مصطفى الغزال",  customerPhone: "0665678901", city: "طنجة",            region: "طنجة-تطوان-الحسيمة",  address: "المغرب العربي، عمارة 3",            quantity: 1, shippingFee: 40, totalCost: 180, status: "CANCELLED",        notes: "",            callAttempts: 3, createdAt: "2026-06-02 08:20" },
];

const INIT_TRANSACTIONS: MockTransaction[] = [
  { id: 1, transactionId: "WLT-8001", sellerId: "USR-1001", amount: 2000, type: "DEPOSIT",   description: "إيداع بنكي",         status: "APPROVED", createdAt: "2026-05-28 10:00" },
  { id: 2, transactionId: "WLT-8002", sellerId: "USR-1001", amount: 150,  type: "DEDUCTION", description: "خصم ORD-5001",        status: "APPROVED", createdAt: "2026-06-07 10:23" },
  { id: 3, transactionId: "WLT-8003", sellerId: "USR-1001", amount: 200,  type: "DEDUCTION", description: "خصم ORD-5002",        status: "APPROVED", createdAt: "2026-06-07 09:15" },
  { id: 4, transactionId: "WLT-8004", sellerId: "USR-1002", amount: 800,  type: "DEPOSIT",   description: "إيداع بنكي",         status: "APPROVED", createdAt: "2026-06-01 09:00" },
  { id: 5, transactionId: "WLT-8005", sellerId: "USR-1002", amount: 210,  type: "DEDUCTION", description: "خصم ORD-5006",        status: "APPROVED", createdAt: "2026-06-07 08:50" },
  { id: 6, transactionId: "WLT-8006", sellerId: "USR-1003", amount: 500,  type: "DEPOSIT",   description: "إيداع بنكي",         status: "PENDING",  receiptFileName: "virement_juin.jpg", createdAt: "2026-06-07 11:00" },
  { id: 7, transactionId: "WLT-8007", sellerId: "USR-1001", amount: 750,  type: "DEPOSIT",   description: "إيداع بنكي",         status: "PENDING",  receiptFileName: "receipt_1001.jpg",  createdAt: "2026-06-07 12:30" },
  { id: 8, transactionId: "WLT-8008", sellerId: "USR-1004", amount: 1500, type: "DEPOSIT",   description: "إيداع بنكي",         status: "APPROVED", createdAt: "2026-05-30 14:00" },
  { id: 9, transactionId: "WLT-8009", sellerId: "USR-1004", amount: 150,  type: "DEDUCTION", description: "خصم ORD-5008",        status: "APPROVED", createdAt: "2026-06-06 09:00" },
  { id: 10,transactionId: "WLT-8010", sellerId: "USR-1006", amount: 3000, type: "DEPOSIT",   description: "إيداع بنكي",         status: "APPROVED", createdAt: "2026-06-01 10:00" },
  { id: 11,transactionId: "WLT-8011", sellerId: "USR-1006", amount: 165,  type: "DEDUCTION", description: "خصم ORD-5010",        status: "APPROVED", createdAt: "2026-06-04 15:30" },
  { id: 12,transactionId: "WLT-8012", sellerId: "USR-1006", amount: 105,  type: "DEDUCTION", description: "خصم ORD-5011",        status: "APPROVED", createdAt: "2026-06-03 10:00" },
  { id: 13,transactionId: "WLT-8013", sellerId: "USR-1008", amount: 1000, type: "DEPOSIT",   description: "إيداع بنكي",         status: "APPROVED", createdAt: "2026-06-02 08:00" },
  { id: 14,transactionId: "WLT-8014", sellerId: "USR-1008", amount: 180,  type: "DEDUCTION", description: "خصم ORD-5012",        status: "APPROVED", createdAt: "2026-06-02 08:20" },
  { id: 15,transactionId: "WLT-8015", sellerId: "USR-1008", amount: 180,  type: "REFUND",    description: "استرداد ORD-5012 — إلغاء", status: "APPROVED", createdAt: "2026-06-03 10:15" },
];

const INIT_WITHDRAWALS: WithdrawalRequest[] = [
  { id: 1, requestId: "WDR-0001", sellerId: "USR-1006", amount: 1500, bankName: "Attijariwafa Bank", bankAccount: "007 780 0001234567 89", status: "PENDING",  createdAt: "2026-06-07 09:00" },
  { id: 2, requestId: "WDR-0002", sellerId: "USR-1001", amount: 800,  bankName: "CIH BANK",          bankAccount: "230 811 0009876543 21", status: "PENDING",  createdAt: "2026-06-06 17:30" },
  { id: 3, requestId: "WDR-0003", sellerId: "USR-1004", amount: 500,  bankName: "BMCE Bank",         bankAccount: "011 780 0005678901 23", status: "PAID",     createdAt: "2026-06-05 11:00" },
  { id: 4, requestId: "WDR-0004", sellerId: "USR-1002", amount: 300,  bankName: "Banque Populaire",  bankAccount: "101 780 0003456789 01", status: "REJECTED", createdAt: "2026-06-04 14:00" },
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface AppState {
  currentUserId: string | null;
  sellers: MockSeller[];
  products: MockProduct[];
  orders: MockOrder[];
  transactions: MockTransaction[];
  withdrawalRequests: WithdrawalRequest[];
  _orderCounter: number;
  _txCounter: number;
  _sellerCounter: number;
  _wdrCounter: number;

  // Auth
  login: (email: string, password: string) => { success: boolean; role?: Role; error?: string };
  logout: () => void;
  register: (data: { name: string; email: string; phone: string; password: string }) => { success: boolean; error?: string };

  // Orders
  addOrder: (data: {
    productId: string;
    customerName: string;
    customerPhone: string;
    city: string;
    region: string;
    address: string;
    quantity: number;
    notes: string;
  }) => { success: boolean; status: OrderStatus; message: string };
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;

  // Wallet
  submitDeposit: (sellerId: string, amount: number, receiptFileName: string) => void;
  approveDeposit: (transactionId: string) => void;
  rejectDeposit: (transactionId: string) => void;

  // Admin — seller management
  blockSeller: (sellerId: string) => void;
  unblockSeller: (sellerId: string) => void;
  adjustBalance: (sellerId: string, amount: number, description: string) => void;

  // Admin — withdrawal management
  approveWithdrawal: (requestId: string) => void;
  rejectWithdrawal: (requestId: string) => void;

  // Admin — products
  addProduct: (data: Omit<MockProduct, "id" | "productId" | "isActive">) => void;

  // Getters
  getCurrentUser: () => MockSeller | null;
  getSellerOrders: (sellerId: string) => MockOrder[];
  getSellerTransactions: (sellerId: string) => MockTransaction[];
  getPendingConfirmOrders: () => MockOrder[];
  getPendingDeposits: () => MockTransaction[];
  getPendingWithdrawals: () => WithdrawalRequest[];
}

export const useStore = create<AppState>()((set, get) => ({
  currentUserId: null,
  sellers: INIT_SELLERS,
  products: INIT_PRODUCTS,
  orders: INIT_ORDERS,
  transactions: INIT_TRANSACTIONS,
  withdrawalRequests: INIT_WITHDRAWALS,
  _orderCounter: 13,
  _txCounter: 16,
  _sellerCounter: 9,
  _wdrCounter: 5,

  // ── Auth ──────────────────────────────────────────────────────────────────

  login(email, password) {
    const seller = get().sellers.find(
      (s) => s.email.toLowerCase() === email.toLowerCase() && s.password === password
    );
    if (!seller) return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    if (seller.blocked) return { success: false, error: "هذا الحساب موقوف. تواصل مع الإدارة." };
    set({ currentUserId: seller.sellerId });
    return { success: true, role: seller.role };
  },

  logout() {
    set({ currentUserId: null });
  },

  register({ name, email, phone, password }) {
    const existing = get().sellers.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (existing) return { success: false, error: "البريد الإلكتروني مستخدم بالفعل" };
    const counter = get()._sellerCounter + 1;
    const newSeller: MockSeller = {
      id: counter + 10,
      sellerId: `USR-${1000 + counter}`,
      name, email, phone, password,
      role: "SELLER",
      walletBalance: 0,
      blocked: false,
      createdAt: new Date().toISOString().split("T")[0],
    };
    set((s) => ({
      sellers: [...s.sellers, newSeller],
      currentUserId: newSeller.sellerId,
      _sellerCounter: counter,
    }));
    return { success: true };
  },

  // ── Orders ────────────────────────────────────────────────────────────────

  addOrder({ productId, customerName, customerPhone, city, region, address, quantity, notes }) {
    const state = get();
    const seller = state.sellers.find((s) => s.sellerId === state.currentUserId);
    const product = state.products.find((p) => p.productId === productId);
    if (!seller || !product) return { success: false, status: "PENDING_BALANCE", message: "خطأ داخلي" };

    const shippingFee = 30;
    const totalCost = product.sourcingPrice * quantity + shippingFee;
    const hasFunds = seller.walletBalance >= totalCost;
    const orderStatus: OrderStatus = hasFunds ? "PENDING_CONFIRM" : "PENDING_BALANCE";

    const counter = state._orderCounter + 1;
    const txCounter = state._txCounter + 1;

    const newOrder: MockOrder = {
      id: counter + 100,
      orderId: `ORD-${5000 + counter}`,
      sellerId: seller.sellerId,
      productId,
      productTitle: product.title,
      customerName, customerPhone, city, region,
      address: address || "",
      quantity,
      shippingFee,
      totalCost,
      status: orderStatus,
      notes: notes || "",
      callAttempts: 0,
      createdAt: new Date().toLocaleString("fr-MA"),
    };

    const updates: Partial<AppState> = {
      orders: [...state.orders, newOrder],
      _orderCounter: counter,
    };

    if (hasFunds) {
      updates.sellers = state.sellers.map((s) =>
        s.sellerId === seller.sellerId
          ? { ...s, walletBalance: s.walletBalance - totalCost }
          : s
      );
      const newTx: MockTransaction = {
        id: txCounter + 100,
        transactionId: `WLT-${8000 + txCounter}`,
        sellerId: seller.sellerId,
        amount: totalCost,
        type: "DEDUCTION",
        description: `خصم ${newOrder.orderId}`,
        status: "APPROVED",
        createdAt: new Date().toLocaleString("fr-MA"),
      };
      updates.transactions = [...state.transactions, newTx];
      updates._txCounter = txCounter;
    }

    set(updates as AppState);

    return {
      success: true,
      status: orderStatus,
      message: hasFunds
        ? `تم إنشاء الطلب ${newOrder.orderId} وخصم ${totalCost} درهم من المحفظة`
        : `تم حفظ الطلب ${newOrder.orderId} كمعلق — الرصيد غير كافٍ`,
    };
  },

  updateOrderStatus(orderId, newStatus) {
    const state = get();
    const order = state.orders.find((o) => o.orderId === orderId);
    if (!order) return;

    let sellersUpdate = state.sellers;
    let transactionsUpdate = state.transactions;
    const txCounter = state._txCounter + 1;

    if (newStatus === "CANCELLED" && order.status === "PENDING_CONFIRM") {
      sellersUpdate = state.sellers.map((s) =>
        s.sellerId === order.sellerId
          ? { ...s, walletBalance: s.walletBalance + order.totalCost }
          : s
      );
      const refundTx: MockTransaction = {
        id: txCounter + 100,
        transactionId: `WLT-${8000 + txCounter}`,
        sellerId: order.sellerId,
        amount: order.totalCost,
        type: "REFUND",
        description: `استرداد ${orderId} — إلغاء`,
        status: "APPROVED",
        createdAt: new Date().toLocaleString("fr-MA"),
      };
      transactionsUpdate = [...state.transactions, refundTx];
    }

    set({
      orders: state.orders.map((o) =>
        o.orderId === orderId
          ? { ...o, status: newStatus, callAttempts: o.callAttempts + (newStatus === "NO_ANSWER" ? 1 : 0) }
          : o
      ),
      sellers: sellersUpdate,
      transactions: transactionsUpdate,
      _txCounter: newStatus === "CANCELLED" && order.status === "PENDING_CONFIRM" ? txCounter : state._txCounter,
    });
  },

  // ── Wallet ────────────────────────────────────────────────────────────────

  submitDeposit(sellerId, amount, receiptFileName) {
    const state = get();
    const counter = state._txCounter + 1;
    const newTx: MockTransaction = {
      id: counter + 100,
      transactionId: `WLT-${8000 + counter}`,
      sellerId,
      amount,
      type: "DEPOSIT",
      description: "إيداع بنكي",
      receiptFileName,
      status: "PENDING",
      createdAt: new Date().toLocaleString("fr-MA"),
    };
    set((s) => ({
      transactions: [...s.transactions, newTx],
      _txCounter: counter,
    }));
  },

  approveDeposit(transactionId) {
    const state = get();
    const tx = state.transactions.find((t) => t.transactionId === transactionId);
    if (!tx || tx.status !== "PENDING") return;

    const updatedSellers = state.sellers.map((s) =>
      s.sellerId === tx.sellerId ? { ...s, walletBalance: s.walletBalance + tx.amount } : s
    );

    const seller = updatedSellers.find((s) => s.sellerId === tx.sellerId);
    let updatedOrders = state.orders;
    const newTxs: MockTransaction[] = [];
    let txCounter = state._txCounter;

    if (seller) {
      let remainingBalance = seller.walletBalance;
      updatedOrders = state.orders.map((o) => {
        if (o.sellerId === tx.sellerId && o.status === "PENDING_BALANCE" && remainingBalance >= o.totalCost) {
          remainingBalance -= o.totalCost;
          txCounter += 1;
          newTxs.push({
            id: txCounter + 100,
            transactionId: `WLT-${8000 + txCounter}`,
            sellerId: tx.sellerId,
            amount: o.totalCost,
            type: "DEDUCTION",
            description: `خصم تلقائي ${o.orderId} بعد الإيداع`,
            status: "APPROVED",
            createdAt: new Date().toLocaleString("fr-MA"),
          });
          return { ...o, status: "PENDING_CONFIRM" as OrderStatus };
        }
        return o;
      });
      updatedSellers.forEach((s, i) => {
        if (s.sellerId === tx.sellerId) updatedSellers[i] = { ...s, walletBalance: remainingBalance };
      });
    }

    set({
      transactions: [
        ...state.transactions.map((t) =>
          t.transactionId === transactionId ? { ...t, status: "APPROVED" as TransactionStatus } : t
        ),
        ...newTxs,
      ],
      sellers: updatedSellers,
      orders: updatedOrders,
      _txCounter: txCounter,
    });
  },

  rejectDeposit(transactionId) {
    set((s) => ({
      transactions: s.transactions.map((t) =>
        t.transactionId === transactionId ? { ...t, status: "REJECTED" as TransactionStatus } : t
      ),
    }));
  },

  // ── Admin — seller management ─────────────────────────────────────────────

  blockSeller(sellerId) {
    set((s) => ({
      sellers: s.sellers.map((seller) =>
        seller.sellerId === sellerId ? { ...seller, blocked: true } : seller
      ),
    }));
  },

  unblockSeller(sellerId) {
    set((s) => ({
      sellers: s.sellers.map((seller) =>
        seller.sellerId === sellerId ? { ...seller, blocked: false } : seller
      ),
    }));
  },

  adjustBalance(sellerId, amount, description) {
    const state = get();
    const txCounter = state._txCounter + 1;
    const type: TransactionType = amount >= 0 ? "DEPOSIT" : "DEDUCTION";
    const absAmount = Math.abs(amount);

    set((s) => ({
      sellers: s.sellers.map((seller) =>
        seller.sellerId === sellerId
          ? { ...seller, walletBalance: Math.max(0, seller.walletBalance + amount) }
          : seller
      ),
      transactions: [
        ...s.transactions,
        {
          id: txCounter + 100,
          transactionId: `WLT-${8000 + txCounter}`,
          sellerId,
          amount: absAmount,
          type,
          description: description || (amount >= 0 ? "تعديل رصيد — إضافة" : "تعديل رصيد — خصم"),
          status: "APPROVED" as TransactionStatus,
          createdAt: new Date().toLocaleString("fr-MA"),
        },
      ],
      _txCounter: txCounter,
    }));
  },

  // ── Admin — withdrawal management ────────────────────────────────────────

  approveWithdrawal(requestId) {
    const state = get();
    const req = state.withdrawalRequests.find((r) => r.requestId === requestId);
    if (!req || req.status !== "PENDING") return;

    const txCounter = state._txCounter + 1;

    set((s) => ({
      withdrawalRequests: s.withdrawalRequests.map((r) =>
        r.requestId === requestId ? { ...r, status: "PAID" as const } : r
      ),
      sellers: s.sellers.map((seller) =>
        seller.sellerId === req.sellerId
          ? { ...seller, walletBalance: Math.max(0, seller.walletBalance - req.amount) }
          : seller
      ),
      transactions: [
        ...s.transactions,
        {
          id: txCounter + 100,
          transactionId: `WLT-${8000 + txCounter}`,
          sellerId: req.sellerId,
          amount: req.amount,
          type: "PAYOUT" as TransactionType,
          description: `صرف ${requestId}`,
          status: "APPROVED" as TransactionStatus,
          createdAt: new Date().toLocaleString("fr-MA"),
        },
      ],
      _txCounter: txCounter,
    }));
  },

  rejectWithdrawal(requestId) {
    set((s) => ({
      withdrawalRequests: s.withdrawalRequests.map((r) =>
        r.requestId === requestId ? { ...r, status: "REJECTED" as const } : r
      ),
    }));
  },

  // ── Admin — products ──────────────────────────────────────────────────────

  addProduct({ title, description, sourcingPrice, sellingPrice, stockQuantity }) {
    const state = get();
    const newId = state.products.length + 1;
    const newProduct: MockProduct = {
      id: newId,
      productId: `PRD-${2000 + newId}`,
      title, description, sourcingPrice, sellingPrice, stockQuantity,
      isActive: true,
    };
    set((s) => ({ products: [...s.products, newProduct] }));
  },

  // ── Getters ───────────────────────────────────────────────────────────────

  getCurrentUser() {
    const state = get();
    return state.sellers.find((s) => s.sellerId === state.currentUserId) ?? null;
  },

  getSellerOrders(sellerId) {
    return get().orders.filter((o) => o.sellerId === sellerId);
  },

  getSellerTransactions(sellerId) {
    return get().transactions.filter((t) => t.sellerId === sellerId);
  },

  getPendingConfirmOrders() {
    return get().orders.filter((o) => o.status === "PENDING_CONFIRM");
  },

  getPendingDeposits() {
    return get().transactions.filter((t) => t.type === "DEPOSIT" && t.status === "PENDING");
  },

  getPendingWithdrawals() {
    return get().withdrawalRequests.filter((r) => r.status === "PENDING");
  },
}));
