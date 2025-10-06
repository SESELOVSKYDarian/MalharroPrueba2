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
  const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;

  const headers = {
    ...(options.headers || {}),
  };

  // Si hay JWT de usuario, lo priorizamos; si no, token de API (opcional)
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  else if (apiToken) headers.Authorization = `Bearer ${apiToken}`;

  const res = await fetch(`${base}${path}`, { ...options, headers });
  if (!res.ok) {
    // Intentamos error detallado
    let msg = `HTTP ${res.status}`;
    try { msg += ': ' + (await res.text()); } catch {}
    throw new Error(msg);
  }
  return res.json();
}
