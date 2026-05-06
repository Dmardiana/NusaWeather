// ============================================================
// NusaWeather — src/stores/weather.store.ts
// ============================================================
import { create } from 'zustand';
import { AirQuality, OneCallWeather, WeatherStore } from '../types';
interface WeatherStoreActions {
  setData: (data: OneCallWeather) => void;
  setAirQuality: (aq: AirQuality) => void;
  setLoading: (v: boolean) => void;
  setRefreshing: (v: boolean) => void;
  setError: (e: string | null) => void;
  setActiveCity: (lat: number, lon: number, name: string) => void;
  reset: () => void;
}
export const useWeatherStore = create<WeatherStore & WeatherStoreActions>((set) => ({
  data: null,
  airQuality: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastUpdated: null,
  activeLat: null,
  activeLon: null,
  activeCityName: null,
  setData: (data) =>
    set({ data, isLoading: false, isRefreshing: false, error: null, lastUpdated: Date.now() }),
  setAirQuality: (airQuality) => set({ airQuality }),
  setLoading: (isLoading) => set({ isLoading }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  setError: (error) => set({ error, isLoading: false, isRefreshing: false }),
  setActiveCity: (activeLat, activeLon, activeCityName) =>
    set({ activeLat, activeLon, activeCityName }),
  reset: () =>
    set({
      data: null, airQuality: null, isLoading: false,
      isRefreshing: false, error: null, lastUpdated: null,
      activeLat: null, activeLon: null, activeCityName: null,
    }),
}));
