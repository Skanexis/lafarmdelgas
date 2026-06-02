import type { Product } from '../data/products';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787/api').replace(/\/$/, '');
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

export interface SiteSettings {
  logoUrl: string;
  heroMediaUrl: string;
}

export interface ContactSettings {
  whatsappGroupName: string;
  whatsappGroupUrl: string;
  whatsappContactLabel: string;
  whatsappContactUrl: string;
  instagramLabel: string;
  instagramUrl: string;
}

export interface MediaItem {
  name: string;
  originalName?: string;
  url: string;
  mime: string;
  type: 'image' | 'video' | 'file';
  size: number;
  createdAt?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  const method = (options?.method || 'GET').toUpperCase();
  const requestPath = method === 'GET' ? `${path}${path.includes('?') ? '&' : '?'}_=${Date.now()}` : path;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE_URL}${requestPath}`, {
    ...options,
    cache: 'no-store',
    headers,
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;

    try {
      const payload = await response.json();
      if (payload?.error) {
        message = String(payload.error);
      }
    } catch {
      if (response.status === 413) {
        message = 'File troppo grande per il server';
      }
    }

    const error = new Error(message);
    Object.assign(error, { status: response.status });
    throw error;
  }

  return response.json() as Promise<T>;
}

export function fetchProducts() {
  return request<Product[]>('/products');
}

export function fetchProduct(id: string) {
  return request<Product>(`/products/${encodeURIComponent(id)}`);
}

export function fetchCategories() {
  return request<string[]>('/categories');
}

export function fetchSettings() {
  return request<SiteSettings>('/settings');
}

export function fetchContacts() {
  return request<ContactSettings>('/contacts');
}

export function resolveMediaUrl(url?: string) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
}

export function sendContactMessage(payload: { name: string; email: string; message: string }) {
  return request<{ ok: boolean; id: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function adminHeaders(token: string) {
  return {
    'X-Admin-Token': token,
  };
}

export function verifyAdminSession(token: string) {
  return request<{ ok: boolean }>('/admin/session', {
    headers: adminHeaders(token),
  });
}

export function createAdminProduct(token: string, product: Omit<Product, 'id'> & { id?: string }) {
  return request<Product>('/admin/products', {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify(product),
  });
}

export function updateAdminProduct(token: string, id: string, product: Omit<Product, 'id'> & { id?: string }) {
  return request<Product>(`/admin/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: adminHeaders(token),
    body: JSON.stringify(product),
  });
}

export function deleteAdminProduct(token: string, id: string) {
  return request<Product>(`/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: adminHeaders(token),
  });
}

export function fetchAdminMedia(token: string) {
  return request<MediaItem[]>('/admin/media', {
    headers: adminHeaders(token),
  });
}

export function uploadAdminFile(token: string, file: File) {
  const body = new FormData();
  body.append('file', file);

  return request<MediaItem>('/admin/upload', {
    method: 'POST',
    headers: adminHeaders(token),
    body,
  });
}

export function updateAdminSettings(token: string, settings: Partial<SiteSettings>) {
  return request<SiteSettings>('/admin/settings', {
    method: 'PUT',
    headers: adminHeaders(token),
    body: JSON.stringify(settings),
  });
}

export function updateAdminContacts(token: string, contacts: ContactSettings) {
  return request<ContactSettings>('/admin/contacts', {
    method: 'PUT',
    headers: adminHeaders(token),
    body: JSON.stringify(contacts),
  });
}

export function createAdminCategory(token: string, name: string) {
  return request<string>('/admin/categories', {
    method: 'POST',
    headers: adminHeaders(token),
    body: JSON.stringify({ name }),
  });
}

export function updateAdminCategory(token: string, currentName: string, nextName: string) {
  return request<string>(`/admin/categories/${encodeURIComponent(currentName)}`, {
    method: 'PUT',
    headers: adminHeaders(token),
    body: JSON.stringify({ name: nextName }),
  });
}

export function deleteAdminCategory(token: string, name: string) {
  return request<string>(`/admin/categories/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: adminHeaders(token),
  });
}
