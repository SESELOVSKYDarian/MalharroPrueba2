// src/app/lib/api.js
export function toAbsoluteURL(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || '';
  return `${base}${path}`;
}

export async function apiFetch(path, options = {}) {
  const base = process.env.NEXT_PUBLIC_API_URL || '';
  const jwt = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;

  const headers = {
    ...(options.headers || {}),
  };

  if (jwt) headers.Authorization = `Bearer ${jwt}`;

  const res = await fetch(`${base}${path}`, { ...options, headers });
  if (!res.ok) {
    // Intentamos error detallado
    let msg = `HTTP ${res.status}`;
    try { msg += ': ' + (await res.text()); } catch {}
    throw new Error(msg);
  }
  return res.json();
}
