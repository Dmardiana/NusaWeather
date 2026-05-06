// ============================================================
// NusaWeather — src/stores/auth.store.ts
// ============================================================
import { create } from 'zustand';
import { AuthStore, User } from '../types';

interface AuthStoreActions {
  setUser: (user: User | null) => void;
  setLoading: (v: boolean) => void;
  setInitialized: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore & AuthStoreActions>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  setUser: (user) => set({ user, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setError: (error) => set({ error, isLoading: false }),
  // ✅ FIX LOGOUT: isInitialized tetap true supaya tidak stuck
  reset: () => set({ user: null, isLoading: false, isInitialized: true, error: null }),
}));