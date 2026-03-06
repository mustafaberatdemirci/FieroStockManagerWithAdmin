import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, LogOut, Search, ChevronDown, ChevronUp, Receipt, Edit, BarChart3, Loader, Package, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  useAdminOrders,
  useAdminStores,
  useAdminDashboardStats,
  useUpdateOrderStatus,
  formatOrderStatus,
  formatPaymentMethod,
  getOrderStatusColor,
  formatCurrency,
  formatDate,
  type AdminOrdersQuery
} from '../hooks/useAdmin';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  // Query parameters
  const ordersQuery: AdminOrdersQuery = {
    page,
    limit: 10,
    ...(selectedStatus && { status: selectedStatus as 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' }),
    ...(selectedStore && { storeId: selectedStore }),
    ...(searchTerm && { search: searchTerm }),
  };

  // API hooks
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useAdminOrders(ordersQuery);
  const { data: stores, isLoading: storesLoading } = useAdminStores();
  const { data: stats, isLoading: statsLoading } = useAdminDashboardStats();
  const updateOrderStatus = useUpdateOrderStatus();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1); // Reset to first page when searching
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus.mutateAsync({
        orderId,
        status: status as 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
      });
      setEditingOrderId(null);
      setNewStatus('');
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const startEditingStatus = (orderId: string, currentStatus: string) => {
    setEditingOrderId(orderId);
    setNewStatus(currentStatus);
  };

  const cancelEditingStatus = () => {
    setEditingOrderId(null);
    setNewStatus('');
  };

  if (ordersLoading || storesLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Siparişler yüklenirken hata oluştu.</p>
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

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/products')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                <Package className="w-5 h-5" />
                <span className="font-medium">Ürün Yönetimi</span>
              </button>
              <button
                onClick={() => navigate('/admin/stores')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors duration-200"
              >
                <Store className="w-5 h-5" />
                <span className="font-medium">Mağaza Yönetimi</span>
              </button>
              <button
                onClick={() => navigate('/admin/campaigns')}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-lg transition-colors duration-200"
              >
                <Tag className="w-5 h-5" />
                <span className="font-medium">Kampanya Yönetimi</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Toplam Sipariş</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.orders.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Receipt className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Aylık Gelir</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.revenue.month)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Store className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Aktif Mağaza</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.stores.active}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">₺</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Bugünkü Sipariş</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.orders.today}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arama
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sipariş no veya şube adı..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şube
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                disabled={storesLoading}
              >
                <option value="">Tüm Şubeler</option>
                {stores?.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Tüm Durumlar</option>
                <option value="PENDING">Beklemede</option>
                <option value="CONFIRMED">Onaylandı</option>
                <option value="SHIPPED">Kargoya Verildi</option>
                <option value="DELIVERED">Teslim Edildi</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
          {orders.map((order) => (
            <div key={order.id} className="p-6">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <Receipt className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{order.orderNumber}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {formatOrderStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{order.store.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Toplam Tutar</div>
                    <div className="font-medium text-blue-600">{formatCurrency(order.totalAmount)}</div>
                  </div>
                  {expandedOrder === order.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Order Details */}
              {expandedOrder === order.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Tarih</p>
                      <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ödeme Yöntemi</p>
                      <p className="font-medium text-gray-900">{formatPaymentMethod(order.paymentMethod)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ürün Sayısı</p>
                      <p className="font-medium text-gray-900">{order.items.length} ürün</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Durum Güncelle</p>
                      {editingOrderId === order.id ? (
                        <div className="flex gap-2">
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="PENDING">Beklemede</option>
                            <option value="CONFIRMED">Onaylandı</option>
                            <option value="SHIPPED">Kargoya Verildi</option>
                            <option value="DELIVERED">Teslim Edildi</option>
                            <option value="CANCELLED">İptal Edildi</option>
                          </select>
                          <button
                            onClick={() => handleStatusUpdate(order.id, newStatus)}
                            disabled={updateOrderStatus.isPending}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {updateOrderStatus.isPending ? <Loader className="w-3 h-3 animate-spin" /> : '✓'}
                          </button>
                          <button
                            onClick={cancelEditingStatus}
                            className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingStatus(order.id, order.status);
                          }}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-3 h-3" />
                          Düzenle
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Miktar</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Birim Fiyat</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {order.items.map((item) => (
                          <tr key={item.id} className="text-sm">
                            <td className="px-4 py-3 text-gray-900">{item.product.name}</td>
                            <td className="px-4 py-3 text-gray-900 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-3 text-gray-900 text-right">{formatCurrency(item.lineTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}

          {orders.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Gösterilecek sipariş bulunamadı.
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Toplam {pagination.totalCount} siparişten {((page - 1) * 10) + 1}-{Math.min(page * 10, pagination.totalCount)} arası gösteriliyor
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPreviousPage}
                className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Önceki
              </button>
              <span className="px-3 py-2 text-sm bg-blue-50 border rounded-lg">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sonraki
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
