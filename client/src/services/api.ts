const API_BASE = '/api';

let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function isAuthenticated(): boolean {
  return !!accessToken;
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(res.status, error.error || 'Request failed', error);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
  }
}

// ─── Auth ───────────────────────────────────────────────

export const auth = {
  async register(email: string, password: string, name: string) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    setTokens(data.accessToken, data.refreshToken);
    return data.user;
  },

  async login(email: string, password: string) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setTokens(data.accessToken, data.refreshToken);
    return data.user;
  },

  async googleLogin(idToken: string) {
    const data = await request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    setTokens(data.accessToken, data.refreshToken);
    return data.user;
  },

  async me() {
    return request('/auth/me');
  },

  async logout() {
    await request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
    clearTokens();
  },
};

// ─── Users ──────────────────────────────────────────────

export const users = {
  getProfile: () => request('/users/profile'),
  updateProfile: (data: Record<string, any>) => request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request('/users/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
  deleteAccount: () => request('/users/account', { method: 'DELETE' }),
};

// ─── Sites ──────────────────────────────────────────────

export const sites = {
  list: () => request('/sites'),
  get: (id: string) => request(`/sites/${id}`),
  create: (data: Record<string, any>) => request('/sites', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, any>) => request(`/sites/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/sites/${id}`, { method: 'DELETE' }),
  launch: (id: string) => request(`/sites/${id}/launch`, { method: 'POST' }),
  updateContact: (id: string, data: Record<string, any>) => request(`/sites/${id}/contact`, { method: 'PUT', body: JSON.stringify(data) }),
  addService: (id: string, data: Record<string, any>) => request(`/sites/${id}/services`, { method: 'POST', body: JSON.stringify(data) }),
  updateService: (siteId: string, serviceId: string, data: Record<string, any>) =>
    request(`/sites/${siteId}/services/${serviceId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (siteId: string, serviceId: string) =>
    request(`/sites/${siteId}/services/${serviceId}`, { method: 'DELETE' }),
};

// ─── Pages ──────────────────────────────────────────────

export const pages = {
  list: (siteId: string) => request(`/sites/${siteId}/pages`),
  get: (siteId: string, pageId: string) => request(`/sites/${siteId}/pages/${pageId}`),
  create: (siteId: string, data: Record<string, any>) =>
    request(`/sites/${siteId}/pages`, { method: 'POST', body: JSON.stringify(data) }),
  update: (siteId: string, pageId: string, data: Record<string, any>) =>
    request(`/sites/${siteId}/pages/${pageId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (siteId: string, pageId: string) => request(`/sites/${siteId}/pages/${pageId}`, { method: 'DELETE' }),
  reorder: (siteId: string, pageIds: string[]) =>
    request(`/sites/${siteId}/pages/reorder`, { method: 'PUT', body: JSON.stringify({ pageIds }) }),
};

// ─── Templates ──────────────────────────────────────────

export const templates = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/templates${q}`);
  },
  get: (id: string) => request(`/templates/${id}`),
  purchase: (id: string) => request(`/templates/${id}/purchase`, { method: 'POST' }),
};

// ─── Design ─────────────────────────────────────────────

export const design = {
  getTokens: (siteId: string) => request(`/design/${siteId}`),
  updateTokens: (siteId: string, tokens: Record<string, any>) =>
    request(`/design/${siteId}`, { method: 'PUT', body: JSON.stringify(tokens) }),
  vibeDesign: (siteId: string, prompt: string) =>
    request('/design/vibe', { method: 'POST', body: JSON.stringify({ siteId, prompt }) }),
};

// ─── AI ─────────────────────────────────────────────────

export const ai = {
  chat: (message: string, siteId?: string) =>
    request('/ai/assistant', { method: 'POST', body: JSON.stringify({ message, siteId }) }),
  getChatHistory: (siteId?: string) => {
    const q = siteId ? `?siteId=${siteId}` : '';
    return request(`/ai/chat-history${q}`);
  },
  generateSeo: (siteId: string, pageContent: string) =>
    request('/ai/seo-generate', { method: 'POST', body: JSON.stringify({ siteId, pageContent }) }),
};

// ─── Credits ────────────────────────────────────────────

export const credits = {
  getBalance: () => request('/credits/balance'),
  getHistory: () => request('/credits/history'),
  purchase: (pack: string) => request('/credits/purchase', { method: 'POST', body: JSON.stringify({ pack }) }),
};

// ─── Billing ────────────────────────────────────────────

export const billing = {
  createCheckout: (plan: string) =>
    request('/billing/create-checkout', { method: 'POST', body: JSON.stringify({ plan }) }),
  createCreditCheckout: (pack: string) =>
    request('/billing/create-credit-checkout', { method: 'POST', body: JSON.stringify({ pack }) }),
  getSubscriptions: () => request('/billing/subscriptions'),
  getInvoices: () => request('/billing/invoices'),
  cancelSubscription: () => request('/billing/cancel-subscription', { method: 'POST' }),
  getAddons: () => request('/billing/addons'),
  activateAddon: (type: string) => request('/billing/addons', { method: 'POST', body: JSON.stringify({ type }) }),
  deactivateAddon: (type: string) => request(`/billing/addons/${type}`, { method: 'DELETE' }),
};

// ─── Leads ──────────────────────────────────────────────

export const leads = {
  list: (siteId: string, params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/sites/${siteId}/leads${q}`);
  },
  markRead: (siteId: string, leadId: string) =>
    request(`/sites/${siteId}/leads/${leadId}/read`, { method: 'PUT' }),
  exportCsv: (siteId: string) => `${API_BASE}/sites/${siteId}/leads/export`,
};

// ─── Shop ───────────────────────────────────────────────

export const shop = {
  getProducts: (siteId: string) => request(`/sites/${siteId}/shop/products`),
  createProduct: (siteId: string, data: Record<string, any>) =>
    request(`/sites/${siteId}/shop/products`, { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (siteId: string, productId: string, data: Record<string, any>) =>
    request(`/sites/${siteId}/shop/products/${productId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (siteId: string, productId: string) =>
    request(`/sites/${siteId}/shop/products/${productId}`, { method: 'DELETE' }),
  getOrders: (siteId: string) => request(`/sites/${siteId}/shop/orders`),
  updateOrderStatus: (siteId: string, orderId: string, status: string) =>
    request(`/sites/${siteId}/shop/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ─── Bookings ───────────────────────────────────────────

export const bookings = {
  list: (siteId: string, params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/sites/${siteId}/bookings${q}`);
  },
  updateStatus: (siteId: string, bookingId: string, status: string) =>
    request(`/sites/${siteId}/bookings/${bookingId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getSchedule: (siteId: string) => request(`/sites/${siteId}/bookings/schedule`),
  updateSchedule: (siteId: string, schedule: Record<string, any>) =>
    request(`/sites/${siteId}/bookings/schedule`, { method: 'PUT', body: JSON.stringify(schedule) }),
};

// ─── SEO ────────────────────────────────────────────────

export const seo = {
  updatePageSeo: (siteId: string, pageId: string, data: Record<string, any>) =>
    request(`/sites/${siteId}/seo/pages/${pageId}`, { method: 'PUT', body: JSON.stringify(data) }),
  getRedirects: (siteId: string) => request(`/sites/${siteId}/seo/redirects`),
  createRedirect: (siteId: string, data: Record<string, any>) =>
    request(`/sites/${siteId}/seo/redirects`, { method: 'POST', body: JSON.stringify(data) }),
  deleteRedirect: (siteId: string, redirectId: string) =>
    request(`/sites/${siteId}/seo/redirects/${redirectId}`, { method: 'DELETE' }),
};

// ─── Analytics ──────────────────────────────────────────

export const analytics = {
  getStats: (siteId: string, period?: string) => {
    const q = period ? `?period=${period}` : '';
    return request(`/sites/${siteId}/analytics/stats${q}`);
  },
};

// ─── Pixels ─────────────────────────────────────────────

export const pixels = {
  list: (siteId: string) => request(`/sites/${siteId}/pixels`),
  save: (siteId: string, data: Record<string, any>) =>
    request(`/sites/${siteId}/pixels`, { method: 'POST', body: JSON.stringify(data) }),
  remove: (siteId: string, platform: string) =>
    request(`/sites/${siteId}/pixels/${platform}`, { method: 'DELETE' }),
  getScripts: (siteId: string) => request(`/sites/${siteId}/pixels/scripts`),
  addScript: (siteId: string, data: Record<string, any>) =>
    request(`/sites/${siteId}/pixels/scripts`, { method: 'POST', body: JSON.stringify(data) }),
  removeScript: (siteId: string, scriptId: string) =>
    request(`/sites/${siteId}/pixels/scripts/${scriptId}`, { method: 'DELETE' }),
};

// ─── Partners ───────────────────────────────────────────

export const partners = {
  register: () => request('/partners/register', { method: 'POST' }),
  getDashboard: () => request('/partners/dashboard'),
  requestPayout: (method?: string) =>
    request('/partners/request-payout', { method: 'POST', body: JSON.stringify({ method }) }),
};

// ─── Domains ────────────────────────────────────────────

export const domains = {
  check: (domain: string) => request(`/domains/check/${domain}`),
  connect: (siteId: string, domain: string) =>
    request('/domains/connect', { method: 'POST', body: JSON.stringify({ siteId, domain }) }),
  getStatus: (siteId: string) => request(`/domains/status/${siteId}`),
};

// ─── Media ──────────────────────────────────────────────

export const media = {
  list: (siteId?: string) => {
    const q = siteId ? `?siteId=${siteId}` : '';
    return request(`/media${q}`);
  },
  upload: (file: File, siteId?: string, alt?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (siteId) formData.append('siteId', siteId);
    if (alt) formData.append('alt', alt);
    return request('/media/upload', { method: 'POST', body: formData });
  },
  delete: (id: string) => request(`/media/${id}`, { method: 'DELETE' }),
};

// ─── Export ─────────────────────────────────────────────

export const exitPackage = {
  requestExport: (siteId: string) => request('/export/request', { method: 'POST', body: JSON.stringify({ siteId }) }),
  getStatus: () => request('/export/status'),
  download: (requestId: string) => request(`/export/download/${requestId}`),
  exportContent: (siteId: string) => request(`/export/content/${siteId}`),
};

// ─── Webhooks ───────────────────────────────────────────

export const webhooks = {
  list: (siteId: string) => request(`/sites/${siteId}/webhooks`),
  create: (siteId: string, data: Record<string, any>) =>
    request(`/sites/${siteId}/webhooks`, { method: 'POST', body: JSON.stringify(data) }),
  update: (siteId: string, webhookId: string, data: Record<string, any>) =>
    request(`/sites/${siteId}/webhooks/${webhookId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (siteId: string, webhookId: string) =>
    request(`/sites/${siteId}/webhooks/${webhookId}`, { method: 'DELETE' }),
  test: (siteId: string, webhookId: string) =>
    request(`/sites/${siteId}/webhooks/${webhookId}/test`, { method: 'POST' }),
  getLogs: (siteId: string, webhookId: string) =>
    request(`/sites/${siteId}/webhooks/${webhookId}/logs`),
};
