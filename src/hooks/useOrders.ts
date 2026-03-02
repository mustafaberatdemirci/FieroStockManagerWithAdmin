import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { 
  Order, 
  OrdersResponse, 
  OrderResponse, 
  CreateOrderRequest, 
  OrdersQueryParams,
  LegacyOrder 
} from '../types';

// Get orders with pagination and filtering
export function useOrders(params?: OrdersQueryParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async (): Promise<OrdersResponse> => {
      const response = await api.get('/orders', { params });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single order by ID
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async (): Promise<OrderResponse> => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Create new order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderRequest): Promise<OrderResponse> => {
      const response = await api.post('/orders', orderData);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate orders list to refetch with new order
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Add the new order to cache
      queryClient.setQueryData(['orders', data.data.id], data);
    },
    onError: (error) => {
      console.error('Order creation failed:', error);
    },
  });
}

// Update order status (for admin use)
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }): Promise<OrderResponse> => {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Update specific order in cache
      queryClient.setQueryData(['orders', variables.orderId], data);
    },
    onError: (error) => {
      console.error('Order status update failed:', error);
    },
  });
}

// Legacy hook for backward compatibility
export function useLegacyOrders() {
  const queryClient = useQueryClient();

  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ['legacy-orders'],
    queryFn: async (): Promise<LegacyOrder[]> => {
      try {
        const response = await api.get('/orders');
        const ordersData: OrdersResponse = response.data;
        
        // Transform new order format to legacy format
        return ordersData.data.map((order: Order): LegacyOrder => ({
          id: order.orderNumber,
          date: order.createdAt,
          totalAmount: order.totalAmount,
          status: order.status === 'DELIVERED' ? 'completed' : 'pending',
          paymentMethod: order.paymentMethod === 'CURRENT_ACCOUNT' ? 'current-account' : 'bank-transfer',
          items: order.items.map(item => ({
            name: item.product.name,
            amount: item.quantity,
            price: item.unitPrice,
          })),
        }));
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        // Return empty array on error
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const createOrder = useMutation({
    mutationFn: async (order: Omit<LegacyOrder, 'id' | 'date'>): Promise<LegacyOrder> => {
      // Transform legacy format to new API format
      const createOrderData: CreateOrderRequest = {
        items: order.items.map(item => ({
          productId: item.name, // This would need product lookup in real implementation
          quantity: item.amount,
        })),
        paymentMethod: order.paymentMethod === 'current-account' ? 'CURRENT_ACCOUNT' : 'BANK_TRANSFER',
        notes: '', // Legacy orders don't have notes
      };

      const response = await api.post('/orders', createOrderData);
      const newOrder: Order = response.data.data;

      // Transform back to legacy format
      return {
        id: newOrder.orderNumber,
        date: newOrder.createdAt,
        totalAmount: newOrder.totalAmount,
        status: 'pending',
        paymentMethod: order.paymentMethod,
        items: order.items,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legacy-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders: ordersResponse || [],
    isLoading,
    createOrder,
  };
}

// Helper function to format order status for display
export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'Bekliyor',
    CONFIRMED: 'Onaylandı',
    SHIPPED: 'Kargoya Verildi',
    DELIVERED: 'Teslim Edildi',
    CANCELLED: 'İptal Edildi',
  };
  
  return statusMap[status] || status;
}

// Helper function to format payment method for display
export function formatPaymentMethod(method: string): string {
  const methodMap: Record<string, string> = {
    CREDIT_CARD: 'Kredi Kartı',
    BANK_TRANSFER: 'Banka Havalesi',
    CURRENT_ACCOUNT: 'Cari Hesap',
  };
  
  return methodMap[method] || method;
}

// Helper function to get status color
export function getOrderStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    PENDING: 'text-yellow-600 bg-yellow-100',
    CONFIRMED: 'text-blue-600 bg-blue-100',
    SHIPPED: 'text-purple-600 bg-purple-100',
    DELIVERED: 'text-green-600 bg-green-100',
    CANCELLED: 'text-red-600 bg-red-100',
  };
  
  return colorMap[status] || 'text-gray-600 bg-gray-100';
}
