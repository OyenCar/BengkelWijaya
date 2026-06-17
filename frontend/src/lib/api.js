// Thin API client. Base URL comes from VITE_API_URL (see .env).
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const API_BASE = BASE;

function authHeaders() {
  const token = localStorage.getItem('bw_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = 'GET', body, auth = false, isForm = false } = {}) {
  const headers = { ...(auth ? authHeaders() : {}) };
  let payload = body;
  if (body && !isForm) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || `Request gagal (${res.status})`);
  return data;
}

// Resolve an image URL that may be relative (uploaded files) or absolute.
export function imageUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//.test(url) || url.startsWith('data:')) return url;
  return `${BASE}${url}`;
}

export const api = {
  // Public
  products: (params = '') => request(`/api/products${params}`),
  categories: () => request('/api/categories'),
  services: () => request('/api/services'),
  portfolio: () => request('/api/portfolio'),
  testimonials: () => request('/api/testimonials'),
  settings: () => request('/api/settings'),
  createInquiry: (body) => request('/api/inquiries', { method: 'POST', body }),
  chat: (messages) => request('/api/chat', { method: 'POST', body: { messages } }),

  // Auth
  login: (username, password) => request('/api/admin/auth/login', { method: 'POST', body: { username, password } }),
  me: () => request('/api/admin/me', { auth: true }),

  // Admin CRUD
  adminList: (resource) => request(`/api/admin/${resource}`, { auth: true }),
  adminCreate: (resource, body) => request(`/api/admin/${resource}`, { method: 'POST', body, auth: true }),
  adminUpdate: (resource, id, body) => request(`/api/admin/${resource}/${id}`, { method: 'PUT', body, auth: true }),
  adminDelete: (resource, id) => request(`/api/admin/${resource}/${id}`, { method: 'DELETE', auth: true }),
  inquiries: (status) => request(`/api/admin/inquiries${status ? `?status=${status}` : ''}`, { auth: true }),
  setInquiryStatus: (id, status) => request(`/api/admin/inquiries/${id}`, { method: 'PATCH', body: { status }, auth: true }),
  deleteInquiry: (id) => request(`/api/admin/inquiries/${id}`, { method: 'DELETE', auth: true }),
  async upload(file) {
    const fd = new FormData();
    fd.append('image', file);
    return request('/api/admin/upload', { method: 'POST', body: fd, auth: true, isForm: true });
  },
};
