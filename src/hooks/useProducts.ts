import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
  vatRate: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  categoryId: number;
  category: {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'category' | 'code';
  sortOrder?: 'asc' | 'desc';
}

export function useProducts(params?: ProductsQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async (): Promise<ProductsResponse> => {
      const response = await api.get('/products', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
