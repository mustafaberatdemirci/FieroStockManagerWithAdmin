import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package2, Send, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { useProducts, Product } from '../hooks/useProducts';
import { stockRequestSchema, type StockRequestData } from '../schemas/validation';
import { useCampaigns, useApplyPromoCode, calculateDiscounts, type Campaign } from '../hooks/useCampaigns';
import { formatPrice } from '../utils/format';

// ─── Sub-components ──────────────────────────────────────────────────────────
import { PageHeader } from '../components/stock-request/PageHeader';
import { CampaignBanner } from '../components/stock-request/CampaignBanner';
import { CartItemRow, type StockItem, type SelectOption } from '../components/stock-request/CartItemRow';
import { CartSummary } from '../components/stock-request/CartSummary';

// ─── Component ───────────────────────────────────────────────────────────────

export function StockRequestPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showZeroQuantityWarning, setShowZeroQuantityWarning] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Campaign | null>(null);
  const [promoError, setPromoError] = useState('');

  // Campaign hooks
  const { data: activeCampaigns = [] } = useCampaigns();
  const applyPromo = useApplyPromoCode();

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    control,
  } = useForm<StockRequestData>({
    resolver: zodResolver(stockRequestSchema),
    mode: 'onChange',
    defaultValues: {
      storeName: user?.storeName || '',
      storeId: user?.storeId || '',
      items: [],
      notes: '',
    },
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');

  // Products API
  const { data: productsResponse, isLoading: productsLoading, error: productsError } = useProducts({
    limit: 1000,
    page: 1,
  });
  const products = productsResponse?.data || [];

  // Select options
  const selectOptions: SelectOption[] = useMemo(() => {
    return products.map((product) => ({
      value: product.code,
      label: `${product.name} - ${formatPrice(product.price)}`,
      price: product.price,
      vatRate: product.vatRate,
      name: product.name,
    }));
  }, [products]);

  // ─── Calculations ────────────────────────────────────────────────────────────

  const totalPrice = useMemo(() => {
    return watchedItems.reduce((total, item) => total + item.requestedAmount * item.price, 0);
  }, [watchedItems]);

  const totalVAT = useMemo(() => {
    return watchedItems.reduce((total, item) => total + item.price * item.requestedAmount * item.vatRate, 0);
  }, [watchedItems]);

  const discounts = useMemo(() => {
    if (watchedItems.length === 0) return [];
    const cartItems = watchedItems.map(item => {
      const product = products.find(p => p.code === item.code);
      return {
        productId: String(product?.id || ''),
        categoryId: product?.categoryId || '',
        quantity: item.requestedAmount,
        unitPrice: item.price,
        subtotal: item.price * item.requestedAmount,
      };
    });
    return calculateDiscounts(cartItems, activeCampaigns, appliedPromo);
  }, [watchedItems, activeCampaigns, appliedPromo, products]);

  const totalDiscount = useMemo(() => discounts.reduce((s, d) => s + d.amount, 0), [discounts]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleApplyPromo = async () => {
    setPromoError('');
    try {
      const campaign = await applyPromo.mutateAsync(promoCode);
      setAppliedPromo(campaign);
      setPromoCode('');
    } catch {
      setPromoError('Geçersiz veya süresi dolmuş promosyon kodu');
    }
  };

  const onSubmit = async (data: StockRequestData) => {
    navigate('/payment', {
      state: {
        totalAmount: totalPrice + totalVAT - totalDiscount,
        discountAmount: totalDiscount,
        orderItems: data.items,
        notes: data.notes,
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const addNewItem = () => {
    append({ code: '', name: '', requestedAmount: 0, price: 0, vatRate: 0 });
  };

  const updateItem = (index: number, field: keyof StockItem, value: string | number) => {
    const currentItem = watchedItems[index];
    if (field === 'code') {
      const selectedProduct = products.find((p: Product) => p.code === value);
      if (selectedProduct) {
        update(index, {
          ...currentItem,
          id: String(selectedProduct.id),
          code: selectedProduct.code,
          name: selectedProduct.name,
          price: selectedProduct.price,
          vatRate: selectedProduct.vatRate,
        });
      }
    } else {
      update(index, { ...currentItem, [field]: value });
    }
    setShowZeroQuantityWarning(false);
  };

  const removeItem = (index: number) => {
    remove(index);
    setShowZeroQuantityWarning(false);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
          <PageHeader
            onNavigateOrders={() => navigate('/orders')}
            onLogout={handleLogout}
          />

          <CampaignBanner campaigns={activeCampaigns} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Store Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şube Adı
                </label>
                <input
                  {...register('storeName')}
                  type="text"
                  readOnly
                  className="w-full px-3 sm:px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  value={user?.storeName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cari Ünvan
                </label>
                <input
                  {...register('storeId')}
                  type="text"
                  readOnly
                  className="w-full px-3 sm:px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                  value={user?.storeId}
                />
              </div>
            </div>

            {/* API Error */}
            {productsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Ürünler yüklenirken hata oluştu</p>
                  <p className="text-sm text-red-700 mt-1">
                    API bağlantısı kurulamadı. Lütfen internet bağlantınızı kontrol edin ve sayfayı yenileyin.
                  </p>
                </div>
              </div>
            )}

            {/* Loading */}
            {productsLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <p className="text-sm text-blue-700">Ürünler yükleniyor...</p>
              </div>
            )}

            {/* Stock Request Items */}
            <div className="border-t border-gray-200 pt-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Package2 className="w-5 h-5" />
                  Stok Talebi
                </h2>
              </div>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <CartItemRow
                    key={field.id}
                    index={index}
                    item={watchedItems[index] || field}
                    selectOptions={selectOptions}
                    productsLoading={productsLoading}
                    productsError={!!productsError}
                    register={register}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                  />
                ))}

                {watchedItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Henüz ürün eklenmedi. "Yeni Ürün Ekle" butonunu kullanarak
                    ürün ekleyebilirsiniz.
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={addNewItem}
                    disabled={productsLoading || !!productsError}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                    Yeni Ürün Ekle
                  </button>
                </div>
              </div>
            </div>

            {/* Warning */}
            {showZeroQuantityWarning && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  Siparişinizde miktarı 0 olan ürünler bulunmaktadır. Lütfen tüm ürünlerin miktarlarını kontrol ediniz.
                </p>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ek Notlar
              </label>
              <textarea
                {...register('notes')}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Varsa eklemek istediğiniz notları buraya yazabilirsiniz..."
              />
            </div>

            {/* Order Summary */}
            <CartSummary
              items={watchedItems}
              totalPrice={totalPrice}
              totalVAT={totalVAT}
              discounts={discounts}
              totalDiscount={totalDiscount}
              promoCode={promoCode}
              appliedPromo={appliedPromo}
              promoError={promoError}
              isPromoPending={applyPromo.isPending}
              onPromoCodeChange={(v) => { setPromoCode(v); setPromoError(''); }}
              onApplyPromo={handleApplyPromo}
              onRemovePromo={() => setAppliedPromo(null)}
            />

            {/* Submit */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={watchedItems.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                Ödemeye Geç
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
