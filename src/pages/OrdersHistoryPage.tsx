import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package2, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  CreditCard,
  Banknote,
  Wallet,
  Calendar,
  Hash,
  Eye,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders, formatOrderStatus, formatPaymentMethod, getOrderStatusColor } from '../hooks/useOrders';
import { formatPrice } from '../utils/format';
import type { Order } from '../types';

export function OrdersHistoryPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Fetch user's orders
  const { data: ordersResponse, isLoading, error } = useOrders({
    page: 1,
    limit: 50, // Show more orders for history
  });

  const orders = ordersResponse?.data || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleBackToOrders = () => {
    navigate('/');
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'SHIPPED':
        return <Truck className="w-4 h-4" />;
      case 'DELIVERED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
        return <CreditCard className="w-4 h-4" />;
      case 'BANK_TRANSFER':
        return <Banknote className="w-4 h-4" />;
      case 'CURRENT_ACCOUNT':
        return <Wallet className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <XCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600">Siparişler yüklenirken bir hata oluştu.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Package2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Sipariş Geçmişi
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToOrders}
                className="flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Yeni Sipariş</span>
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

          {/* Store Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              {user?.storeName} - Sipariş Geçmişi
            </p>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz sipariş bulunmuyor
              </h3>
              <p className="text-gray-600 mb-6">
                İlk siparişinizi oluşturmak için yeni sipariş sayfasına gidin.
              </p>
              <button
                onClick={handleBackToOrders}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Yeni Sipariş Oluştur
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-500" />
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getOrderStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {formatOrderStatus(order.status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          {getPaymentIcon(order.paymentMethod)}
                          {formatPaymentMethod(order.paymentMethod)}
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{order.items.length}</span> ürün -{' '}
                        <span className="font-medium text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewOrderDetails(order)}
                        className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Detay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Sipariş Detayları
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Sipariş Numarası</p>
                      <p className="font-mono font-medium">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Durum</p>
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium items-center gap-1 ${getOrderStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {formatOrderStatus(selectedOrder.status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tarih</p>
                      <p className="font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ödeme Yöntemi</p>
                      <div className="flex items-center gap-1">
                        {getPaymentIcon(selectedOrder.paymentMethod)}
                        <span className="font-medium">{formatPaymentMethod(selectedOrder.paymentMethod)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Ürünleri</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} adet × {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice(item.lineTotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Totals */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ara Toplam:</span>
                      <span className="font-medium">{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">KDV:</span>
                      <span className="font-medium">{formatPrice(selectedOrder.vatAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                      <span>Toplam:</span>
                      <span className="text-blue-600">{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Not:</p>
                    <p className="text-sm text-yellow-700">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
