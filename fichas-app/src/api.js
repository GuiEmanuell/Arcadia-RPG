export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://arcadia-rpg.onrender.com';

async function req(path, options) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60000); // 60s para aguardar o arranque do Render
  try {
    const r = await fetch(API_URL + path, {
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      ...options,
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.status === 204 ? null : r.json();
  } finally {
    clearTimeout(t);
  }
}

export const api = {
  list: () => req('/fichas'),
  create: (f) => req('/fichas', { method: 'POST', body: JSON.stringify(f) }),
  update: (id, f) => req('/fichas/' + id, { method: 'PUT', body: JSON.stringify(f) }),
  remove: (id) => req('/fichas/' + id, { method: 'DELETE' }),
};