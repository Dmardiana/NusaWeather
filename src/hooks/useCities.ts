// ============================================================
// NusaWeather — src/hooks/useCities.ts
// ============================================================
import { useCallback, useEffect } from 'react';
import { firestoreService } from '../services/firebase/firestore.service';
import { useAuthStore } from '../stores/auth.store';
import { useCitiesStore } from '../stores/cities.store';
import { CityInput } from '../types';

export const useCities = () => {
  const { user } = useAuthStore();
  const {
    cities,
    isLoading,
    error,
    setCities,
    addCity,
    removeCity,
    updateCity,
    setLoading,
    setError,
  } = useCitiesStore();

  useEffect(() => {
    if (!user?.uid) {
      setCities([]);
      return;
    }

    setLoading(true);

    // ✅ Pakai callback style sesuai firestore.service.ts yang baru
    const unsubscribe = firestoreService.getCities(user.uid, (data) => {
      setCities(data);
      setLoading(false);
    });

    // ✅ Cleanup otomatis saat logout / unmount
    return () => unsubscribe();

  }, [user?.uid, setCities, setLoading]);

  const add = useCallback(async (input: CityInput) => {
    if (!user?.uid) throw new Error('Silakan login untuk menyimpan kota.');
    try {
      setLoading(true);
      const city = await firestoreService.addCity(user.uid, input);
      addCity(city);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, addCity, setLoading, setError]);

  const remove = useCallback(async (cityId: string) => {
    try {
      // ✅ Hapus di Firestore DULU sebelum UI (prevent duplicate if network slow)
      await firestoreService.deleteCity(cityId);
      // ✅ Baru hapus di UI jika Firestore berhasil
      removeCity(cityId);
      console.log('[Cities] Delete success:', cityId);
    } catch (e: any) {
      console.error('[Cities] Delete failed:', e);
      const errorMsg = e.message || 'Gagal menghapus kota.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [removeCity, setError]);

  const update = useCallback(async (cityId: string, newName: string) => {
    try {
      // ✅ Update Firestore DULU sebelum UI
      await firestoreService.updateCity(cityId, { name: newName });
      // ✅ Baru update UI jika Firestore berhasil
      updateCity(cityId, { name: newName });
      console.log('[Cities] Update success:', cityId);
    } catch (e: any) {
      console.error('[Cities] Update failed:', e);
      const errorMsg = e.message || 'Gagal mengubah nama kota.';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [updateCity, setError]);

  const setDefault = useCallback(async (cityId: string) => {
    if (!user?.uid) return;
    try {
      await firestoreService.setDefaultCity(user.uid, cityId);
      const updated = await firestoreService.getCitiesOnce(user.uid);
      setCities(updated);
    } catch (e: any) {
      setError(e.message);
    }
  }, [user?.uid, setCities, setError]);

  return {
    cities,
    isLoading,
    error,
    add,
    remove,
    update,
    setDefault,
    isGuest: !user?.uid,
  };
};