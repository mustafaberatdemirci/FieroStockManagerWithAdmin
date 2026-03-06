// ─── Mock API Handlers ───────────────────────────────────────────────────────
// Route-matching functions that intercept axios requests and return mock data.
// Activated via VITE_USE_MOCK=true in .env

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  MOCK_USERS,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_STORES,
  MOCK_DASHBOARD_STATS,
  MOCK_CAMPAIGNS,
  generateMockOrderNumber,
  getNextOrderId,
  getNextCampaignId,
  type Campaign,
} from './data';

import type { AxiosRequestConfig } from 'axios';

// Simulated network delay (ms)
const DELAY = 200;

interface MockResponse {
  status: number;
  data: unknown;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Current session state ───────────────────────────────────────────────────
let _currentUserId: string | null = null;
// Mutable copy of orders for create/update
const _orders = [...MOCK_ORDERS];

// ─── Route Matcher ───────────────────────────────────────────────────────────

export async function handleMockRequest(config: AxiosRequestConfig): Promise<MockResponse> {
  await delay(DELAY);

  const rawUrl = config.url || '';
  // Strip query string from URL for clean route matching
  const [url, queryString] = rawUrl.split('?');
  const method = (config.method || 'get').toUpperCase();
  const body = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};

  // Merge URL query params + axios config.params (URL params take priority for admin pages)
  const urlParams: Record<string, string> = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((v, k) => { urlParams[k] = v; });
  }
  const params = { ...urlParams, ...(config.params || {}) };

  // ─── AUTH ────────────────────────────────────────────────────────────────
  if (url.includes('/auth/login') && method === 'POST') {
    return handleLogin(body);
  }
  if (url.includes('/auth/refresh') && method === 'POST') {
    return handleRefresh(body);
  }
  if (url.includes('/auth/logout') && method === 'POST') {
    return { status: 200, data: { success: true, message: 'Logout successful' } };
  }
  if (url.includes('/auth/me') && method === 'GET') {
    return handleGetMe();
  }

  // ─── PRODUCTS ───────────────────────────────────────────────────────────
  if (url.match(/\/products\/[^/]+$/) && !url.includes('/admin/') && method === 'GET') {
    const id = url.split('/').pop()!;
    return handleGetProductById(id);
  }
  if (url.includes('/products') && !url.includes('/admin/') && method === 'GET') {
    return handleGetProducts(params);
  }

  // ─── CATEGORIES ─────────────────────────────────────────────────────────
  if (url.includes('/categories') && method === 'GET') {
    return handleGetCategories();
  }

  // ─── ORDERS (store user) ────────────────────────────────────────────────
  if (url.match(/\/orders\/[^/]+$/) && !url.includes('/admin/') && method === 'GET') {
    const id = url.split('/').pop()!;
    return handleGetOrderById(id);
  }
  if (url.includes('/orders') && !url.includes('/admin/') && method === 'POST') {
    return handleCreateOrder(body);
  }
  if (url.includes('/orders') && !url.includes('/admin/') && method === 'GET') {
    return handleGetOrders(params);
  }

  // ─── ADMIN ORDERS ───────────────────────────────────────────────────────
  if (url.match(/\/admin\/orders\/[^/]+\/status$/) && method === 'PUT') {
    const parts = url.split('/');
    const orderId = parts[parts.indexOf('orders') + 1];
    return handleUpdateOrderStatus(orderId, body);
  }
  if (url.includes('/admin/orders') && method === 'GET') {
    return handleGetAdminOrders(params);
  }

  // ─── ADMIN DASHBOARD ───────────────────────────────────────────────────
  if (url.includes('/admin/dashboard/stats') && method === 'GET') {
    return { status: 200, data: { success: true, data: MOCK_DASHBOARD_STATS } };
  }

  // ─── ADMIN STORES (CRUD) ───────────────────────────────────────────────
  if (url.match(/\/admin\/stores\/[^/]+$/) && method === 'PUT') {
    return handleUpdateStore(url.split('/').pop()!, body);
  }
  if (url.match(/\/admin\/stores\/[^/]+$/) && method === 'DELETE') {
    return handleDeleteStore(url.split('/').pop()!);
  }
  if (url.includes('/admin/stores') && method === 'POST') {
    return handleCreateStore(body);
  }
  if (url.includes('/admin/stores') && method === 'GET') {
    return { status: 200, data: { success: true, data: MOCK_STORES } };
  }

  // ─── ADMIN PRODUCTS (CRUD) ─────────────────────────────────────────────
  if (url.match(/\/admin\/products\/[^/]+\/toggle-status$/) && method === 'PATCH') {
    const parts = url.split('/');
    const productId = parts[parts.indexOf('products') + 1];
    return handleToggleProductStatus(productId);
  }
  if (url.match(/\/admin\/products\/export/) && method === 'GET') {
    return { status: 200, data: 'code,name,price\n' };
  }
  if (url.match(/\/admin\/products\/[^/]+$/) && method === 'PUT') {
    return handleAdminUpdateProduct(url.split('/').pop()!, body);
  }
  if (url.match(/\/admin\/products\/[^/]+$/) && method === 'DELETE') {
    return handleAdminDeleteProduct(url.split('/').pop()!);
  }
  if (url.includes('/admin/products') && method === 'POST') {
    return handleAdminCreateProduct(body);
  }
  if (url.includes('/admin/products') && method === 'GET') {
    return handleGetAdminProducts(params);
  }

  // ─── CAMPAIGNS (store user — active only) ─────────────────────────────
  if (url.includes('/campaigns/apply-code') && method === 'POST') {
    return handleApplyPromoCode(body);
  }
  if (url.includes('/campaigns') && !url.includes('/admin/') && method === 'GET') {
    return handleGetActiveCampaigns();
  }

  // ─── ADMIN CAMPAIGNS (CRUD) ────────────────────────────────────────────
  if (url.match(/\/admin\/campaigns\/[^/]+$/) && method === 'PUT') {
    return handleAdminUpdateCampaign(url.split('/').pop()!, body);
  }
  if (url.match(/\/admin\/campaigns\/[^/]+$/) && method === 'DELETE') {
    return handleAdminDeleteCampaign(url.split('/').pop()!);
  }
  if (url.includes('/admin/campaigns') && method === 'POST') {
    return handleAdminCreateCampaign(body);
  }
  if (url.includes('/admin/campaigns') && method === 'GET') {
    return { status: 200, data: { success: true, data: MOCK_CAMPAIGNS } };
  }

  // ─── HEALTH ─────────────────────────────────────────────────────────────
  if (url.includes('/health')) {
    return { status: 200, data: { success: true, message: 'Mock API healthy', timestamp: new Date().toISOString() } };
  }

  // ─── FALLBACK ───────────────────────────────────────────────────────────
  console.warn(`[Mock] Unhandled route: ${method} ${url}`);
  return { status: 404, data: { success: false, message: `Mock route not found: ${method} ${url}` } };
}

// ─── Auth Handlers ───────────────────────────────────────────────────────────

function handleLogin(body: { email?: string; password?: string }): MockResponse {
  const user = MOCK_USERS.find(u => u.email === body.email && u.password === body.password);

  if (!user) {
    return { status: 401, data: { success: false, message: 'Geçersiz email veya şifre' } };
  }

  _currentUserId = user.id;

  return {
    status: 200,
    data: {
      success: true,
      message: 'Login successful',
      data: {
        accessToken: `mock_access_${user.id}_${Date.now()}`,
        refreshToken: `mock_refresh_${user.id}_${Date.now()}`,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          store: user.store,
        },
      },
    },
  };
}

function handleRefresh(body?: { refreshToken?: string }): MockResponse {
  // Try to find user from: 1) _currentUserId, 2) refreshToken embedded userId, 3) localStorage hint
  let user = _currentUserId ? MOCK_USERS.find(u => u.id === _currentUserId) : null;

  if (!user && body?.refreshToken) {
    // Mock tokens have format: mock_refresh_USERID_timestamp
    const tokenParts = body.refreshToken.split('_');
    if (tokenParts.length >= 3) {
      const embeddedId = tokenParts.slice(2, -1).join('_'); // Handle IDs with underscores
      user = MOCK_USERS.find(u => u.id === embeddedId);
    }
  }

  // Fallback: keep the last known user, or use admin as default
  if (!user) user = MOCK_USERS[0]; // Default to admin, not demo

  if (!user) {
    return { status: 401, data: { success: false, message: 'Invalid refresh token' } };
  }

  return {
    status: 200,
    data: {
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: `mock_access_${user.id}_${Date.now()}`,
        refreshToken: `mock_refresh_${user.id}_${Date.now()}`,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          store: user.store,
        },
      },
    },
  };
}

function handleGetMe(): MockResponse {
  const user = _currentUserId ? MOCK_USERS.find(u => u.id === _currentUserId) : null;
  if (!user) return { status: 401, data: { success: false, message: 'Not authenticated' } };
  return { status: 200, data: { success: true, data: { id: user.id, username: user.username, email: user.email, role: user.role, store: user.store } } };
}

// ─── Products Handlers ───────────────────────────────────────────────────────

function handleGetProducts(params: Record<string, string>): MockResponse {
  let filtered = [...MOCK_PRODUCTS];

  // Search
  if (params.search) {
    const term = params.search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term));
  }

  // Category filter
  if (params.category) {
    filtered = filtered.filter(p => p.category.name === params.category || p.categoryId === params.category);
  }

  // Sorting
  if (params.sortBy) {
    const dir = params.sortOrder === 'desc' ? -1 : 1;
    filtered.sort((a, b) => {
      const key = params.sortBy as keyof typeof a;
      if (typeof a[key] === 'string') return dir * (a[key] as string).localeCompare(b[key] as string);
      return dir * ((a[key] as number) - (b[key] as number));
    });
  }

  // Pagination
  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '20');
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return {
    status: 200,
    data: {
      success: true,
      data: paged,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  };
}

function handleGetProductById(id: string): MockResponse {
  const product = MOCK_PRODUCTS.find(p => p.id === id || p.code === id);
  if (!product) return { status: 404, data: { success: false, message: 'Product not found' } };
  return { status: 200, data: { success: true, data: product } };
}

// ─── Categories Handler ──────────────────────────────────────────────────────

function handleGetCategories(): MockResponse {
  return { status: 200, data: { success: true, data: MOCK_CATEGORIES } };
}

// ─── Orders Handlers ─────────────────────────────────────────────────────────

function handleGetOrders(params: Record<string, string>): MockResponse {
  const currentUser = _currentUserId ? MOCK_USERS.find(u => u.id === _currentUserId) : MOCK_USERS[1];
  if (!currentUser?.store) return { status: 200, data: { success: true, data: [], pagination: { currentPage: 1, totalPages: 0, totalCount: 0, hasNext: false, hasPrev: false } } };

  let filtered = _orders.filter(o => o.storeId === currentUser.store!.id);

  if (params.status) filtered = filtered.filter(o => o.status === params.status);

  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '20');
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return {
    status: 200,
    data: {
      success: true,
      data: paged,
      pagination: { currentPage: page, totalPages, totalCount, hasNext: page < totalPages, hasPrev: page > 1 },
    },
  };
}

function handleGetOrderById(id: string): MockResponse {
  const order = _orders.find(o => o.id === id || o.orderNumber === id);
  if (!order) return { status: 404, data: { success: false, message: 'Order not found' } };
  return { status: 200, data: { success: true, data: order } };
}

function handleCreateOrder(body: { items?: Array<{ productId: string; quantity: number }>; paymentMethod?: string; notes?: string }): MockResponse {
  const currentUser = _currentUserId ? MOCK_USERS.find(u => u.id === _currentUserId) : MOCK_USERS[1];
  if (!currentUser?.store) return { status: 400, data: { success: false, message: 'Store not found' } };

  const orderItems = (body.items || []).map((item, idx) => {
    const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
    if (!product) return null;
    const lineTotal = product.price * item.quantity * (1 + product.vatRate);
    return {
      id: `oi_new_${Date.now()}_${idx}`,
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.price,
      vatRate: product.vatRate,
      lineTotal: Math.round(lineTotal * 100) / 100,
      product: {
        id: product.id,
        code: product.code,
        name: product.name,
        description: product.description,
        category: { name: product.category.name },
      },
    };
  }).filter(Boolean) as typeof MOCK_ORDERS[0]['items'];

  const subtotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const vatAmount = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity * i.vatRate, 0);
  const totalAmount = Math.round((subtotal + vatAmount) * 100) / 100;

  const newOrder = {
    id: getNextOrderId(),
    orderNumber: generateMockOrderNumber(),
    storeId: currentUser.store.id,
    status: 'PENDING' as const,
    paymentMethod: (body.paymentMethod || 'BANK_TRANSFER') as 'BANK_TRANSFER' | 'CURRENT_ACCOUNT' | 'CREDIT_CARD',
    paymentStatus: 'PENDING' as const,
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    totalAmount,
    notes: body.notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    store: currentUser.store,
    items: orderItems,
    payments: [],
  };

  (_orders as any[]).unshift(newOrder);

  return { status: 201, data: { success: true, data: newOrder } };
}

// ─── Admin Orders Handlers ───────────────────────────────────────────────────

function handleGetAdminOrders(params: Record<string, string>): MockResponse {
  let filtered = [..._orders];

  if (params.status) filtered = filtered.filter(o => o.status === params.status);
  if (params.storeId) filtered = filtered.filter(o => o.storeId === params.storeId);
  if (params.search) {
    const term = params.search.toLowerCase();
    filtered = filtered.filter(o =>
      o.orderNumber.toLowerCase().includes(term) ||
      o.store.name.toLowerCase().includes(term) ||
      o.store.code.toLowerCase().includes(term)
    );
  }
  if (params.dateFrom) filtered = filtered.filter(o => o.createdAt >= params.dateFrom);
  if (params.dateTo) filtered = filtered.filter(o => o.createdAt <= params.dateTo);

  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '10');
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return {
    status: 200,
    data: {
      success: true,
      data: {
        orders: paged,
        pagination: { currentPage: page, totalPages, totalCount, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
      },
    },
  };
}

function handleUpdateOrderStatus(orderId: string, body: { status?: string }): MockResponse {
  const order = _orders.find(o => o.id === orderId);
  if (!order) return { status: 404, data: { success: false, message: 'Order not found' } };

  const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!body.status || !validStatuses.includes(body.status)) {
    return { status: 400, data: { success: false, message: 'Invalid status' } };
  }

  Object.assign(order, { status: body.status, updatedAt: new Date().toISOString() });

  return { status: 200, data: { success: true, data: order } };
}

// ─── Admin Products Handlers ─────────────────────────────────────────────────

function handleGetAdminProducts(params: Record<string, string>): MockResponse {
  let filtered = [...MOCK_PRODUCTS];

  if (params.search) {
    const term = params.search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term));
  }
  if (params.category) {
    filtered = filtered.filter(p => p.category.name === params.category || p.categoryId === params.category);
  }
  if (params.status === 'active') {
    filtered = filtered.filter(p => p.isActive);
  } else if (params.status === 'inactive') {
    filtered = filtered.filter(p => !p.isActive);
  }

  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '20');
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / limit);
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return {
    status: 200,
    data: {
      success: true,
      data: {
        products: paged,
        pagination: { currentPage: page, totalPages, totalCount, hasNext: page < totalPages, hasPrev: page > 1 },
      },
    },
  };
}

function handleToggleProductStatus(id: string): MockResponse {
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  if (!product) return { status: 404, data: { success: false, message: 'Product not found' } };

  (product as any).isActive = !product.isActive;
  (product as any).updatedAt = new Date().toISOString();
  return { status: 200, data: { success: true, data: { isActive: product.isActive } } };
}

function handleAdminCreateProduct(body: Record<string, unknown>): MockResponse {
  const cat = MOCK_CATEGORIES.find(c => c.id === body.categoryId);
  const newProduct = {
    id: `prd_new_${Date.now()}`,
    code: (body.code as string) || `NEW-${Date.now()}`,
    name: (body.name as string) || 'Yeni Ürün',
    description: null as null,
    price: (body.price as number) || 0,
    vatRate: (body.vatRate as number) || 0.01,
    categoryId: ((body.categoryId as string) || MOCK_CATEGORIES[0].id) as typeof MOCK_CATEGORIES[0]['id'],
    isActive: true,
    stockQuantity: (body.stockQuantity as number) || 0,
    minOrderQuantity: 1,
    maxOrderQuantity: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: cat ? { id: cat.id, name: cat.name, description: cat.description, isActive: cat.isActive } : { id: MOCK_CATEGORIES[0].id, name: MOCK_CATEGORIES[0].name, description: MOCK_CATEGORIES[0].description, isActive: true },
  };

  (MOCK_PRODUCTS as any[]).push(newProduct);
  return { status: 201, data: { success: true, data: newProduct } };
}

function handleAdminUpdateProduct(id: string, body: Record<string, unknown>): MockResponse {
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  if (!product) return { status: 404, data: { success: false, message: 'Product not found' } };

  Object.assign(product, body, { updatedAt: new Date().toISOString() });
  return { status: 200, data: { success: true, data: product } };
}

function handleAdminDeleteProduct(id: string): MockResponse {
  const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
  if (idx === -1) return { status: 404, data: { success: false, message: 'Product not found' } };

  MOCK_PRODUCTS.splice(idx, 1);
  return { status: 200, data: { success: true, message: 'Product deleted' } };
}

// ─── Store CRUD Handlers ────────────────────────────────────────────────────

function handleCreateStore(body: Record<string, unknown>): MockResponse {
  const now = new Date().toISOString();
  const storeId = `str_new_${Date.now()}`;
  const userId = `usr_new_${Date.now()}`;

  // Create user for the store
  const newUser = {
    id: userId,
    username: (body.username as string) || `store_${Date.now()}`,
    email: (body.email as string) || `store${Date.now()}@fierocoffee.com`,
    password: (body.password as string) || 'fiero123',
    role: 'STORE' as const,
    isActive: true,
    lastLoginAt: null as string | null,
    store: {
      id: storeId,
      name: (body.name as string) || 'Yeni Mağaza',
      code: (body.code as string) || `NEW${Date.now().toString().slice(-3)}`,
      address: (body.address as string) || '',
      phone: (body.phone as string) || '',
    },
  };
  (MOCK_USERS as any[]).push(newUser);

  // Create store
  const newStore = {
    id: storeId,
    name: newUser.store.name,
    code: newUser.store.code,
    address: newUser.store.address,
    phone: newUser.store.phone,
    isActive: true,
    balance: 0,
    creditLimit: 5000,
    createdAt: now,
    updatedAt: now,
    user: { id: userId, username: newUser.username, email: newUser.email, isActive: true, lastLoginAt: null as string | null },
    _count: { orders: 0 },
  };
  (MOCK_STORES as any[]).push(newStore);

  return { status: 201, data: { success: true, data: newStore } };
}

function handleUpdateStore(id: string, body: Record<string, unknown>): MockResponse {
  const store = MOCK_STORES.find(s => s.id === id);
  if (!store) return { status: 404, data: { success: false, message: 'Store not found' } };

  if (body.name) (store as any).name = body.name;
  if (body.code) (store as any).code = body.code;
  if (body.address !== undefined) (store as any).address = body.address;
  if (body.phone !== undefined) (store as any).phone = body.phone;
  if (body.isActive !== undefined) (store as any).isActive = body.isActive;
  (store as any).updatedAt = new Date().toISOString();

  return { status: 200, data: { success: true, data: store } };
}

function handleDeleteStore(id: string): MockResponse {
  const idx = MOCK_STORES.findIndex(s => s.id === id);
  if (idx === -1) return { status: 404, data: { success: false, message: 'Store not found' } };

  MOCK_STORES.splice(idx, 1);
  return { status: 200, data: { success: true, message: 'Store deleted' } };
}

// ─── Campaign Handlers ──────────────────────────────────────────────────────

function handleGetActiveCampaigns(): MockResponse {
  const now = new Date().toISOString();
  const active = MOCK_CAMPAIGNS.filter(c =>
    c.isActive && c.startDate <= now && c.endDate >= now && !c.code
  );
  return { status: 200, data: { success: true, data: active } };
}

function handleApplyPromoCode(body: { code?: string }): MockResponse {
  if (!body.code) {
    return { status: 400, data: { success: false, message: 'Promosyon kodu gereklidir' } };
  }
  const now = new Date().toISOString();
  const campaign = MOCK_CAMPAIGNS.find(c =>
    c.code?.toUpperCase() === body.code!.toUpperCase() &&
    c.isActive && c.startDate <= now && c.endDate >= now
  );
  if (!campaign) {
    return { status: 404, data: { success: false, message: 'Geçersiz veya süresi dolmuş promosyon kodu' } };
  }
  return { status: 200, data: { success: true, data: campaign } };
}

function handleAdminCreateCampaign(body: Record<string, unknown>): MockResponse {
  const now = new Date().toISOString();
  const newCampaign: Campaign = {
    id: getNextCampaignId(),
    name: (body.name as string) || '',
    description: (body.description as string) || '',
    type: (body.type as Campaign['type']) || 'PERCENTAGE',
    discountValue: (body.discountValue as number) || 0,
    buyQuantity: body.buyQuantity as number | undefined,
    minimumAmount: body.minimumAmount as number | undefined,
    code: body.code as string | undefined,
    targetCategories: body.targetCategories as string[] | undefined,
    targetProducts: body.targetProducts as string[] | undefined,
    startDate: (body.startDate as string) || now,
    endDate: (body.endDate as string) || now,
    isActive: body.isActive !== false,
    createdAt: now,
    updatedAt: now,
  };
  MOCK_CAMPAIGNS.push(newCampaign);
  return { status: 201, data: { success: true, data: newCampaign } };
}

function handleAdminUpdateCampaign(id: string, body: Record<string, unknown>): MockResponse {
  const camp = MOCK_CAMPAIGNS.find(c => c.id === id);
  if (!camp) return { status: 404, data: { success: false, message: 'Campaign not found' } };

  if (body.name !== undefined) camp.name = body.name as string;
  if (body.description !== undefined) camp.description = body.description as string;
  if (body.type !== undefined) camp.type = body.type as Campaign['type'];
  if (body.discountValue !== undefined) camp.discountValue = body.discountValue as number;
  if (body.buyQuantity !== undefined) camp.buyQuantity = body.buyQuantity as number;
  if (body.minimumAmount !== undefined) camp.minimumAmount = body.minimumAmount as number;
  if (body.code !== undefined) camp.code = body.code as string;
  if (body.targetCategories !== undefined) camp.targetCategories = body.targetCategories as string[];
  if (body.targetProducts !== undefined) camp.targetProducts = body.targetProducts as string[];
  if (body.startDate !== undefined) camp.startDate = body.startDate as string;
  if (body.endDate !== undefined) camp.endDate = body.endDate as string;
  if (body.isActive !== undefined) camp.isActive = body.isActive as boolean;
  camp.updatedAt = new Date().toISOString();

  return { status: 200, data: { success: true, data: camp } };
}

function handleAdminDeleteCampaign(id: string): MockResponse {
  const idx = MOCK_CAMPAIGNS.findIndex(c => c.id === id);
  if (idx === -1) return { status: 404, data: { success: false, message: 'Campaign not found' } };

  MOCK_CAMPAIGNS.splice(idx, 1);
  return { status: 200, data: { success: true, message: 'Campaign deleted' } };
}
