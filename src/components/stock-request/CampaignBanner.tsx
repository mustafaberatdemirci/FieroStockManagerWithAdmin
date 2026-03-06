import { Tag, Percent, Banknote, Gift, Calendar } from 'lucide-react';
import type { Campaign } from '../../hooks/useCampaigns';

interface CampaignBannerProps {
    campaigns: Campaign[];
}

export function CampaignBanner({ campaigns }: CampaignBannerProps) {
    if (campaigns.length === 0) return null;

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Aktif Kampanyalar
                </h2>
            </div>
            <div className="overflow-hidden rounded-xl">
                <div className="campaign-marquee">
                    {/* Duplicate cards for seamless loop */}
                    {[...campaigns, ...campaigns].map((camp, i) => {
                        const isPercentage = camp.type === 'PERCENTAGE';
                        const isFixed = camp.type === 'FIXED';
                        const gradient = isPercentage
                            ? 'from-purple-600 to-violet-700'
                            : isFixed
                                ? 'from-blue-600 to-cyan-700'
                                : 'from-orange-500 to-amber-600';
                        const Icon = isPercentage ? Percent : isFixed ? Banknote : Gift;

                        return (
                            <div
                                key={`${camp.id}-${i}`}
                                className={`flex-shrink-0 w-64 sm:w-72 rounded-xl bg-gradient-to-br ${gradient} p-4 text-white shadow-md`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-2xl font-black">
                                        {isPercentage && `%${camp.discountValue}`}
                                        {isFixed && `${camp.discountValue}₺`}
                                        {camp.type === 'BUY_X_PAY_Y' && `${camp.buyQuantity}→${camp.discountValue}`}
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm leading-tight">{camp.name}</h3>
                                <p className="text-xs text-white/70 mt-1 line-clamp-2">{camp.description}</p>
                                <div className="flex items-center gap-1 mt-3 text-[11px] text-white/60">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(camp.startDate).toLocaleDateString('tr-TR')} — {new Date(camp.endDate).toLocaleDateString('tr-TR')}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
