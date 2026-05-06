import { API } from '../../constants';

const KEY = process.env.EXPO_PUBLIC_OWM_API_KEY;

if (!KEY) {
  console.error('❌ EXPO_PUBLIC_OWM_API_KEY tidak ditemukan di .env');
}

const call = async <T>(endpoint: string, params: Record<string, string>): Promise<T> => {
  if (!KEY) throw new Error('API key tidak ditemukan. Cek file .env kamu.');
  const qs = new URLSearchParams({ ...params, appid: KEY, lang: API.LANG }).toString();
  const url = `${API.OWM_BASE}${endpoint}?${qs}`;
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 15000); // ✅ Increased to 15s
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const errorMsg = err.message ?? `HTTP ${res.status}`;
      console.error('[API] Error response:', { status: res.status, message: errorMsg, endpoint });
      throw new Error(errorMsg);
    }
    const data = await res.json();
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.warn('[API] Empty response from:', endpoint);
    }
    return data;
  } catch (e: any) {
    if (e.name === 'AbortError') {
      console.error('[API] Request timeout for:', endpoint);
      throw new Error('Permintaan timeout. Cek koneksi internetmu.');
    }
    console.error('[API] Fetch error:', { endpoint, message: e.message });
    throw e;
  } finally {
    clearTimeout(timeout);
  }
};

export const owmApi = {
  // 2.5 current weather
  currentWeather: (lat: number, lon: number) =>
    call(API.OWM_CURRENT, {
      lat: String(lat), lon: String(lon), units: API.UNITS,
    }),
  // 2.5 forecast (5 hari / per 3 jam)
  forecast: (lat: number, lon: number) =>
    call(API.OWM_FORECAST, {
      lat: String(lat), lon: String(lon), units: API.UNITS, cnt: '40',
    }),
  // air quality tetap sama
  airPollution: (lat: number, lon: number) =>
    call(API.OWM_AIR, { lat: String(lat), lon: String(lon) }),
  geocoding: (q: string) =>
    call(API.OWM_GEO, { q, limit: String(API.GEO_LIMIT) }),
  reverseGeo: (lat: number, lon: number) =>
    call(API.OWM_REVERSE_GEO, { lat: String(lat), lon: String(lon), limit: '1' }),
};