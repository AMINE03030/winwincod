export type Role = "SELLER" | "CALL_CENTER" | "ADMIN";

export type OrderStatus =
  | "PENDING_BALANCE"
  | "PENDING_CONFIRM"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "NO_ANSWER";

export type TransactionType = "DEPOSIT" | "DEDUCTION" | "PAYOUT" | "REFUND";
export type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Seller {
  id: number;
  sellerId: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  walletBalance: number;
  createdAt: string;
}

export interface Product {
  id: number;
  productId: string;
  title: string;
  description?: string;
  sourcingPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface Order {
  id: number;
  orderId: string;
  sellerId: string;
  productId: string;
  customerName: string;
  customerPhone: string;
  city: string;
  region: string;
  address?: string;
  quantity: number;
  shippingFee: number;
  status: OrderStatus;
  notes?: string;
  callAttempts: number;
  createdAt: string;
  seller?: Seller;
  product?: Product;
}

export interface WalletTransaction {
  id: number;
  transactionId: string;
  sellerId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  receiptUrl?: string;
  status: TransactionStatus;
  createdAt: string;
  seller?: Seller;
}

export interface DashboardStats {
  totalOrders: number;
  pendingConfirm: number;
  readyToShip: number;
  delivered: number;
  walletBalance: number;
}

export interface AdminStats {
  totalSellers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingDeposits: number;
  deliveryRate: number;
}
