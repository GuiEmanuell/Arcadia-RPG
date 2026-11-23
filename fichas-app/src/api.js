import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Em desenvolvimento, usa o IP do computador que roda o Expo (mesma rede Wi-Fi).
// Para outro endereço: EXPO_PUBLIC_API_URL=http://SEU_IP:3000 npx expo start
function host() {
  const h = Constants.expoConfig?.hostUri?.split(':')[0];
  // Com --tunnel o host é um endereço da internet (exp.direct), onde o backend não existe
  if (h && !/exp\.direct|ngrok|\.dev$/.test(h)) return h;
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}
export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${host()}:3000`;

async function req(path, options) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000); // erro rápido se o servidor não responder
  try {
    const r = await fetch(API_URL + path, { headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal, ...options });
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
