// ============================================================
// NusaWeather — src/constants/index.ts
// ============================================================

import { ThemeColors } from '../types';

// ─── App Identity ─────────────────────────────────────────────
export const APP = {
  NAME: 'NusaWeather',
  TAGLINE: 'Cuaca Nusantara di Genggamanmu',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.nusaweather.app',
} as const;

// ─── Colors ───────────────────────────────────────────────────
export const LightColors: ThemeColors = {
  primary: '#2196F3',
  primaryLight: '#64B5F6',
  primaryDark: '#1565C0',
  background: '#F0F8FF',
  surface: '#FFFFFF',
  surfaceVariant: '#E3F2FD',
  text: '#0D1B2A',
  textSecondary: '#546E7A',
  textMuted: '#90A4AE',
  border: '#BBDEFB',
  error: '#EF5350',
  success: '#26A69A',
  warning: '#FFA726',
  card: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabBarInactive: '#90A4AE',
  statusBar: 'dark-content',
};

export const DarkColors: ThemeColors = {
  primary: '#64B5F6',
  primaryLight: '#90CAF9',
  primaryDark: '#2196F3',
  background: '#0A1628',
  surface: '#0F2137',
  surfaceVariant: '#162A3E',
  text: '#E8F4FD',
  textSecondary: '#90A4AE',
  textMuted: '#546E7A',
  border: '#1E3A5F',
  error: '#EF9A9A',
  success: '#80CBC4',
  warning: '#FFCC02',
  card: '#0F2137',
  tabBar: '#0F2137',
  tabBarInactive: '#546E7A',
  statusBar: 'light-content',
};

// ─── Weather Gradient Map ─────────────────────────────────────
export const WeatherGradients = {
  clear_day: ['#56CCF2', '#2F80ED'],
  clear_night: ['#0F2137', '#1A3A5C'],
  cloudy: ['#636FA4', '#E8CBC0'],
  rain: ['#373B44', '#4286F4'],
  thunderstorm: ['#141E30', '#243B55'],
  snow: ['#E0EAFC', '#CFDEF3'],
  mist: ['#606C88', '#3F4C6B'],
  morning: ['#FCCB90', '#D57EEB'],
  afternoon: ['#2196F3', '#1565C0'],
  evening: ['#F7971E', '#FFD200'],
  night: ['#0A1628', '#1A3A5C'],
} as const;

// ─── AQI Config ───────────────────────────────────────────────
export const AQI_CONFIG = {
  1: { label: 'Baik', color: '#26A69A', icon: '😊' },
  2: { label: 'Sedang', color: '#66BB6A', icon: '🙂' },
  3: { label: 'Tidak Sehat (Sensitif)', color: '#FFA726', icon: '😐' },
  4: { label: 'Tidak Sehat', color: '#EF5350', icon: '😷' },
  5: { label: 'Sangat Berbahaya', color: '#AB47BC', icon: '🤢' },
} as const;

// ─── API ─────────────────────────────────────────────────────
export const API = {
  OWM_BASE: 'https://api.openweathermap.org',
  OWM_ONECALL: '/data/3.0/onecall',
  OWM_CURRENT: '/data/2.5/weather',
  OWM_FORECAST: '/data/2.5/forecast',
  OWM_GEO: '/geo/1.0/direct',
  OWM_REVERSE_GEO: '/geo/1.0/reverse',
  OWM_AIR: '/data/2.5/air_pollution',
  OWM_ICON: 'https://openweathermap.org/img/wn',
  UNITS: 'metric',
  LANG: 'id',
  GEO_LIMIT: 5,
} as const;

// ─── Cache ────────────────────────────────────────────────────
export const CACHE = {
  WEATHER_TTL: 10 * 60 * 1000,      // 10 menit
  AIR_TTL: 30 * 60 * 1000,          // 30 menit
  GEO_TTL: 24 * 60 * 60 * 1000,     // 24 jam
  AUTO_REFRESH: 15 * 60 * 1000,     // 15 menit
} as const;

// ─── Limits ──────────────────────────────────────────────────
export const LIMITS = {
  MAX_CITIES: 10,
  MIN_PASSWORD: 6,
  MAX_NAME: 50,
  GEO_RESULTS: 5,
  LOCATION_TIMEOUT: 15000,
} as const;

// ─── Firestore Collections ────────────────────────────────────
export const COLLECTIONS = {
  USERS: 'users',
  CITIES: 'cities',
} as const;

// ─── Default Cities ───────────────────────────────────────────
export const DEFAULT_CITIES = [
  { name: 'Jakarta', country: 'ID', state: 'DKI Jakarta', lat: -6.2088, lon: 106.8456 },
  { name: 'Surabaya', country: 'ID', state: 'Jawa Timur', lat: -7.2575, lon: 112.7521 },
  { name: 'Bandung', country: 'ID', state: 'Jawa Barat', lat: -6.9175, lon: 107.6191 },
  { name: 'Medan', country: 'ID', state: 'Sumatera Utara', lat: 3.5952, lon: 98.6722 },
  { name: 'Semarang', country: 'ID', state: 'Jawa Tengah', lat: -6.9932, lon: 110.4203 },
  { name: 'Makassar', country: 'ID', state: 'Sulawesi Selatan', lat: -5.1477, lon: 119.4327 },
  { name: 'Yogyakarta', country: 'ID', state: 'DI Yogyakarta', lat: -7.7956, lon: 110.3695 },
  { name: 'Denpasar', country: 'ID', state: 'Bali', lat: -8.6500, lon: 115.2167 },
  { name: 'Palembang', country: 'ID', state: 'Sumatera Selatan', lat: -2.9761, lon: 104.7754 },
  { name: 'Manado', country: 'ID', state: 'Sulawesi Utara', lat: 1.4748, lon: 124.8421 },
] as const;

// ─── Strings ─────────────────────────────────────────────────
export const STR = {
  LOGIN: 'Masuk',
  REGISTER: 'Daftar',
  LOGOUT: 'Keluar',
  FORGOT_PW: 'Lupa Kata Sandi?',
  EMAIL: 'Email',
  PASSWORD: 'Kata Sandi',
  CONFIRM_PW: 'Konfirmasi Kata Sandi',
  DISPLAY_NAME: 'Nama Lengkap',
  SAVE: 'Simpan',
  CANCEL: 'Batal',
  DELETE: 'Hapus',
  RETRY: 'Coba Lagi',
  LOADING: 'Memuat...',
  SEARCH_CITY: 'Cari kota...',
  ADD_CITY: 'Tambah Kota',
  SAVED_CITIES: 'Kota Tersimpan',
  NO_CITIES: 'Belum ada kota tersimpan',
  SETTINGS: 'Pengaturan',
  DARK_MODE: 'Mode Gelap',
  UNIT_TEMP: 'Satuan Suhu',
  FEELS_LIKE: 'Terasa Seperti',
  HUMIDITY: 'Kelembaban',
  WIND: 'Angin',
  PRESSURE: 'Tekanan',
  VISIBILITY: 'Jarak Pandang',
  UV_INDEX: 'Indeks UV',
  SUNRISE: 'Matahari Terbit',
  SUNSET: 'Matahari Terbenam',
  HOURLY: 'Per Jam',
  DAILY: '7 Hari',
  AIR_QUALITY: 'Kualitas Udara',
  ALERTS: 'Peringatan Cuaca',
  ERR_GENERIC: 'Terjadi kesalahan. Coba lagi.',
  ERR_NETWORK: 'Tidak ada koneksi internet.',
  ERR_LOCATION: 'Gagal mendapatkan lokasi.',
  ERR_WEATHER: 'Gagal memuat data cuaca.',
  ERR_EMAIL_USED: 'Email sudah terdaftar.',
  ERR_WRONG_PW: 'Email atau password salah.',
  ERR_WEAK_PW: 'Password minimal 6 karakter.',
  ERR_INVALID_EMAIL: 'Format email tidak valid.',
  ERR_MAX_CITIES: `Maksimal ${LIMITS.MAX_CITIES} kota tersimpan.`,
  ERR_CITY_EXISTS: 'Kota ini sudah tersimpan.',
} as const;