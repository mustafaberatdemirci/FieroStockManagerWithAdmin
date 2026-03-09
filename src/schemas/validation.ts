import { z } from 'zod';

// Login form validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email adresi gereklidir')
    .email('Geçerli bir email adresi girin'),
  password: z
    .string()
    .min(1, 'Şifre gereklidir')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
});

// Stock request item validation schema
export const stockItemSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, 'Ürün seçimi gereklidir'),
  name: z.string().min(1, 'Ürün adı gereklidir'),
  requestedAmount: z
    .number()
    .min(0, 'Miktar 0\'dan küçük olamaz')
    .max(10000, 'Miktar 10.000\'i geçemez'),
  price: z.number().min(0, 'Fiyat geçersiz'),
  vatRate: z.number().min(0, 'KDV oranı geçersiz'),
  supplierId: z.string().optional(),
});

// Stock request form validation schema
export const stockRequestSchema = z.object({
  storeName: z.string().min(1, 'Şube adı gereklidir'),
  storeId: z.string().min(1, 'Şube ID gereklidir'),
  items: z
    .array(stockItemSchema)
    .min(1, 'En az bir ürün eklemelisiniz'),
  notes: z.string().optional(),
});

// Payment form validation schema
export const paymentSchema = z.object({
  paymentMethod: z.enum(['BANK_TRANSFER', 'CURRENT_ACCOUNT', 'CREDIT_CARD'], {
    message: 'Ödeme yöntemi seçimi gereklidir',
  }),
  totalAmount: z.number().min(0.01, 'Toplam tutar 0\'dan büyük olmalıdır'),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    requestedAmount: z.number().min(1),
    price: z.number().min(0),
  })).min(1, 'Sipariş öğeleri gereklidir'),
  notes: z.string().optional(),
});

// Search and filter validation schema
export const searchFilterSchema = z.object({
  searchTerm: z.string().optional(),
  selectedCategory: z.string().optional(),
  currentPage: z.number().min(1, 'Sayfa numarası 1\'den küçük olamaz').default(1),
  itemsPerPage: z.number().min(1).max(100).default(20),
});

// Admin dashboard filter schema
export const adminFilterSchema = z.object({
  status: z.string().optional(),
  storeId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Types derived from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type StockItemData = z.infer<typeof stockItemSchema>;
export type StockRequestData = z.infer<typeof stockRequestSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type SearchFilterData = z.infer<typeof searchFilterSchema>;
export type AdminFilterData = z.infer<typeof adminFilterSchema>;

// Form validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 10000;
};

export const validateRequired = (value: string | number | null | undefined): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (typeof value === 'number') {
    return !isNaN(value);
  }
  return value !== null && value !== undefined;
};

// Custom validation error messages
export const validationMessages = {
  required: 'Bu alan zorunludur',
  email: 'Geçerli bir email adresi girin',
  password: 'Şifre en az 6 karakter olmalıdır',
  amount: 'Miktar 1 ile 10.000 arasında olmalıdır',
  positiveNumber: 'Değer 0\'dan büyük olmalıdır',
  maxLength: (max: number) => `En fazla ${max} karakter girebilirsiniz`,
  minLength: (min: number) => `En az ${min} karakter girmelisiniz`,
  invalidFormat: 'Geçersiz format',
} as const;
