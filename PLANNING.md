# Fiero Kahve Stok Yönetim Sistemi — Proje Mimarisi

## 📋 Proje Özeti

Fiero Coffee şubeleri için geliştirilmiş stok talep ve sipariş yönetim sistemi. Şubeler 130+ ürün arasından sipariş oluşturur, ödeme süreçlerini yönetir. Admin paneli ile mağaza, ürün ve sipariş yönetimi yapılır.

**Mevcut Mod:** Frontend-only (Mock Data) — Backend entegrasyona hazır.

## 🏗️ Mimari

### Frontend Stack

| Teknoloji                  | Kullanım                |
| -------------------------- | ----------------------- |
| React 18 + TypeScript      | UI framework            |
| Vite                       | Build tool & dev server |
| TailwindCSS + Lucide Icons | Styling                 |
| React Query (TanStack)     | Server state management |
| Zustand                    | Client state management |
| React Router v6            | Routing                 |
| Axios (mock override)      | HTTP client             |
| React Hook Form + Zod      | Form validation         |

### Mock Data Katmanı

```
src/mocks/
├── data.ts       # Kullanıcılar, mağazalar, ürünler, kategoriler, siparişler
└── handlers.ts   # Route matching + CRUD handler fonksiyonları
```

`src/lib/axios.ts` içinde `IS_MOCK=true` olduğunda `api.get/post/put/patch/delete` methodları mock handler'lara yönlendirilir. Backend geçişi için sadece `.env` değiştirilir.

## 🎯 Kullanıcı Rolleri

| Rol       | Yetkiler                                                         |
| --------- | ---------------------------------------------------------------- |
| **ADMIN** | Tüm siparişler, mağaza CRUD, ürün CRUD, dashboard istatistikleri |
| **STORE** | Ürün kataloğu, sipariş oluşturma, ödeme, sipariş geçmişi         |

## � Klasör Yapısı

```
FieroStockManager/
├── src/
│   ├── components/ui/    # FormField, FormButton
│   ├── context/          # AuthContext (login, token, rol)
│   ├── hooks/            # useAdmin, useOrders, useProducts...
│   ├── lib/              # axios.ts (mock override)
│   ├── mocks/            # data.ts + handlers.ts
│   ├── pages/            # 8 sayfa (aşağıda)
│   ├── schemas/          # Zod validation
│   ├── stores/           # Zustand (cart)
│   ├── types/            # TypeScript interfaces
│   └── utils/            # format, helpers
├── public/               # Statik dosyalar, logo
├── .env                  # Mock/prod flag
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## 📄 Sayfalar

| Sayfa             | Route             | Rol          |
| ----------------- | ----------------- | ------------ |
| LoginPage         | `/login`          | Herkese açık |
| StockRequestPage  | `/`               | STORE        |
| PaymentPage       | `/payment`        | STORE        |
| ReceiptPage       | `/receipt`        | STORE        |
| OrdersHistoryPage | `/orders`         | STORE        |
| AdminDashboard    | `/admin`          | ADMIN        |
| AdminProductsPage | `/admin/products` | ADMIN        |
| AdminStoresPage   | `/admin/stores`   | ADMIN        |

## 🔐 Kimlik Doğrulama

Mock modda `AuthContext` üzerinden kullanıcı/şifre kontrolü yapılır. JWT access + refresh token simüle edilir.

## 💳 Ödeme Yöntemleri

- **Cari Hesap** — Bakiyeden düşüm
- **Havale / EFT** — Banka bilgileri + sipariş numarası
- **Kredi Kartı** — Mock kart formu (card number, expiry, CVV)

---

**Son Güncelleme:** 2026-03-02
**Durum:** ✅ Frontend Tam Çalışır (Mock Data)
