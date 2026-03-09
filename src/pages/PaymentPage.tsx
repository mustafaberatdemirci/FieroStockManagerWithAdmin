import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Banknote, ArrowRight, Wallet, AlertCircle, Copy, CreditCard, Building2, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateOrder } from '../hooks/useOrders';
import { formatPrice } from '../utils/format';
import { paymentSchema, type PaymentFormData } from '../schemas/validation';
import { FormField, FormButton } from '../components/ui/FormField';
import { useSuppliers } from '../hooks/useSuppliers';

export function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalAmount, orderItems, notes } = location.state || { totalAmount: 0, orderItems: [], notes: '' };

  const [serverError, setServerError] = useState<string | null>(null);
  const [orderNumberCopied, setOrderNumberCopied] = useState(false);
  const [copiedIban, setCopiedIban] = useState<string | null>(null);
  const createOrder = useCreateOrder();
  const { data: suppliers = [] } = useSuppliers();

  // Group items by supplier
  const supplierGroups = useMemo(() => {
    const groups: Record<string, { supplierId: string; items: typeof orderItems; subtotal: number }> = {};
    for (const item of orderItems) {
      const sid = item.supplierId || 'unknown';
      if (!groups[sid]) groups[sid] = { supplierId: sid, items: [], subtotal: 0 };
      groups[sid].items.push(item);
      groups[sid].subtotal += item.price * item.requestedAmount;
    }
    return Object.values(groups);
  }, [orderItems]);

  const copyIbanToClipboard = (iban: string) => {
    navigator.clipboard.writeText(iban.replace(/\s/g, ''));
    setCopiedIban(iban);
    setTimeout(() => setCopiedIban(null), 2000);
  };

  // Generate a temporary order number for bank transfer reference
  const temporaryOrderNumber = useMemo(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}${random}`;
  }, []);

  // Mock user balance (in real app, this should come from backend)
  const userBalance = 15000; // 150 TL mock balance

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    setValue,
    setError: setFormError,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    mode: 'onChange',
    defaultValues: {
      paymentMethod: 'BANK_TRANSFER',
      totalAmount: totalAmount,
      items: orderItems,
      notes: notes || '',
    },
  });

  const watchedPaymentMethod = watch('paymentMethod');
  const canPayWithBalance = userBalance >= totalAmount;

  // Update form values when location state changes
  useEffect(() => {
    setValue('totalAmount', totalAmount);
    setValue('items', orderItems);
    setValue('notes', notes || '');
  }, [totalAmount, orderItems, notes, setValue]);

  // Copy order number to clipboard
  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(temporaryOrderNumber);
      setOrderNumberCopied(true);
      setTimeout(() => setOrderNumberCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy order number:', err);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    setServerError(null);

    // Validate current account payment
    if (data.paymentMethod === 'CURRENT_ACCOUNT' && !canPayWithBalance) {
      const errorMsg = 'Yetersiz bakiye. Lütfen havale yöntemini seçin veya bakiyenizi yükseltin.';
      setServerError(errorMsg);
      setFormError('paymentMethod', { message: errorMsg });
      return;
    }

    try {
      // Prepare order data
      const orderData = {
        items: data.items.map(item => ({
          productId: item.id,
          quantity: item.requestedAmount,
        })),
        paymentMethod: data.paymentMethod,
        notes: data.notes || '',
      };

      // Create order via API
      const createdOrder = await createOrder.mutateAsync(orderData);

      // Navigate to receipt with real order data
      navigate('/receipt', {
        state: {
          order: createdOrder.data,
          paymentDetails: {
            method: data.paymentMethod,
            date: new Date().toISOString(),
            orderNumber: createdOrder.data.orderNumber,
            canPayWithBalance,
            userBalance
          }
        }
      });
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sipariş oluşturulurken bir hata oluştu';
      setServerError(errorMessage);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-16 w-auto mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            Ödeme Bilgileri
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            {/* Order Summary */}
            <div className="mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">Ödenecek Tutar</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatPrice(totalAmount)}
                </p>
              </div>
            </div>

            {/* User Balance Info */}
            <div className="mb-6">
              <div className={`rounded-lg p-4 ${canPayWithBalance ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center gap-2">
                  <Wallet className={`w-5 h-5 ${canPayWithBalance ? 'text-green-600' : 'text-yellow-600'}`} />
                  <span className="text-sm font-medium">Mevcut Bakiye</span>
                </div>
                <p className={`text-lg font-bold ${canPayWithBalance ? 'text-green-700' : 'text-yellow-700'}`}>
                  {formatPrice(userBalance)}
                </p>
                {!canPayWithBalance && (
                  <p className="text-sm text-yellow-600 mt-1">
                    Yetersiz bakiye. Ek {formatPrice(totalAmount - userBalance)} gerekli.
                  </p>
                )}
              </div>
            </div>

            {/* Server Error Display */}
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-600">{serverError}</p>
                </div>
              </div>
            )}

            {/* Form Validation Errors */}
            {errors.paymentMethod && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-600">{errors.paymentMethod.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Payment Method Selection */}
              <FormField
                label="Ödeme Yöntemi"
                error={errors.paymentMethod?.message}
                required
                helpText="Ödeme yönteminizi seçin"
              >
                <div className="space-y-4">
                  {/* Current Account Option */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${watchedPaymentMethod === 'CURRENT_ACCOUNT'
                      ? 'border-blue-500 bg-blue-50'
                      : canPayWithBalance
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-200 opacity-50 cursor-not-allowed'
                      }`}
                    onClick={() => canPayWithBalance && setValue('paymentMethod', 'CURRENT_ACCOUNT')}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        {...register('paymentMethod')}
                        type="radio"
                        value="CURRENT_ACCOUNT"
                        disabled={!canPayWithBalance}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Wallet className={`w-5 h-5 ${canPayWithBalance ? 'text-green-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Cari Hesap</p>
                        <p className="text-sm text-gray-600">
                          Bakiyenizden otomatik düşülecek
                        </p>
                        {!canPayWithBalance && (
                          <p className="text-sm text-red-600">Yetersiz bakiye</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bank Transfer Option */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${watchedPaymentMethod === 'BANK_TRANSFER'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setValue('paymentMethod', 'BANK_TRANSFER')}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        {...register('paymentMethod')}
                        type="radio"
                        value="BANK_TRANSFER"
                        className="w-4 h-4 text-blue-600"
                      />
                      <Banknote className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Havale / EFT</p>
                        <p className="text-sm text-gray-600">
                          Banka hesabımıza havale yapın
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Credit Card Option */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${watchedPaymentMethod === 'CREDIT_CARD'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setValue('paymentMethod', 'CREDIT_CARD')}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        {...register('paymentMethod')}
                        type="radio"
                        value="CREDIT_CARD"
                        className="w-4 h-4 text-blue-600"
                      />
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Kredi Kartı</p>
                        <p className="text-sm text-gray-600">
                          Kredi kartı ile güvenli ödeme
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </FormField>

              {/* Bank Transfer Details — Per Supplier */}
              {watchedPaymentMethod === 'BANK_TRANSFER' && (
                <div className="space-y-4">
                  {supplierGroups.map(group => {
                    const supplier = suppliers.find(s => s.id === group.supplierId);
                    return (
                      <div key={group.supplierId} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-teal-600" />
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {supplier?.name || 'Bilinmeyen Tedarikçi'}
                          </h3>
                          <span className="ml-auto text-sm font-bold text-gray-700">
                            {formatPrice(group.subtotal)}
                          </span>
                        </div>
                        {/* Items in this group */}
                        <div className="text-xs text-gray-500 space-y-0.5">
                          {group.items.map((item: { name: string; requestedAmount: number; price: number }, i: number) => (
                            <div key={i} className="flex justify-between">
                              <span>{item.name} x{item.requestedAmount}</span>
                              <span>{formatPrice(item.price * item.requestedAmount)}</span>
                            </div>
                          ))}
                        </div>
                        {/* Bank info */}
                        {supplier?.iban && (
                          <div className="bg-white rounded-lg p-3 border border-gray-100">
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Banka:</span> {supplier.bankName}
                            </p>
                            <p className="text-xs text-gray-500">
                              <span className="font-medium">Hesap Sahibi:</span> {supplier.accountHolder}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm font-mono text-gray-700">{supplier.iban}</p>
                              <button
                                type="button"
                                onClick={() => copyIbanToClipboard(supplier.iban!)}
                                className="p-1 rounded hover:bg-gray-100 text-gray-400"
                              >
                                {copiedIban === supplier.iban ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Order Number */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-orange-800">Sipariş Numarası:</span>
                      <button
                        type="button"
                        onClick={copyOrderNumber}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        {orderNumberCopied ? 'Kopyalandı!' : 'Kopyala'}
                      </button>
                    </div>
                    <p className="text-lg font-bold text-orange-900 font-mono">
                      {temporaryOrderNumber}
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-sm text-blue-600">
                      <span className="font-medium">Önemli:</span> Havale yaparken açıklama kısmına sipariş numarasını (<span className="font-mono font-medium">{temporaryOrderNumber}</span>) yazmayı unutmayınız.
                    </p>
                  </div>
                </div>
              )}

              {/* Current Account Details */}
              {watchedPaymentMethod === 'CURRENT_ACCOUNT' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900">Cari Hesap Ödemesi</h3>
                  <div className="space-y-2 mt-2">
                    <p className="text-sm text-green-700">
                      Mevcut Bakiye: <span className="font-medium">{formatPrice(userBalance)}</span>
                    </p>
                    <p className="text-sm text-green-700">
                      Ödenecek Tutar: <span className="font-medium">{formatPrice(totalAmount)}</span>
                    </p>
                    <p className="text-sm text-green-700">
                      Kalan Bakiye: <span className="font-medium">{formatPrice(userBalance - totalAmount)}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Credit Card Details — Per Supplier */}
              {watchedPaymentMethod === 'CREDIT_CARD' && (
                <div className="space-y-5">
                  {supplierGroups.map((group, groupIdx) => {
                    const supplier = suppliers.find(s => s.id === group.supplierId);
                    const accent = groupIdx % 2 === 0
                      ? { bg: 'bg-purple-50', border: 'border-purple-200', ring: 'focus:ring-purple-500 focus:border-purple-500', text: 'text-purple-900', textSub: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', icon: 'text-purple-600' }
                      : { bg: 'bg-indigo-50', border: 'border-indigo-200', ring: 'focus:ring-indigo-500 focus:border-indigo-500', text: 'text-indigo-900', textSub: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700', icon: 'text-indigo-600' };

                    return (
                      <div key={group.supplierId} className={`${accent.bg} border ${accent.border} rounded-xl p-5 space-y-4`}>
                        {/* Supplier Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className={`w-4 h-4 ${accent.icon}`} />
                            <h3 className={`font-semibold ${accent.text}`}>
                              {supplier?.name || 'Tedarikçi'}
                            </h3>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${accent.badge}`}>
                            {formatPrice(group.subtotal)}
                          </span>
                        </div>

                        {/* Items in this group */}
                        <div className="text-xs space-y-0.5 opacity-70">
                          {group.items.map((item: { name: string; requestedAmount: number; price: number }, i: number) => (
                            <div key={i} className="flex justify-between">
                              <span>{item.name} x{item.requestedAmount}</span>
                              <span>{formatPrice(item.price * item.requestedAmount)}</span>
                            </div>
                          ))}
                        </div>

                        <hr className={`${accent.border}`} />

                        {/* Card Form */}
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Kart Numarası</label>
                            <input
                              type="text"
                              maxLength={19}
                              placeholder="0000 0000 0000 0000"
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${accent.ring} font-mono text-sm`}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '').slice(0, 16);
                                v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
                                e.target.value = v;
                              }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Son Kullanma</label>
                              <input
                                type="text"
                                maxLength={5}
                                placeholder="AA/YY"
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${accent.ring} font-mono text-sm`}
                                onChange={(e) => {
                                  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                                  e.target.value = v;
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">CVV</label>
                              <input
                                type="password"
                                maxLength={3}
                                placeholder="•••"
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${accent.ring} font-mono text-sm`}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Kart Sahibi</label>
                            <input
                              type="text"
                              placeholder="AD SOYAD"
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${accent.ring} uppercase text-sm`}
                            />
                          </div>
                        </div>

                        <div className={`${accent.badge} rounded-lg p-2.5 text-xs`}>
                          🔒 {supplier?.name || 'Tedarikçi'} ödemesi — {formatPrice(group.subtotal)} tutarında çekim yapılacaktır. (Mock)
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Submit Button */}
              <FormButton
                type="submit"
                loading={isSubmitting}
                disabled={!isValid || isSubmitting}
                className="w-full"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                {isSubmitting ? (
                  'Sipariş Oluşturuluyor...'
                ) : (
                  watchedPaymentMethod === 'CURRENT_ACCOUNT'
                    ? 'Bakiyeden Öde'
                    : watchedPaymentMethod === 'CREDIT_CARD'
                      ? 'Kartla Öde'
                      : 'Havale Siparişi Oluştur'
                )}
              </FormButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
