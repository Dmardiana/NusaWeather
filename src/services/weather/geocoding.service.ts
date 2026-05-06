// ============================================================
// NusaWeather — src/services/weather/geocoding.service.ts
// ============================================================
import { CACHE } from '../../constants';
import { GeocodingResult } from '../../types';
import { owmApi } from './api';

const geoCache = new Map<string, { data: any; ts: number }>();

const getCached = <T>(key: string, ttl: number): T | null => {
  const entry = geoCache.get(key);
  if (entry && Date.now() - entry.ts < ttl) return entry.data as T;
  geoCache.delete(key);
  return null;
};

export const geocodingService = {
  search: async (query: string): Promise<GeocodingResult[]> => {
    const key = `geo_${query.toLowerCase().trim()}`;
    const cached = getCached<GeocodingResult[]>(key, CACHE.GEO_TTL);
    if (cached) return cached;

    try {
      const raw = await owmApi.geocoding(query) as any[];

      if (!Array.isArray(raw) || raw.length === 0) {
        console.warn('[Geocoding] No results found for:', query);
        return [];
      }

      const results: GeocodingResult[] = raw.map((r) => ({
        name: r.local_names?.id ?? r.name,
        country: r.country,
        state: r.state,
        lat: r.lat,
        lon: r.lon,
        localNames: r.local_names,
      }));

      // ✅ Deduplikasi dengan precision 3 desimal (111m accuracy) + exact name match
      const seen = new Set<string>();
      const unique = results.filter((r) => {
        // More precise dedup key: use 3 decimal places + name
        const dedupKey = `${r.lat.toFixed(3)}_${r.lon.toFixed(3)}_${r.name.toLowerCase()}`;
        if (seen.has(dedupKey)) return false;
        seen.add(dedupKey);
        return true;
      });

      console.log('[Geocoding] Found', unique.length, 'unique results for:', query);
      geoCache.set(key, { data: unique, ts: Date.now() });
      return unique;
    } catch (e: any) {
      console.error('[Geocoding] Search error:', e);
      // ✅ Clear cache jika error
      geoCache.delete(key);
      throw new Error(e.message || 'Gagal mencari kota. Coba lagi.');
    }
  },

  reverse: async (lat: number, lon: number): Promise<GeocodingResult | null> => {
    const key = `rgeo_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    const cached = getCached<GeocodingResult>(key, CACHE.GEO_TTL);
    if (cached) return cached;

    try {
      const raw = await owmApi.reverseGeo(lat, lon) as any[];
      if (!Array.isArray(raw) || !raw.length) {
        console.warn('[Geocoding] No reverse geo result for:', { lat, lon });
        return null;
      }

      const r = raw[0];
      const result: GeocodingResult = {
        name: r.local_names?.id ?? r.name,
        country: r.country,
        state: r.state,
        lat: r.lat,
        lon: r.lon,
      };

      geoCache.set(key, { data: result, ts: Date.now() });
      return result;
    } catch (e: any) {
      console.error('[Geocoding] Reverse geo error:', e);
      // ✅ Clear cache jika error
      geoCache.delete(key);
      return null;
    }
  },

  getIconUrl: (icon: string, size: '2x' | '4x' = '2x') =>
    `https://openweathermap.org/img/wn/${icon}@${size}.png`,
};