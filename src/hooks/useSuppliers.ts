import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import type { Supplier } from '../mocks/data';

export type { Supplier };

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Active suppliers for store users */
export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await api.get('/suppliers');
      return res.data.data as Supplier[];
    },
  });
}

/** All suppliers for admin */
export function useAdminSuppliers() {
  return useQuery({
    queryKey: ['admin', 'suppliers'],
    queryFn: async () => {
      const res = await api.get('/admin/suppliers');
      return res.data.data as Supplier[];
    },
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export interface SupplierInput {
  name: string;
  taxNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  bankName?: string;
  iban?: string;
  accountHolder?: string;
  apiUrl?: string;
  apiKey?: string;
  webhookUrl?: string;
  paymentMethods: string[];
  isActive?: boolean;
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SupplierInput) => {
      const res = await api.post('/admin/suppliers', input);
      return res.data.data as Supplier;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'suppliers'] }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: SupplierInput & { id: string }) => {
      const res = await api.put(`/admin/suppliers/${id}`, input);
      return res.data.data as Supplier;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'suppliers'] }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/suppliers/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'suppliers'] }),
  });
}
