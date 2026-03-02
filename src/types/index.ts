export interface User {
  username: string;
  storeName?: string;
  storeId?: string;
  role: 'admin' | 'store';
}

export interface StockItem {
  code: string;
  name: string;
  requestedAmount: number;
  price: number;
  vatRate: number;
}

// Order related types
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CURRENT_ACCOUNT';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  lineTotal: number;
  product: {
    id: string;
    code: string;
    name: string;
    description?: string;
    category?: {
      name: string;
    };
  };
}

export interface Store {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  store: Store;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  paymentReference?: string;
  status: PaymentStatus;
  createdAt: string;
}

// API request/response types
export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

// Legacy types (keep for backward compatibility)
export interface LegacyOrder {
  id: string;
  date: string;
  totalAmount: number;
  status: 'completed' | 'pending';
  paymentMethod: 'current-account' | 'bank-transfer';
  items: Array<{
    name: string;
    amount: number;
    price: number;
  }>;
}
