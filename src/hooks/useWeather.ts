// ============================================================
// NusaWeather — src/hooks/useWeather.ts
// ============================================================
import { useCallback, useEffect, useRef } from 'react';
import { CACHE } from '../constants';
import { weatherService } from '../services/weather/weather.service';
import { useWeatherStore } from '../stores/weather.store';
export const useWeather = () => {
  const {
    data, airQuality, isLoading, isRefreshing, error,
    lastUpdated, activeLat, activeLon, activeCityName,
    setData, setAirQuality, setLoading, setRefreshing,
    setError, setActiveCity,
  } = useWeatherStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetch = useCallback(async (lat: number, lon: number, cityName?: string, force = false) => {
    try {
      if (force) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [wx, aqi] = await Promise.all([
        weatherService.getWeather(lat, lon, force),
        weatherService.getAirQuality(lat, lon),
      ]);
      setData(wx);
      setAirQuality(aqi);
      if (cityName) setActiveCity(lat, lon, cityName);
    } catch (e: any) {
      setError(e.message ?? 'Gagal memuat cuaca');
    }
  }, [setRefreshing, setLoading, setData, setAirQuality, setActiveCity, setError]);
  const refresh = useCallback(() => {
    if (activeLat && activeLon) fetch(activeLat, activeLon, activeCityName ?? undefined, true);
  }, [activeLat, activeLon, activeCityName, fetch]);
  useEffect(() => {
    if (!activeLat || !activeLon) return;
    timerRef.current = setInterval(refresh, CACHE.AUTO_REFRESH);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeLat, activeLon, refresh]);
  return {
    data, airQuality, isLoading, isRefreshing, error, lastUpdated,
    activeLat, activeLon, activeCityName,
    fetch, refresh,
  };
};
