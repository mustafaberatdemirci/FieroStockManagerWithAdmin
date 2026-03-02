import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Plus, Upload, Download, Edit, Trash2, ToggleLeft, ToggleRight, Search, X } from 'lucide-react';

interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  vatRate: number;
  stockQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  };
  _count?: {
    orderItems: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

export function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Product form state
  const [productForm, setProductForm] = useState({
    code: '',
    name: '',
    description: '',
    price: '',
    vatRate: '0.01',
    categoryId: '',
    stockQuantity: '',
    minOrderQuantity: '1',
    maxOrderQuantity: '',
    isActive: true
  });
  
  // Form validation and loading
  const [formLoading, setFormLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  
  // CSV Import handlers
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      handleImportCSV(file);
    } else {
      alert('Lütfen sadece CSV dosyası seçin.');
    }
  };

  const handleImportCSV = async (file: File) => {
    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/admin/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        alert(`${response.data.data.imported} ürün başarıyla içe aktarıldı.`);
        setShowImportModal(false);
        fetchProducts(); // Refresh the list
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'CSV içe aktarma başarısız.');
    } finally {
      setImportLoading(false);
    }
  };

  // Product form handlers
  const resetProductForm = () => {
    setProductForm({
      code: '',
      name: '',
      description: '',
      price: '',
      vatRate: '0.01',
      categoryId: '',
      stockQuantity: '',
      minOrderQuantity: '1',
      maxOrderQuantity: '',
      isActive: true
    });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.code || !productForm.name || !productForm.price || !productForm.categoryId) {
      alert('Lütfen zorunlu alanları doldurun.');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        vatRate: parseFloat(productForm.vatRate),
        stockQuantity: parseInt(productForm.stockQuantity) || 0,
        minOrderQuantity: parseInt(productForm.minOrderQuantity) || 1,
        maxOrderQuantity: productForm.maxOrderQuantity ? parseInt(productForm.maxOrderQuantity) : null,
      };

      const response = editingProduct
        ? await api.put(`/admin/products/${editingProduct.id}`, payload)
        : await api.post('/admin/products', payload);

      if (response.data.success) {
        alert(editingProduct ? 'Ürün başarıyla güncellendi.' : 'Ürün başarıyla eklendi.');
        setShowProductModal(false);
        setEditingProduct(null);
        resetProductForm();
        fetchProducts(); // Refresh the list
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'İşlem başarısız.');
    } finally {
      setFormLoading(false);
    }
  };

  // Load product data when editing
  useEffect(() => {
    if (editingProduct) {
      setProductForm({
        code: editingProduct.code,
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price.toString(),
        vatRate: editingProduct.vatRate.toString(),
        categoryId: editingProduct.category?.id || '',
        stockQuantity: editingProduct.stockQuantity.toString(),
        minOrderQuantity: editingProduct.minOrderQuantity.toString(),
        maxOrderQuantity: editingProduct.maxOrderQuantity?.toString() || '',
        isActive: editingProduct.isActive
      });
    } else {
      resetProductForm();
    }
  }, [editingProduct]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, search, categoryFilter, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(search && { search }),
        ...(categoryFilter && { category: categoryFilter }),
        status: statusFilter
      });

      const response = await api.get(`/admin/products?${params}`);
      
      if (response.data.success) {
        setProducts(response.data.data.products);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalCount(response.data.data.pagination.totalCount);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleToggleStatus = async (productId: string) => {
    try {
      const response = await api.patch(`/admin/products/${productId}/toggle-status`);
      
      if (response.data.success) {
        setProducts(prev => prev.map(p => 
          p.id === productId 
            ? { ...p, isActive: response.data.data.isActive }
            : p
        ));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle product status');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    
    try {
      const response = await api.delete(`/admin/products/${productId}`);
      
      if (response.data.success) {
        fetchProducts(); // Refresh list
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(categoryFilter && { category: categoryFilter }),
        status: statusFilter
      });

      const response = await api.get(`/admin/products/export?${params}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fiero-products-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to export products');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Erişim Reddedildi</h1>
          <p className="text-gray-600 mt-2">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
              <p className="text-gray-600">Toplam {totalCount} ürün</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2"
                variant="secondary"
              >
                <Upload className="h-4 w-4" />
                CSV İçe Aktar
              </Button>
              <Button 
                onClick={handleExport}
                className="flex items-center gap-2"
                variant="secondary"
              >
                <Download className="h-4 w-4" />
                CSV Dışa Aktar
              </Button>
              <Button 
                onClick={() => setShowProductModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Yeni Ürün
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>

            <Button onClick={fetchProducts} variant="secondary">
              Filtrele
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Ürünler yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchProducts} className="mt-4">
                Tekrar Dene
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ürün
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fiyat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stok
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.code}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₺{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stockQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            product.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setShowProductModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Düzenle"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(product.id)}
                              className={`${
                                product.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              }`}
                              title={product.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                            >
                              {product.isActive ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Sil"
                              disabled={!!product._count?.orderItems}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        variant="secondary"
                      >
                        Önceki
                      </Button>
                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        variant="secondary"
                      >
                        Sonraki
                      </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{((currentPage - 1) * 20) + 1}</span>
                          {' - '}
                          <span className="font-medium">
                            {Math.min(currentPage * 20, totalCount)}
                          </span>
                          {' / '}
                          <span className="font-medium">{totalCount}</span>
                          {' sonuç gösteriliyor'}
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <Button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            variant="secondary"
                            className="rounded-r-none"
                          >
                            Önceki
                          </Button>
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            {currentPage} / {totalPages}
                          </span>
                          <Button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            variant="secondary"
                            className="rounded-l-none"
                          >
                            Sonraki
                          </Button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
              </h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                  resetProductForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ürün Kodu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ürün Kodu *
                  </label>
                  <input
                    type="text"
                    value={productForm.code}
                    onChange={(e) => setProductForm(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Örn: COFFEE001"
                    required
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ürün Adı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ürün adını girin"
                  required
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ürün açıklaması (opsiyonel)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fiyat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* KDV Oranı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    KDV Oranı
                  </label>
                  <select
                    value={productForm.vatRate}
                    onChange={(e) => setProductForm(prev => ({ ...prev, vatRate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="0.01">%1</option>
                    <option value="0.08">%8</option>
                    <option value="0.18">%18</option>
                    <option value="0.20">%20</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stok Miktarı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok Miktarı
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {/* Min Sipariş */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Sipariş
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.minOrderQuantity}
                    onChange={(e) => setProductForm(prev => ({ ...prev, minOrderQuantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>

                {/* Max Sipariş */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Sipariş
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.maxOrderQuantity}
                    onChange={(e) => setProductForm(prev => ({ ...prev, maxOrderQuantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Sınırsız"
                  />
                </div>
              </div>

              {/* Durum */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={productForm.isActive}
                  onChange={(e) => setProductForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Ürün aktif durumda
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                    resetProductForm();
                  }}
                  variant="secondary"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2"
                >
                  {formLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {editingProduct ? 'Güncelle' : 'Kaydet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">CSV İçe Aktar</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Upload Area */}
              <div 
                onClick={handleFileSelect}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 transition-colors"
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  CSV dosyası seçmek için tıklayın
                </p>
                <p className="text-xs text-gray-500">
                  Sadece .csv formatı desteklenmektedir
                </p>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Format Bilgisi:</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Sütunlar: code, name, description, price, vatRate, categoryId, stockQuantity, minOrderQuantity, maxOrderQuantity</li>
                  <li>• İlk satır başlık satırı olmalıdır</li>
                  <li>• Kategori ID'leri mevcut kategorilerle eşleşmelidir</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setShowImportModal(false)}
                  variant="secondary"
                  disabled={importLoading}
                >
                  İptal
                </Button>
                <Button
                  onClick={handleFileSelect}
                  disabled={importLoading}
                  className="flex items-center gap-2"
                >
                  {importLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <Upload className="h-4 w-4" />
                  Dosya Seç
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
