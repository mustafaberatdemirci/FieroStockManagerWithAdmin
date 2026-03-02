# Fiero Kahve Stok Yönetim Sistemi

Fiero Coffee şubeleri için geliştirilmiş stok talep ve sipariş yönetim platformu.

## 🚀 Özellikler

- 🔐 Rol tabanlı kimlik doğrulama (Admin / Şube)
- 📦 130+ ürün ile stok talep sistemi
- 💳 3 ödeme yöntemi (Cari Hesap, Havale, Kredi Kartı)
- 🧾 Sipariş makbuzu oluşturma ve yazdırma
- 📊 Admin dashboard (istatistik, sipariş yönetimi)
- 🏪 Mağaza yönetimi (CRUD)
- 📋 Ürün yönetimi (CRUD, kategori, stok)
- 🔍 Ürün arama ve kategori filtreleme

## 🛠️ Teknolojiler

| Katman    | Teknoloji                  |
| --------- | -------------------------- |
| Framework | React 18 + TypeScript      |
| Build     | Vite                       |
| Styling   | TailwindCSS + Lucide Icons |
| State     | React Query + Zustand      |
| Forms     | React Hook Form + Zod      |
| HTTP      | Axios (mock override)      |
| Routing   | React Router v6            |

## 💻 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama **http://localhost:5173** adresinde açılır.

## 👤 Test Hesapları

| Hesap       | E-posta                   | Şifre    |
| ----------- | ------------------------- | -------- |
| Admin       | admin@fierocoffee.com     | admin123 |
| Demo Şube   | demo@fierocoffee.com      | demo123  |
| Ankara Üni. | ank.unv@fierocoffee.com   | fiero01  |
| Saraçoğlu   | saracoglu@fierocoffee.com | fiero02  |
| Hamamönü    | hamamonu@fierocoffee.com  | fiero03  |

## 📁 Proje Yapısı

```
src/
├── components/ui/    # Ortak UI bileşenleri
├── context/          # AuthContext
├── hooks/            # useAdmin, useOrders, useProducts...
├── lib/              # Axios mock client
├── mocks/            # Mock data + handlers
├── pages/            # Sayfa bileşenleri (8 sayfa)
├── schemas/          # Zod validation şemaları
├── stores/           # Zustand state
├── types/            # TypeScript tipleri
└── utils/            # Yardımcı fonksiyonlar
```

## 📄 Sayfalar

| Sayfa           | Route             | Rol          |
| --------------- | ----------------- | ------------ |
| Giriş           | `/login`          | Herkese açık |
| Stok Talebi     | `/`               | Şube         |
| Ödeme           | `/payment`        | Şube         |
| Makbuz          | `/receipt`        | Şube         |
| Sipariş Geçmişi | `/orders`         | Şube         |
| Admin Dashboard | `/admin`          | Admin        |
| Ürün Yönetimi   | `/admin/products` | Admin        |
| Mağaza Yönetimi | `/admin/stores`   | Admin        |

---

**Son Güncelleme:** 2026-03-02
