import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Package2, Store, Send, Plus, LogOut, Trash2, AlertCircle, Loader2, History } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import { useProducts, Product } from "../hooks/useProducts";
import { stockRequestSchema, type StockRequestData } from "../schemas/validation";
import Select from "react-select";

interface StockItem {
  id?: string;
  code: string;
  name: string;
  requestedAmount: number;
  price: number;
  vatRate: number;
}


interface CustomOptionProps {
  innerProps: React.HTMLProps<HTMLDivElement>;
  data: {
    name: string;
    price: number;
  };
}

const CustomOption = ({ innerProps, data }: CustomOptionProps) => (
  <div
    {...innerProps}
    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100"
  >
    <div className="flex-1">
      <div className="text-sm font-medium">{data.name}</div>
      <div className="text-xs text-gray-600">
        {new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: "TRY",
        }).format(data.price)}
      </div>
    </div>
  </div>
);

export function StockRequestPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showZeroQuantityWarning, setShowZeroQuantityWarning] = useState(false);

  // Form setup with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
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

  // Field array for dynamic items
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  
  // API integration - load all products without filtering
  const { data: productsResponse, isLoading: productsLoading, error: productsError } = useProducts({
    limit: 1000,  // Tüm ürünleri çekmek için yeterince büyük limit
    page: 1,      // İlk sayfa
  });
  
  const products = productsResponse?.data || [];
  
  // Create select options from API data
  const selectOptions = useMemo(() => {
    return products.map((product) => ({
      value: product.code,
      label: `${product.name} - ${new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(product.price)}`,
      price: product.price,
      vatRate: product.vatRate,
      name: product.name,
    }));
  }, [products]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  const calculateVatBreakdown = () => {
    const breakdown: { [key: string]: number } = {};
    watchedItems.forEach((item) => {
      const vatRate = (item.vatRate * 100).toFixed(0) + "%";
      const vatAmount = item.price * item.requestedAmount * item.vatRate;
      breakdown[vatRate] = (breakdown[vatRate] || 0) + vatAmount;
    });
    return Object.entries(breakdown).sort(
      (a, b) => parseInt(a[0]) - parseInt(b[0])
    );
  };

  const totalPrice = useMemo(() => {
    return watchedItems.reduce((total, item) => {
      return total + item.requestedAmount * item.price;
    }, 0);
  }, [watchedItems]);

  const totalVAT = useMemo(() => {
    return watchedItems.reduce((total, item) => {
      return total + item.price * item.requestedAmount * item.vatRate;
    }, 0);
  }, [watchedItems]);

  const onSubmit = async (data: StockRequestData) => {
    console.log('✅ onSubmit called with data:', data);
    console.log('✅ watchedItems:', watchedItems);
    console.log('✅ Form errors:', errors);
    console.log('✅ Form isValid:', isValid);
    console.log('✅ Navigating to payment page...');
    navigate('/payment', {
      state: {
        totalAmount: totalPrice + totalVAT,
        orderItems: data.items,
        notes: data.notes
      }
    });
  };

  // Debug function to check form state
  const handleDebugClick = () => {
    console.log('🔍 Debug form state:');
    console.log('🔍 watchedItems:', watchedItems);
    console.log('🔍 errors:', errors);
    console.log('🔍 isValid:', isValid);
    console.log('🔍 Current form values:', watch());
  };


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const addNewItem = () => {
    append({ code: "", name: "", requestedAmount: 0, price: 0, vatRate: 0 });
  };

  const updateItem = (index: number, field: keyof StockItem, value: string | number) => {
    const currentItem = watchedItems[index];
    if (field === "code") {
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

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Store className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Stok Talep Formu
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/orders')}
                className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <History className="w-5 h-5" />
                <span className="font-medium">Sipariş Geçmişi</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Çıkış Yap</span>
              </button>
            </div>
          </div>
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
            {/* API Error Message */}
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

            {/* Products Loading State */}
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
                {fields.map((field, index) => {
                  const item = watchedItems[index] || field;
                  return (
                    <div key={field.id} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
                        {/* Hidden fields for react-hook-form registration */}
                        <input type="hidden" {...register(`items.${index}.code` as const)} />
                        <input type="hidden" {...register(`items.${index}.name` as const)} />
                        <input type="hidden" {...register(`items.${index}.price` as const, { valueAsNumber: true })} />
                        <input type="hidden" {...register(`items.${index}.vatRate` as const, { valueAsNumber: true })} />
                        
                        <div className="sm:col-span-5">
                          <label className="block text-sm text-gray-600 mb-1">
                            Ürün
                          </label>
                          <Select
                            value={
                              item.code
                                ? selectOptions.find(
                                  (option) => option.value === item.code
                                )
                                : null
                            }
                            onChange={(newValue: { value: string; label: string; price: number; vatRate: number; name: string } | null) =>
                              updateItem(index, "code", newValue?.value || "")
                            }
                            options={selectOptions}
                            components={{ Option: CustomOption }}
                            placeholder={productsLoading ? "Ürünler yükleniyor..." : "Ürün Seçin veya Arayın..."}
                            noOptionsMessage={() => productsLoading ? "Ürünler yükleniyor..." : "Ürün bulunamadı"}
                            isLoading={productsLoading}
                            isDisabled={productsLoading || !!productsError}
                            classNames={{
                              control: () => "!min-h-[42px]",
                              menu: () =>
                                "mt-1 bg-white border border-gray-300 rounded-lg shadow-lg",
                              option: () => "cursor-pointer text-sm",
                            }}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm text-gray-600 mb-1">
                            Miktar
                          </label>
                          <input
                            {...register(`items.${index}.requestedAmount` as const, { valueAsNumber: true })}
                            type="number"
                            min="0"
                            className="w-full h-[42px] px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) =>
                              updateItem(
                                index,
                                "requestedAmount",
                                parseInt(e.target.value) || 0
                              )
                            }
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm text-gray-600 mb-1">
                            KDV Hariç
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full h-[42px] px-3 bg-gray-100 border border-gray-300 rounded-lg text-right font-medium text-gray-900"
                            value={formatPrice(item.price * item.requestedAmount)}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm text-gray-600 mb-1">
                            KDV Dahil
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full h-[42px] px-3 bg-gray-100 border border-gray-300 rounded-lg text-right font-medium text-gray-900"
                            value={formatPrice(
                              item.price *
                              item.requestedAmount *
                              (1 + item.vatRate)
                            )}
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-sm text-gray-600 mb-1">
                            İşlem
                          </label>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="w-full h-[42px] px-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {watchedItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Henüz ürün eklenmedi. "Yeni Ürün Ekle" butonunu kullanarak
                    ürün ekleyebilirsiniz.
                  </div>
                )}
                
                {/* Add New Item Button - Moved to bottom of product list */}
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

            {/* Uyarı Mesajı */}
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
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Ara Toplam:</span>
                    <span className="text-lg font-medium text-gray-900">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">KDV Tutarı:</span>
                      <span className="text-lg font-medium text-gray-900">
                        {formatPrice(totalVAT)}
                      </span>
                    </div>
                    {/* VAT Breakdown */}
                    <div className="mt-2 space-y-1">
                      {calculateVatBreakdown().map(([rate, amount]) => (
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
                  <div className="pt-4 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Genel Toplam:
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-blue-600">
                        {formatPrice(totalPrice + totalVAT)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Debug and Submit Buttons */}
            <div className="space-y-3">
              {/* Debug Button */}
              <button
                type="button"
                onClick={handleDebugClick}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                🔍 Debug Form
              </button>
              
              {/* Submit Button */}
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
