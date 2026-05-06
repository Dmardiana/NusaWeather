import { CACHE } from '../../constants';
import {
    AirComponents, AirQuality, CurrentWeather,
    DailyWeather, HourlyWeather, OneCallWeather,
} from '../../types';
import { owmApi } from './api';

const cache = new Map<string, { data: any; ts: number }>();

const getCached = <T>(key: string, ttl: number): T | null => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < ttl) return entry.data as T;
  cache.delete(key);
  return null;
};

const setCache = (key: string, data: any) => cache.set(key, { data, ts: Date.now() });

// Konversi response 2.5 forecast (3-jam) → format HourlyWeather
const mapHourly = (list: any[]): HourlyWeather[] =>
  list.slice(0, 24).map((h) => ({
    dt: h.dt,
    temp: h.main.temp,
    feels_like: h.main.feels_like,
    pressure: h.main.pressure,
    humidity: h.main.humidity,
    dew_point: 0, // tidak tersedia di 2.5
    uvi: 0,       // tidak tersedia di 2.5
    clouds: h.clouds.all,
    visibility: h.visibility ?? 10000,
    wind_speed: h.wind.speed,
    wind_deg: h.wind.deg,
    wind_gust: h.wind.gust,
    weather: h.weather,
    pop: h.pop ?? 0,
  }));

// Konversi forecast 3-jam → format DailyWeather (grouping per hari)
const mapDaily = (list: any[]): DailyWeather[] => {
  const byDay: Record<string, any[]> = {};
  list.forEach((h) => {
    const day = new Date(h.dt * 1000).toISOString().split('T')[0];
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(h);
  });

  return Object.entries(byDay).slice(0, 7).map(([, items]) => {
    const temps = items.map((i) => i.main.temp);
    const mid = items[Math.floor(items.length / 2)];
    return {
      dt: mid.dt,
      sunrise: 0,
      sunset: 0,
      moonrise: 0,
      moonset: 0,
      moon_phase: 0,
      summary: mid.weather[0].description,
      temp: {
        day: mid.main.temp,
        min: Math.min(...temps),
        max: Math.max(...temps),
        night: items[items.length - 1].main.temp,
        eve: items[Math.floor(items.length * 0.75)].main.temp,
        morn: items[0].main.temp,
      },
      feels_like: {
        day: mid.main.feels_like,
        night: items[items.length - 1].main.feels_like,
        eve: items[Math.floor(items.length * 0.75)].main.feels_like,
        morn: items[0].main.feels_like,
      },
      pressure: mid.main.pressure,
      humidity: mid.main.humidity,
      dew_point: 0,
      wind_speed: mid.wind.speed,
      wind_deg: mid.wind.deg,
      wind_gust: mid.wind.gust,
      weather: mid.weather,
      clouds: mid.clouds.all,
      pop: Math.max(...items.map((i) => i.pop ?? 0)),
      uvi: 0,
    };
  });
};

export const weatherService = {
  getWeather: async (lat: number, lon: number, force = false): Promise<OneCallWeather> => {
    const key = `wx_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    if (!force) {
      const cached = getCached<OneCallWeather>(key, CACHE.WEATHER_TTL);
      if (cached) return cached;
    }

    // Panggil 2 API sekaligus
    const [current, forecastRaw] = await Promise.all([
      owmApi.currentWeather(lat, lon) as Promise<any>,
      owmApi.forecast(lat, lon) as Promise<any>,
    ]);

    const currentWeather: CurrentWeather = {
      dt: current.dt,
      sunrise: current.sys.sunrise,
      sunset: current.sys.sunset,
      temp: current.main.temp,
      feels_like: current.main.feels_like,
      pressure: current.main.pressure,
      humidity: current.main.humidity,
      dew_point: 0,
      uvi: 0,
      clouds: current.clouds.all,
      visibility: current.visibility ?? 10000,
      wind_speed: current.wind.speed,
      wind_deg: current.wind.deg,
      wind_gust: current.wind.gust,
      weather: current.weather,
    };

    const data: OneCallWeather = {
      lat,
      lon,
      timezone: current.timezone ?? 'Asia/Jakarta',
      timezone_offset: 0,
      current: currentWeather,
      hourly: mapHourly(forecastRaw.list),
      daily: mapDaily(forecastRaw.list),
    };

    setCache(key, data);
    return data;
  },

  getAirQuality: async (lat: number, lon: number): Promise<AirQuality> => {
    const key = `aqi_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    const cached = getCached<AirQuality>(key, CACHE.AIR_TTL);
    if (cached) return cached;
    const raw = await owmApi.airPollution(lat, lon) as any;
    const item = raw.list[0];
    const data: AirQuality = {
      aqi: item.main.aqi,
      components: item.components as AirComponents,
      dt: item.dt,
    };
    setCache(key, data);
    return data;
  },

  clearCache: () => cache.clear(),
};