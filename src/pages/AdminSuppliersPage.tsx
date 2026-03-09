import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Pencil, Trash2, Search, Truck, Building2, CreditCard,
    Globe, AlertCircle, X, Loader2, Copy, Check,
} from 'lucide-react';
import {
    useAdminSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier,
    type Supplier, type SupplierInput,
} from '../hooks/useSuppliers';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    BANK_TRANSFER: 'Havale / EFT',
    OPEN_ACCOUNT: 'Açık Hesap',
    CREDIT_CARD: 'Kredi Kartı',
};

const EMPTY_FORM: SupplierInput = {
    name: '', taxNumber: '', address: '', phone: '', email: '',
    bankName: '', iban: '', accountHolder: '',
    apiUrl: '', apiKey: '', webhookUrl: '',
    paymentMethods: ['BANK_TRANSFER'], isActive: true,
};

export default function AdminSuppliersPage() {
    const navigate = useNavigate();
    const { data: suppliers = [], isLoading } = useAdminSuppliers();
    const createMut = useCreateSupplier();
    const updateMut = useUpdateSupplier();
    const deleteMut = useDeleteSupplier();

    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<SupplierInput>(EMPTY_FORM);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [copiedIban, setCopiedIban] = useState<string | null>(null);

    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.taxNumber && s.taxNumber.includes(search)) ||
        (s.iban && s.iban.includes(search))
    );

    const openCreate = () => {
        setEditId(null);
        setForm({ ...EMPTY_FORM });
        setShowModal(true);
    };

    const openEdit = (s: Supplier) => {
        setEditId(s.id);
        setForm({
            name: s.name,
            taxNumber: s.taxNumber || '',
            address: s.address || '',
            phone: s.phone || '',
            email: s.email || '',
            bankName: s.bankName || '',
            iban: s.iban || '',
            accountHolder: s.accountHolder || '',
            apiUrl: s.apiUrl || '',
            apiKey: s.apiKey || '',
            webhookUrl: s.webhookUrl || '',
            paymentMethods: s.paymentMethods,
            isActive: s.isActive,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (editId) {
            await updateMut.mutateAsync({ id: editId, ...form });
        } else {
            await createMut.mutateAsync(form);
        }
        setShowModal(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        await deleteMut.mutateAsync(deleteId);
        setDeleteId(null);
    };

    const togglePaymentMethod = (method: string) => {
        setForm(prev => ({
            ...prev,
            paymentMethods: prev.paymentMethods.includes(method)
                ? prev.paymentMethods.filter(m => m !== method)
                : [...prev.paymentMethods, method],
        }));
    };

    const copyIban = (iban: string) => {
        navigator.clipboard.writeText(iban.replace(/\s/g, ''));
        setCopiedIban(iban);
        setTimeout(() => setCopiedIban(null), 2000);
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
                                <Truck className="w-6 h-6 text-teal-600" />
                                Tedarikçi Yönetimi
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">{suppliers.length} tedarikçi</p>
                        </div>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Tedarikçi
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Firma adı, vergi no veya IBAN ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                    </div>
                )}

                {/* Supplier Cards */}
                {!isLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filtered.map(s => (
                            <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-teal-50 rounded-lg">
                                            <Building2 className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{s.name}</h3>
                                            {s.taxNumber && <p className="text-xs text-gray-500">VKN: {s.taxNumber}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {s.isActive ? 'Aktif' : 'Pasif'}
                                        </span>
                                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Bank info */}
                                {s.iban && (
                                    <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[11px] text-gray-500 uppercase tracking-wide">{s.bankName || 'Banka'}</p>
                                                <p className="text-sm font-mono text-gray-700">{s.iban}</p>
                                                {s.accountHolder && <p className="text-xs text-gray-500">{s.accountHolder}</p>}
                                            </div>
                                            <button onClick={() => copyIban(s.iban!)} className="p-1.5 rounded hover:bg-gray-200 text-gray-400">
                                                {copiedIban === s.iban ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Bottom row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        {s.paymentMethods.map(m => (
                                            <span key={m} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium">
                                                {PAYMENT_METHOD_LABELS[m] || m}
                                            </span>
                                        ))}
                                    </div>
                                    {s.apiUrl && (
                                        <span className="flex items-center gap-1 text-[11px] text-purple-600">
                                            <Globe className="w-3 h-3" />
                                            API Bağlı
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <div className="col-span-2 text-center py-12 text-gray-400">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                Tedarikçi bulunamadı
                            </div>
                        )}
                    </div>
                )}

                {/* Create / Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="flex items-center justify-between px-6 py-4 border-b">
                                <h2 className="text-lg font-bold text-gray-900">{editId ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="px-6 py-4 space-y-5">
                                {/* Firma Bilgileri */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-teal-600" />
                                        Firma Bilgileri
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Firma Adı *</label>
                                            <input
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                                placeholder="Fiero Coffee & Food"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Vergi Numarası</label>
                                            <input value={form.taxNumber || ''} onChange={e => setForm({ ...form, taxNumber: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
                                            <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">E-posta</label>
                                            <input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Adres</label>
                                            <input value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                {/* Banka Bilgileri */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-blue-600" />
                                        Banka Bilgileri
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Banka Adı</label>
                                            <input value={form.bankName || ''} onChange={e => setForm({ ...form, bankName: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Hesap Sahibi</label>
                                            <input value={form.accountHolder || ''} onChange={e => setForm({ ...form, accountHolder: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">IBAN</label>
                                            <input value={form.iban || ''} onChange={e => setForm({ ...form, iban: e.target.value.toUpperCase() })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                                placeholder="TR00 0000 0000 0000 0000 0000 00" />
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                {/* Ödeme Yöntemleri */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Ödeme Yöntemleri</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => togglePaymentMethod(key)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-colors ${form.paymentMethods.includes(key)
                                                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <hr />

                                {/* API Bilgileri */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-purple-600" />
                                        API Bilgileri
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">API URL</label>
                                            <input value={form.apiUrl || ''} onChange={e => setForm({ ...form, apiUrl: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                                placeholder="https://api.example.com/orders" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
                                            <input value={form.apiKey || ''} onChange={e => setForm({ ...form, apiKey: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Webhook URL</label>
                                            <input value={form.webhookUrl || ''} onChange={e => setForm({ ...form, webhookUrl: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Active Toggle */}
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                        className="w-4 h-4 text-teal-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Tedarikçi Aktif</span>
                                </label>
                            </div>

                            <div className="px-6 py-4 border-t flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                                    İptal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !form.name}
                                    className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors"
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
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Tedarikçiyi Sil</h3>
                            <p className="text-sm text-gray-500 mb-6">Bu tedarikçi kalıcı olarak silinecektir.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    İptal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteMut.isPending}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
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
