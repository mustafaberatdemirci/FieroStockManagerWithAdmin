import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import type { Campaign, CampaignType } from '../mocks/data';

// ─── Re-export types ─────────────────────────────────────────────────────────
export type { Campaign, CampaignType };

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Active campaigns for store users (auto-apply, no promo code) */
export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const res = await api.get('/campaigns');
      return res.data.data as Campaign[];
    },
  });
}

/** All campaigns for admin */
export function useAdminCampaigns() {
  return useQuery({
    queryKey: ['admin', 'campaigns'],
    queryFn: async () => {
      const res = await api.get('/admin/campaigns');
      return res.data.data as Campaign[];
    },
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export interface CampaignInput {
  name: string;
  description: string;
  type: CampaignType;
  discountValue: number;
  buyQuantity?: number;
  minimumAmount?: number;
  code?: string;
  targetCategories?: string[];
  targetProducts?: string[];
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CampaignInput) => {
      const res = await api.post('/admin/campaigns', input);
      return res.data.data as Campaign;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] }),
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: CampaignInput & { id: string }) => {
      const res = await api.put(`/admin/campaigns/${id}`, input);
      return res.data.data as Campaign;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] }),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/campaigns/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] }),
  });
}

/** Validate a promo code and return the matching campaign */
export function useApplyPromoCode() {
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await api.post('/campaigns/apply-code', { code });
      return res.data.data as Campaign;
    },
  });
}

// ─── Discount Calculator (pure function) ─────────────────────────────────────

interface CartItem {
  productId: string;
  categoryId?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface DiscountResult {
  campaignId: string;
  campaignName: string;
  type: CampaignType;
  amount: number; // total discount in ₺
}

/**
 * Calculate all applicable discounts for a cart.
 * Auto-apply campaigns (no code) are matched by category/product targeting.
 * Promo-code campaigns can be passed separately.
 */
export function calculateDiscounts(
  items: CartItem[],
  campaigns: Campaign[],
  promoCodeCampaign?: Campaign | null,
): DiscountResult[] {
  const results: DiscountResult[] = [];
  const now = new Date().toISOString();

  const allCampaigns = [...campaigns];
  if (promoCodeCampaign) allCampaigns.push(promoCodeCampaign);

  for (const camp of allCampaigns) {
    if (!camp.isActive || camp.startDate > now || camp.endDate < now) continue;

    // Filter items that match this campaign's targeting
    const matching = items.filter(item => {
      if (camp.targetProducts?.length) return camp.targetProducts.includes(item.productId);
      if (camp.targetCategories?.length) return camp.targetCategories.includes(item.categoryId || '');
      return true; // no targeting = all products
    });

    if (matching.length === 0) continue;

    let discount = 0;

    if (camp.type === 'PERCENTAGE') {
      const matchingTotal = matching.reduce((s, i) => s + i.subtotal, 0);
      discount = matchingTotal * (camp.discountValue / 100);
    }

    if (camp.type === 'FIXED') {
      const cartTotal = items.reduce((s, i) => s + i.subtotal, 0);
      if (camp.minimumAmount && cartTotal < camp.minimumAmount) continue;
      discount = camp.discountValue;
    }

    if (camp.type === 'BUY_X_PAY_Y' && camp.buyQuantity) {
      // For each matching item: every X items, pay only Y
      for (const item of matching) {
        const freePerGroup = camp.buyQuantity - camp.discountValue;
        const groups = Math.floor(item.quantity / camp.buyQuantity);
        discount += groups * freePerGroup * item.unitPrice;
      }
    }

    if (discount > 0) {
      results.push({
        campaignId: camp.id,
        campaignName: camp.name,
        type: camp.type,
        amount: Math.round(discount * 100) / 100,
      });
    }
  }

  return results;
}
