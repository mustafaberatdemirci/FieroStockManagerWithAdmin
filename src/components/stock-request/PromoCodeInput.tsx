import { Tag, X } from 'lucide-react';
import type { Campaign } from '../../hooks/useCampaigns';

interface PromoCodeInputProps {
    promoCode: string;
    appliedPromo: Campaign | null;
    promoError: string;
    isPending: boolean;
    onPromoCodeChange: (value: string) => void;
    onApply: () => void;
    onRemove: () => void;
}

export function PromoCodeInput({
    promoCode,
    appliedPromo,
    promoError,
    isPending,
    onPromoCodeChange,
    onApply,
    onRemove,
}: PromoCodeInputProps) {
    if (appliedPromo) {
        return (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="text-sm text-green-700 font-medium flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {appliedPromo.code} uygulandı
                </span>
                <button onClick={onRemove} className="p-1 text-green-600 hover:text-red-500">
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
                    placeholder="Promosyon kodu"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                    type="button"
                    onClick={onApply}
                    disabled={!promoCode || isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {isPending ? '...' : 'Uygula'}
                </button>
            </div>
            {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
        </div>
    );
}
