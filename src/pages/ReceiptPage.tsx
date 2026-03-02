import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Home, Store, Package2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/format';
import { Order } from '../types';

interface PaymentDetails {
  method: 'BANK_TRANSFER' | 'CURRENT_ACCOUNT';
  date: string;
  orderNumber: string;
  canPayWithBalance?: boolean;
  userBalance?: number;
}

interface ReceiptProps {
  order: Order;
  paymentDetails: PaymentDetails;
}

export function ReceiptPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { order, paymentDetails } = (location.state || {}) as ReceiptProps;

  // If no order data, redirect to home
  if (!order || !paymentDetails) {
    navigate('/');
    return null;
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'CURRENT_ACCOUNT':
        return 'Cari Hesap';
      case 'BANK_TRANSFER':
        return 'Havale / EFT';
      default:
        return method;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isHavalePayment = paymentDetails.method === 'BANK_TRANSFER';

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
              font-size: 10pt;
              line-height: 1.3;
            }

            .no-print {
              display: none !important;
            }

            .print-content {
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }

            .print-table {
              page-break-inside: auto;
              width: 100% !important;
              font-size: 9pt !important;
            }

            .print-table tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            .print-table th {
              background-color: #f3f4f6 !important;
              color: #374151 !important;
              font-weight: 600 !important;
              text-transform: uppercase !important;
              padding: 6px !important;
              font-size: 8pt !important;
            }

            .print-table td {
              padding: 6px !important;
              font-size: 9pt !important;
              border-bottom: 1px solid #e5e7eb !important;
            }

            .print-table td:first-child {
              width: 50% !important;
              word-break: break-word !important;
            }

            .print-header {
              margin-bottom: 15mm !important;
              text-align: center !important;
            }

            .print-totals {
              margin-top: 10mm !important;
              page-break-inside: avoid !important;
            }

            .print-wrapper {
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              min-height: 0 !important;
              background: white !important;
            }

            .print-info {
              page-break-inside: avoid !important;
              margin-bottom: 10mm !important;
            }

            h2 {
              font-size: 14pt !important;
              margin-bottom: 5mm !important;
            }

            h3 {
              font-size: 12pt !important;
              margin-bottom: 3mm !important;
            }

            .bg-blue-50 {
              background-color: transparent !important;
              border: 1px solid #e5e7eb !important;
            }
          }
        `}
      </style>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 print-wrapper">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden print-content">
            <div className="px-8 py-10">
              <div className="flex items-center justify-center mb-8 print-header">
                <CheckCircle className="h-16 w-16 text-green-500 no-print" />
              </div>
              
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                {isHavalePayment ? 'Sipariş Alındı' : 'Ödeme Başarılı'}
              </h2>
              <p className="text-center text-gray-600 mb-8 no-print">
                {isHavalePayment 
                  ? 'Stok talebiniz alındı. Havale işlemini tamamladıktan sonra siparişiniz işleme alınacaktır.'
                  : 'Stok talebiniz başarıyla alındı ve ödemeniz tamamlandı.'}
              </p>

              <div className="border-t border-gray-200 pt-8">
                <div className="mb-8 print-info">
                  <div className="flex items-center gap-2 mb-4">
                    <Store className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Şube Bilgileri</h3>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <dl className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-600">Şube Adı:</dt>
                        <dd className="text-sm font-semibold text-gray-900">{order.store?.name || user?.storeName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-600">Şube Kodu:</dt>
                        <dd className="text-sm font-semibold text-gray-900">{order.store?.code || user?.storeId}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Package2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Sipariş Özeti</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg overflow-hidden print-table">
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
                        {order.items?.map((item) => (
                          <tr key={item.id} className="text-sm">
                            <td className="px-4 py-3 text-gray-900">{item.product.name}</td>
                            <td className="px-4 py-3 text-gray-900 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-gray-900 text-right">{formatPrice(item.unitPrice)}</td>
                            <td className="px-4 py-3 text-gray-900 text-right">{formatPrice(item.lineTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-sm font-medium text-gray-700 text-right">Ara Toplam:</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">{formatPrice(order.subtotal)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-sm font-medium text-gray-700 text-right">KDV Tutarı:</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">{formatPrice(order.vatAmount)}</td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td colSpan={3} className="px-4 py-2 text-base font-semibold text-gray-900 text-right">Genel Toplam:</td>
                          <td className="px-4 py-2 text-base font-bold text-blue-600 text-right">{formatPrice(order.totalAmount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <dl className="divide-y divide-gray-200 print-totals">
                  <div className="py-4 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Sipariş No</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </dd>
                  </div>
                  <div className="py-4 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Tarih</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatDate(order.createdAt)}
                    </dd>
                  </div>
                  <div className="py-4 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Ödeme Yöntemi</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {getPaymentMethodText(order.paymentMethod)}
                    </dd>
                  </div>
                  <div className="py-4 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Sipariş Durumu</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'PENDING' ? 'Beklemede' : 
                         order.status === 'CONFIRMED' ? 'Onaylandı' : 
                         order.status === 'DELIVERED' ? 'Teslim Edildi' : 
                         order.status}
                      </span>
                    </dd>
                  </div>
                  {order.notes && (
                    <div className="py-4 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Notlar</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {order.notes}
                      </dd>
                    </div>
                  )}
                  {isHavalePayment && (
                    <div className="py-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">Havale Bilgileri</h4>
                        <div className="text-sm text-yellow-700 space-y-1">
                          <p><span className="font-medium">Banka:</span> Garanti Bankası - Ankara OSB Şube</p>
                          <p><span className="font-medium">IBAN:</span> TR84 0006 2001 6810 0006 2963 86</p>
                          <p><span className="font-medium">Açıklama:</span> {order.orderNumber}</p>
                          <p><span className="font-medium">Tutar:</span> {formatPrice(order.totalAmount)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </dl>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 no-print">
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Makbuzu İndir
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Ana Sayfaya Dön
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
