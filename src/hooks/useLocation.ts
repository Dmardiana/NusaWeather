// ============================================================
// NusaWeather — src/hooks/useLocation.ts
// ============================================================
import * as Location from 'expo-location';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { geocodingService } from '../services/weather/geocoding.service';
import { Coords } from '../types';

export const useLocation = () => {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let latitude: number;
      let longitude: number;

      if (Platform.OS === 'web') {
        // Pakai browser native geolocation API
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: false,
          })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Izin lokasi ditolak.');
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }

      const c: Coords = { latitude, longitude };
      setCoords(c);
      const geo = await geocodingService.reverse(latitude, longitude);
      setCityName(geo?.name ?? 'Lokasi Saat Ini');
    } catch (e: any) {
      // Fallback ke Jakarta kalau lokasi gagal
      console.warn('Lokasi gagal, fallback ke Jakarta:', e.message);
      setCoords({ latitude: -6.2088, longitude: 106.8456 });
      setCityName('Jakarta');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { coords, cityName, isLoading, error, request };
};
