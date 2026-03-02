import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

// Admin API Types
export interface AdminOrder {
  id: string;
  orderNumber: string;
  storeId: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CURRENT_ACCOUNT';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  store: {
    id: string;
    name: string;
    code: string;
    address?: string;
    phone?: string;
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    lineTotal: number;
    product: {
      id: string;
      code: string;
      name: string;
      price: number;
    };
  }[];
  payments: {
    id: string;
    amount: number;
    paymentMethod: string;
    paymentReference?: string;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    createdAt: string;
  }[];
}

export interface AdminOrdersQuery {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  storeId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface DashboardStats {
  orders: {
    total: number;
    today: number;
    week: number;
    month: number;
    byStatus: {
      pending: number;
      confirmed: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
  };
  revenue: {
    total: number;
    month: number;
  };
  stores: {
    active: number;
    topPerforming: {
      id: string;
      name: string;
      code: string;
      ordersCount: number;
      revenue: number;
    }[];
  };
  products: {
    total: number;
  };
}

export interface AdminStore {
  id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
    lastLoginAt?: string;
  };
  _count: {
    orders: number;
  };
}

// Hooks

/**
 * Get all orders for admin with filtering and pagination
 */
export function useAdminOrders(query: AdminOrdersQuery = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', query],
    queryFn: async (): Promise<AdminOrdersResponse> => {
      const params = new URLSearchParams();
      
      if (query.page) params.append('page', query.page.toString());
      if (query.limit) params.append('limit', query.limit.toString());
      if (query.status) params.append('status', query.status);
      if (query.storeId) params.append('storeId', query.storeId);
      if (query.dateFrom) params.append('dateFrom', query.dateFrom);
      if (query.dateTo) params.append('dateTo', query.dateTo);
      if (query.search) params.append('search', query.search);

      const response = await api.get(`/admin/orders?${params}`);
      return response.data.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Update order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status 
    }: { 
      orderId: string; 
      status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    }) => {
      const response = await api.put(`/admin/orders/${orderId}/status`, { status });
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate admin orders queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
    },
  });
}

/**
 * Get dashboard statistics
 */
export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await api.get('/admin/dashboard/stats');
      return response.data.data;
    },
    staleTime: 60000, // 1 minute
  });
}

/**
 * Get all stores for admin
 */
export function useAdminStores() {
  return useQuery({
    queryKey: ['admin', 'stores'],
    queryFn: async (): Promise<AdminStore[]> => {
      const response = await api.get('/admin/stores');
      return response.data.data;
    },
    staleTime: 300000, // 5 minutes
  });
}

// Store CRUD input
export interface CreateStoreInput {
  name: string;
  code: string;
  address: string;
  phone: string;
  username: string;
  email: string;
  password: string;
}

/**
 * Create a new store
 */
export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateStoreInput) => {
      const response = await api.post('/admin/stores', input);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stores'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
    },
  });
}

/**
 * Update an existing store
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<CreateStoreInput>) => {
      const response = await api.put(`/admin/stores/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stores'] });
    },
  });
}

/**
 * Delete a store
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/stores/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stores'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] });
    },
  });
}

// Helper functions
export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'Beklemede',
    CONFIRMED: 'Onaylandı',
    SHIPPED: 'Kargoya Verildi',
    DELIVERED: 'Teslim Edildi',
    CANCELLED: 'İptal Edildi',
  };
  return statusMap[status] || status;
}

export function formatPaymentMethod(method: string): string {
  const methodMap: Record<string, string> = {
    CREDIT_CARD: 'Kredi Kartı',
    BANK_TRANSFER: 'Havale',
    CURRENT_ACCOUNT: 'Cari Hesap',
  };
  return methodMap[method] || method;
}

export function getOrderStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
