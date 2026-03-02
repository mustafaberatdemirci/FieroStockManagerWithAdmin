import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { StockRequestPage } from './pages/StockRequestPage';
import { PaymentPage } from './pages/PaymentPage';
import { ReceiptPage } from './pages/ReceiptPage';
import { OrdersHistoryPage } from './pages/OrdersHistoryPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminStoresPage } from './pages/AdminStoresPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function PrivateRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'ADMIN' | 'STORE' }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminProductsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/stores"
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminStoresPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute requiredRole="STORE">
                <StockRequestPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <PrivateRoute requiredRole="STORE">
                <PaymentPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/receipt"
            element={
              <PrivateRoute requiredRole="STORE">
                <ReceiptPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute requiredRole="STORE">
                <OrdersHistoryPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
