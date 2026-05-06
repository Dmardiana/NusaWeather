// ============================================================
// NusaWeather — src/stores/cities.store.ts
// ============================================================
import { create } from 'zustand';
import { CitiesStore, City } from '../types';
interface CitiesStoreActions {
  setCities: (cities: City[]) => void;
  addCity: (city: City) => void;
  removeCity: (id: string) => void;
  updateCity: (id: string, updates: Partial<City>) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}
export const useCitiesStore = create<CitiesStore & CitiesStoreActions>((set) => ({
  cities: [],
  isLoading: false,
  error: null,
  setCities: (cities) => set({ cities, isLoading: false, error: null }),
  addCity: (city) => set((s) => ({ cities: [...s.cities, city] })),
  removeCity: (id) => set((s) => ({ cities: s.cities.filter((c) => c.id !== id) })),
  updateCity: (id, updates) =>
    set((s) => ({
      cities: s.cities.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ cities: [], isLoading: false, error: null }),
}));
