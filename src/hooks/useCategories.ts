import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface CategoriesQueryParams {
  includeProducts?: boolean;
  includeProductCounts?: boolean;
}

export function useCategories(params?: CategoriesQueryParams) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: async (): Promise<CategoriesResponse> => {
      const response = await api.get('/categories', { params });
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}
