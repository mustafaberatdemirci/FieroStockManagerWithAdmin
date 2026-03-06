import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Pencil, Trash2, Search, Tag, Percent, DollarSign, Gift,
    Calendar, AlertCircle, X, Loader2,
} from 'lucide-react';
import {
    useAdminCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign,
    type Campaign, type CampaignInput, type CampaignType,
} from '../hooks/useCampaigns';

const TYPE_LABELS: Record<CampaignType, string> = {
    PERCENTAGE: 'Yüzde İndirim',
    FIXED: 'Sabit İndirim',
    BUY_X_PAY_Y: 'X Al Y Öde',
};

const TYPE_ICONS: Record<CampaignType, typeof Percent> = {
    PERCENTAGE: Percent,
    FIXED: DollarSign,
    BUY_X_PAY_Y: Gift,
};

const TYPE_COLORS: Record<CampaignType, string> = {
    PERCENTAGE: 'bg-purple-100 text-purple-700',
    FIXED: 'bg-blue-100 text-blue-700',
    BUY_X_PAY_Y: 'bg-orange-100 text-orange-700',
};

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getCampaignStatus(c: Campaign): { label: string; color: string } {
    const now = new Date();
    if (!c.isActive) return { label: 'Pasif', color: 'bg-gray-100 text-gray-600' };
    if (new Date(c.startDate) > now) return { label: 'Yakında', color: 'bg-yellow-100 text-yellow-700' };
    if (new Date(c.endDate) < now) return { label: 'Süresi Dolmuş', color: 'bg-red-100 text-red-600' };
    return { label: 'Aktif', color: 'bg-green-100 text-green-700' };
}

const EMPTY_FORM: CampaignInput = {
    name: '', description: '', type: 'PERCENTAGE', discountValue: 0,
    startDate: '', endDate: '', isActive: true,
};

export default function AdminCampaignsPage() {
    const navigate = useNavigate();
    const { data: campaigns = [], isLoading } = useAdminCampaigns();
    const createMut = useCreateCampaign();
    const updateMut = useUpdateCampaign();
    const deleteMut = useDeleteCampaign();

    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<CampaignInput>(EMPTY_FORM);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const filtered = campaigns.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        (c.code && c.code.toLowerCase().includes(search.toLowerCase()))
    );

    const openCreate = () => {
        setEditId(null);
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setForm({
            ...EMPTY_FORM,
            startDate: now.toISOString().slice(0, 10),
            endDate: nextMonth.toISOString().slice(0, 10),
        });
        setShowModal(true);
    };

    const openEdit = (c: Campaign) => {
        setEditId(c.id);
        setForm({
            name: c.name,
            description: c.description,
            type: c.type,
            discountValue: c.discountValue,
            buyQuantity: c.buyQuantity,
            minimumAmount: c.minimumAmount,
            code: c.code,
            targetCategories: c.targetCategories,
            targetProducts: c.targetProducts,
            startDate: c.startDate.slice(0, 10),
            endDate: c.endDate.slice(0, 10),
            isActive: c.isActive,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        const payload = {
            ...form,
            startDate: new Date(form.startDate).toISOString(),
            endDate: new Date(form.endDate).toISOString(),
        };
        if (editId) {
            await updateMut.mutateAsync({ id: editId, ...payload });
        } else {
            await createMut.mutateAsync(payload);
        }
        setShowModal(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteMut.mutateAsync(deleteId);
        setDeleteId(null);
    };

    const isSaving = createMut.isPending || updateMut.isPending;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/admin')} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Tag className="w-6 h-6 text-purple-600" />
                                Kampanya Yönetimi
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">{campaigns.length} kampanya</p>
                        </div>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Kampanya
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Kampanya ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                )}

                {/* Table */}
                {!isLoading && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Kampanya</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Tür</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">İndirim</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Kod</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Tarih</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Durum</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtered.map(c => {
                                        const status = getCampaignStatus(c);
                                        const Icon = TYPE_ICONS[c.type];
                                        return (
                                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">{c.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[c.type]}`}>
                                                        <Icon className="w-3 h-3" />
                                                        {TYPE_LABELS[c.type]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {c.type === 'PERCENTAGE' && `%${c.discountValue}`}
                                                    {c.type === 'FIXED' && `${c.discountValue}₺`}
                                                    {c.type === 'BUY_X_PAY_Y' && `${c.buyQuantity} Al ${c.discountValue} Öde`}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {c.code ? (
                                                        <code className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">{c.code}</code>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Otomatik</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(c.startDate)} — {formatDate(c.endDate)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                Kampanya bulunamadı
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Create / Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="flex items-center justify-between px-6 py-4 border-b">
                                <h2 className="text-lg font-bold text-gray-900">{editId ? 'Kampanya Düzenle' : 'Yeni Kampanya'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="px-6 py-4 space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Adı</label>
                                    <input
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="ör. Yaz Kampanyası"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                    <textarea
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Türü</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['PERCENTAGE', 'FIXED', 'BUY_X_PAY_Y'] as CampaignType[]).map(t => {
                                            const Icon = TYPE_ICONS[t];
                                            return (
                                                <button
                                                    key={t}
                                                    onClick={() => setForm({ ...form, type: t })}
                                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors text-xs font-medium ${form.type === t ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    {TYPE_LABELS[t]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Discount Value */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {form.type === 'PERCENTAGE' ? 'İndirim (%)' : form.type === 'FIXED' ? 'İndirim (₺)' : 'Ödenecek Adet (Y)'}
                                        </label>
                                        <input
                                            type="number"
                                            value={form.discountValue || ''}
                                            onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                    {form.type === 'BUY_X_PAY_Y' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Alınacak Adet (X)</label>
                                            <input
                                                type="number"
                                                value={form.buyQuantity || ''}
                                                onChange={e => setForm({ ...form, buyQuantity: Number(e.target.value) })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            />
                                        </div>
                                    )}
                                    {form.type === 'FIXED' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Tutar (₺)</label>
                                            <input
                                                type="number"
                                                value={form.minimumAmount || ''}
                                                onChange={e => setForm({ ...form, minimumAmount: Number(e.target.value) || undefined })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Promo Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Promosyon Kodu (opsiyonel)</label>
                                    <input
                                        value={form.code || ''}
                                        onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() || undefined })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono uppercase"
                                        placeholder="ör. FIERO2026"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Boş bırakılırsa kampanya otomatik uygulanır</p>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
                                        <input
                                            type="date"
                                            value={form.startDate}
                                            onChange={e => setForm({ ...form, startDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
                                        <input
                                            type="date"
                                            value={form.endDate}
                                            onChange={e => setForm({ ...form, endDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* Active Toggle */}
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                        className="w-4 h-4 text-purple-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Kampanya Aktif</span>
                                </label>
                            </div>

                            <div className="px-6 py-4 border-t flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                    İptal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !form.name || !form.discountValue}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? 'Kaydediliyor...' : editId ? 'Güncelle' : 'Oluştur'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {deleteId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Kampanyayı Sil</h3>
                            <p className="text-sm text-gray-500 mb-6">Bu kampanya kalıcı olarak silinecektir.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                    İptal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteMut.isPending}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {deleteMut.isPending ? 'Siliniyor...' : 'Sil'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
