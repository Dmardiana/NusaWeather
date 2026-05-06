// ============================================================
// NusaWeather — src/utils/unit.utils.ts
// ============================================================
import { PressureUnit, TempUnit, WindUnit } from '../types';
export const convertTemp = (c: number, unit: TempUnit): number =>
  unit === 'fahrenheit' ? (c * 9) / 5 + 32 : c;
export const formatTemp = (c: number, unit: TempUnit): string =>
  `${Math.round(convertTemp(c, unit))}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
export const convertWind = (ms: number, unit: WindUnit): number => {
  if (unit === 'kmh') return ms * 3.6;
  if (unit === 'mph') return ms * 2.237;
  return ms;
};
export const formatWind = (ms: number, unit: WindUnit): string => {
  const labels = { ms: 'm/s', kmh: 'km/h', mph: 'mph' };
  return `${convertWind(ms, unit).toFixed(1)} ${labels[unit]}`;
};
export const convertPressure = (hpa: number, unit: PressureUnit): string => {
  if (unit === 'inhg') return `${(hpa * 0.02953).toFixed(2)} inHg`;
  if (unit === 'mmhg') return `${Math.round(hpa * 0.75006)} mmHg`;
  return `${hpa} hPa`;
};
export const formatVisibility = (m: number): string =>
  m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;
export const formatHumidity = (h: number): string => `${h}%`;
export const formatPop = (pop: number): string => `${Math.round(pop * 100)}%`;
