import { useMemo } from 'react';
import { Tag } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import type { Campaign, DiscountResult } from '../../hooks/useCampaigns';
import { PromoCodeInput } from './PromoCodeInput';
import type { StockItem } from './CartItemRow';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CartSummaryProps {
    items: StockItem[];
    totalPrice: number;
    totalVAT: number;
    discounts: DiscountResult[];
    totalDiscount: number;
    // Promo code props
    promoCode: string;
    appliedPromo: Campaign | null;
    promoError: string;
    isPromoPending: boolean;
    onPromoCodeChange: (value: string) => void;
    onApplyPromo: () => void;
    onRemovePromo: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CartSummary({
    items,
    totalPrice,
    totalVAT,
    discounts,
    totalDiscount,
    promoCode,
    appliedPromo,
    promoError,
    isPromoPending,
    onPromoCodeChange,
    onApplyPromo,
    onRemovePromo,
}: CartSummaryProps) {
    const vatBreakdown = useMemo(() => {
        const breakdown: Record<string, number> = {};
        items.forEach((item) => {
            const vatRate = (item.vatRate * 100).toFixed(0) + '%';
            const vatAmount = item.price * item.requestedAmount * item.vatRate;
            breakdown[vatRate] = (breakdown[vatRate] || 0) + vatAmount;
        });
        return Object.entries(breakdown).sort(
            (a, b) => parseInt(a[0]) - parseInt(b[0])
        );
    }, [items]);

    return (
        <div className="border-t border-gray-200 pt-6">
            <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                <div className="space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700">Ara Toplam:</span>
                        <span className="text-lg font-medium text-gray-900">
                            {formatPrice(totalPrice)}
                        </span>
                    </div>

                    {/* VAT */}
                    <div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700">KDV Tutarı:</span>
                            <span className="text-lg font-medium text-gray-900">
                                {formatPrice(totalVAT)}
                            </span>
                        </div>
                        {/* VAT Breakdown */}
                        <div className="mt-2 space-y-1">
                            {vatBreakdown.map(([rate, amount]) => (
                                <div
                                    key={rate}
                                    className="flex justify-between items-center text-sm text-gray-600"
                                >
                                    <span className="ml-4">KDV {rate}:</span>
                                    <span>{formatPrice(amount)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Campaign Discounts */}
                    {discounts.length > 0 && (
                        <div className="border-t border-blue-200 pt-3">
                            {discounts.map((d) => (
                                <div key={d.campaignId} className="flex justify-between items-center text-sm">
                                    <span className="text-green-700 flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {d.campaignName}
                                    </span>
                                    <span className="font-medium text-green-600">
                                        -{formatPrice(d.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Promo Code */}
                    <div className="border-t border-blue-200 pt-3">
                        <PromoCodeInput
                            promoCode={promoCode}
                            appliedPromo={appliedPromo}
                            promoError={promoError}
                            isPending={isPromoPending}
                            onPromoCodeChange={onPromoCodeChange}
                            onApply={onApplyPromo}
                            onRemove={onRemovePromo}
                        />
                    </div>

                    {/* Grand Total */}
                    <div className="pt-4 border-t border-blue-200">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900">
                                Genel Toplam:
                            </span>
                            <div className="text-right">
                                {totalDiscount > 0 && (
                                    <span className="text-sm text-gray-400 line-through block">
                                        {formatPrice(totalPrice + totalVAT)}
                                    </span>
                                )}
                                <span className="text-xl sm:text-2xl font-bold text-blue-600">
                                    {formatPrice(totalPrice + totalVAT - totalDiscount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
