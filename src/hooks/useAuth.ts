// ============================================================
// NusaWeather — src/hooks/useAuth.ts
// ============================================================
import { useCallback, useEffect } from 'react';
import { authService } from '../services/firebase/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useCitiesStore } from '../stores/cities.store';
import { useWeatherStore } from '../stores/weather.store';
import { LoginPayload, RegisterPayload } from '../types';

export const useAuth = () => {
  const {
    user,
    isLoading,
    isInitialized,
    error,
    setUser,
    setLoading,
    setInitialized,
    setError,
    reset,
  } = useAuthStore();
  const resetCities = useCitiesStore((s) => s.reset);
  const resetWeather = useWeatherStore((s) => s.reset);

  useEffect(() => {
    const unsub = authService.onAuthChange((u) => {
      setUser(u);
      setInitialized(true);
    });
    return unsub;
  }, [setUser, setInitialized]);

  const login = useCallback(async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const user = await authService.login(payload);
      setUser(user);
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  }, [setLoading, setUser, setError]);

  const register = useCallback(async (payload: RegisterPayload) => {
    setLoading(true);
    try {
      const user = await authService.register(payload);
      setUser(user);
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  }, [setLoading, setUser, setError]);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
      resetCities();
      resetWeather();
      reset();
    } catch (e: any) {
      const errorMsg = e?.message || 'Gagal logout.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [reset, resetCities, resetWeather, setError, setLoading]);

  // ✅ BARU: Update display name with proper error handling
  const updateDisplayName = useCallback(async (displayName: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.updateDisplayName(displayName);
      // ✅ update local store langsung dengan user yang sudah updated
      setUser(updatedUser);
      return updatedUser;
    } catch (e: any) {
      const errorMsg = e.message || 'Gagal update profil.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser, setError]);

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  return {
    user,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    logout,
    updateDisplayName, // ✅ export
    resetPassword,
  };
};