// ============================================================
// NusaWeather — src/types/index.ts
// ============================================================

// ─── Auth ────────────────────────────────────────────────────
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

// ─── City ────────────────────────────────────────────────────
export interface City {
  id: string;
  userId: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  isDefault: boolean;
  order: number;
  addedAt: number;
}

export interface CityInput {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface GeocodingResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  localNames?: Record<string, string>;
}

// ─── Weather ─────────────────────────────────────────────────
export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
}

export interface HourlyWeather {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  pop: number;
}

export interface DailyTemp {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
}

export interface DailyFeelsLike {
  day: number;
  night: number;
  eve: number;
  morn: number;
}

export interface DailyWeather {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  summary: string;
  temp: DailyTemp;
  feels_like: DailyFeelsLike;
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  clouds: number;
  pop: number;
  rain?: number;
  snow?: number;
  uvi: number;
}

export interface WeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

export interface OneCallWeather {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  alerts?: WeatherAlert[];
}

// ─── Air Quality ─────────────────────────────────────────────
export interface AirComponents {
  co: number;
  no: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  nh3: number;
}

export interface AirQuality {
  aqi: 1 | 2 | 3 | 4 | 5;
  components: AirComponents;
  dt: number;
}

// ─── Theme & Units ───────────────────────────────────────────
export type ThemeMode = 'light' | 'dark' | 'system';
export type TempUnit = 'celsius' | 'fahrenheit';
export type WindUnit = 'ms' | 'kmh' | 'mph';
export type PressureUnit = 'hpa' | 'inhg' | 'mmhg';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  card: string;
  tabBar: string;
  tabBarInactive: string;
  statusBar: 'light-content' | 'dark-content';
}

// ─── Location ────────────────────────────────────────────────
export interface Coords {
  latitude: number;
  longitude: number;
}

// ─── Store Slices ────────────────────────────────────────────
export interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface WeatherStore {
  data: OneCallWeather | null;
  airQuality: AirQuality | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: number | null;
  activeLat: number | null;
  activeLon: number | null;
  activeCityName: string | null;
}

export interface CitiesStore {
  cities: City[];
  isLoading: boolean;
  error: string | null;
}