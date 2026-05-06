// ============================================================
// NusaWeather — app/(tabs)/index.tsx (Home Screen)
// ============================================================
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ErrorMessage } from '../../src/components/common/ErrorMessage';
import { GradientBackground } from '../../src/components/common/GradientBackground';
import { LoadingSpinner } from '../../src/components/common/LoadingSpinner';
import { SearchBar } from '../../src/components/common/SearchBar';
import { AirQualityCard } from '../../src/components/weather/AirQualityCard';
import { DailyForecast } from '../../src/components/weather/DailyForecast';
import { SunriseSunsetCard } from '../../src/components/weather/SunriseSunsetCard';
import { TemperatureChart } from '../../src/components/weather/TemperatureChart';
import { WeatherAlertBanner } from '../../src/components/weather/WeatherAlertBanner';
import { WeatherAnimation } from '../../src/components/weather/WeatherAnimation';
import { WeatherDetailRow } from '../../src/components/weather/WeatherDetailRow';
import { CitiesCarousel } from '../../src/components/cities/CitiesCarousel';
import { useCities } from '../../src/hooks/useCities';
import { WeatherShareButton } from '../../src/components/weather/WeatherShareCard';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useUnits } from '../../src/contexts/UnitsContext';
import { useLocation } from '../../src/hooks/useLocation';
import { useWeather } from '../../src/hooks/useWeather';
import { geocodingService } from '../../src/services/weather/geocoding.service';
import { GeocodingResult } from '../../src/types';
import { convertPressure, formatHumidity, formatTemp, formatVisibility, formatWind } from '../../src/utils/unit.utils';
import { getUVLevel, getWeatherGradient, getWindDir } from '../../src/utils/weather.utils';

// ─── Realtime Clock ───────────────────────────────────────────
const useRealtimeClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
};

const formatClock = (date: Date): string => {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getGreeting = (date: Date): string => {
  const h = date.getHours();
  if (h >= 4 && h < 11) return 'Selamat Pagi ☀️';
  if (h >= 11 && h < 15) return 'Selamat Siang 🌤️';
  if (h >= 15 && h < 18) return 'Selamat Sore 🌅';
  return 'Selamat Malam 🌙';
};

// ─── Search Modal ─────────────────────────────────────────────
interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (result: GeocodingResult) => void;
  colors: any;
}

const SearchModal: React.FC<SearchModalProps> = ({ visible, onClose, onSelect, colors }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const data = await geocodingService.search(query.trim());
      setResults(data);
      setSearched(true);
      if (!data.length) setError('Kota tidak ditemukan.');
    } catch {
      setError('Gagal mencari kota.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setSearched(false);
    onClose();
  };

  const handleSelect = (item: GeocodingResult) => {
    onSelect(item);
    handleClose();
  };

  const getFlagEmoji = (code: string) => {
    if (!code) return '🌍';
    return code.toUpperCase().split('').map(
      (c) => String.fromCodePoint(0x1f1e0 + c.charCodeAt(0) - 65)
    ).join('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={searchStyles.overlay}>
        <View style={[searchStyles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[searchStyles.handle, { backgroundColor: colors.border }]} />
          <Text style={[searchStyles.title, { color: colors.text }]}>🔍 Cari Kota</Text>
          <Text style={[searchStyles.subtitle, { color: colors.textSecondary }]}>
            Ketik nama kota untuk melihat cuacanya
          </Text>
          <SearchBar
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              if (!t.trim()) { setResults([]); setSearched(false); setError(null); }
            }}
            onSubmit={search}
            placeholder="Contoh: Jakarta, Bandung, Surabaya..."
          />
          {loading && (
            <View style={searchStyles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[searchStyles.loadingText, { color: colors.textSecondary }]}>Mencari...</Text>
            </View>
          )}
          {error && !loading && (
            <View style={[searchStyles.errorBox, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[searchStyles.errorText, { color: colors.error }]}>⚠️ {error}</Text>
            </View>
          )}
          {!loading && !searched && !error && (
            <Text style={[searchStyles.hint, { color: colors.textMuted }]}>
              💡 Ketik nama kota lalu tekan enter
            </Text>
          )}
          {searched && results.length > 0 && (
            <Text style={[searchStyles.count, { color: colors.textSecondary }]}>
              {results.length} hasil — pilih yang paling tepat
            </Text>
          )}
          <FlatList
            data={results}
            keyExtractor={(item, i) => `${item.lat}_${item.lon}_${i}`}
            style={searchStyles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  searchStyles.resultItem,
                  {
                    backgroundColor: index % 2 === 0 ? colors.surface : colors.surfaceVariant,
                    borderLeftColor: item.country === 'ID' ? colors.primary : colors.textMuted,
                  },
                ]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <View style={searchStyles.resultLeft}>
                  <Text style={searchStyles.flag}>{getFlagEmoji(item.country)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[searchStyles.resultName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[searchStyles.resultState, { color: colors.textSecondary }]}>
                      {[item.state, item.country].filter(Boolean).join(', ')}
                    </Text>
                    <Text style={[searchStyles.resultCoords, { color: colors.textMuted }]}>
                      📍 {Math.abs(item.lat).toFixed(2)}°{item.lat >= 0 ? 'N' : 'S'},{' '}
                      {Math.abs(item.lon).toFixed(2)}°{item.lon >= 0 ? 'E' : 'W'}
                    </Text>
                  </View>
                </View>
                <Text style={[searchStyles.arrow, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={[searchStyles.closeBtn, { borderColor: colors.border }]}
            onPress={handleClose}
          >
            <Text style={[searchStyles.closeTxt, { color: colors.textSecondary }]}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const searchStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '90%' },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  loadingText: { fontSize: 14 },
  errorBox: { marginTop: 12, padding: 12, borderRadius: 10, alignItems: 'center' },
  errorText: { fontSize: 14, textAlign: 'center' },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 20 },
  count: { fontSize: 12, marginTop: 12, marginBottom: 4 },
  list: { marginTop: 4, maxHeight: 400 },
  resultItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 12, borderLeftWidth: 3, borderRadius: 4, marginBottom: 2 },
  resultLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  flag: { fontSize: 26 },
  resultName: { fontSize: 16, fontWeight: '700' },
  resultState: { fontSize: 13, marginTop: 2 },
  resultCoords: { fontSize: 11, marginTop: 2 },
  arrow: { fontSize: 22, marginLeft: 8 },
  closeBtn: { marginTop: 12, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  closeTxt: { fontSize: 15, fontWeight: '600' },
});

// ─── Home Screen ──────────────────────────────────────────────
export default function HomeScreen() {
  const { colors } = useTheme();
  const { tempUnit, windUnit, pressureUnit } = useUnits();
  const { data, airQuality, isLoading, isRefreshing, error, activeCityName, fetch, refresh } = useWeather();
  const { coords, cityName, request } = useLocation();
  const { cities } = useCities();
  const now = useRealtimeClock();
  const [searchVisible, setSearchVisible] = useState(false);

  useEffect(() => { request(); }, [request]);

  useEffect(() => {
    if (coords && cityName) fetch(coords.latitude, coords.longitude, cityName);
  }, [coords, cityName, fetch]);

  const handleSearchSelect = (result: GeocodingResult) => {
    fetch(result.lat, result.lon, result.name, true);
  };

  if (isLoading && !data) return <LoadingSpinner message="Memuat data cuaca..." />;
  if (error && !data) return <ErrorMessage message={error} onRetry={refresh} />;
  if (!data) return <LoadingSpinner message="Mendeteksi lokasi..." />;

  const current = data.current;
  const gradient = getWeatherGradient(current.weather[0].icon, now.getHours());
  const uv = getUVLevel(current.uvi);

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" />

      {/* Search Modal */}
      <SearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSelect={handleSearchSelect}
        colors={colors}
      />

      <ScrollView
        style={styles.flex}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#fff" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <GradientBackground colors={gradient} style={styles.hero}>

          {/* Tombol Search di pojok kanan atas */}
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => setSearchVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.searchBtnText}>🔍 Cari Kota</Text>
          </TouchableOpacity>

          {/* Weather Animation */}
           <WeatherAnimation icon={current.weather[0].icon} />
          {/* Greeting */}
          <Text style={styles.greeting}>{getGreeting(now)}</Text>

          {/* Nama Kota */}
          <Text style={styles.cityName}>{activeCityName ?? 'Lokasi Saat Ini'}</Text>

          {/* Jam Realtime */}
          <Text style={styles.clock}>{formatClock(now)}</Text>

          {/* Tanggal */}
          <Text style={styles.date}>{formatDateFull(now)}</Text>

          {/* Suhu Besar */}
          <View style={styles.tempRow}>
            <Text style={styles.bigTemp}>{formatTemp(current.temp, tempUnit)}</Text>
          </View>

          <Text style={styles.desc}>{current.weather[0].description}</Text>
          <Text style={styles.feelsLike}>
            Terasa seperti {formatTemp(current.feels_like, tempUnit)}
          </Text>

          {/* Mini Stats */}
          <View style={styles.miniStats}>
            <View style={styles.miniItem}>
              <Text style={styles.miniLabel}>💧 Kelembaban</Text>
              <Text style={styles.miniVal}>{formatHumidity(current.humidity)}</Text>
            </View>
            <View style={styles.miniItem}>
              <Text style={styles.miniLabel}>💨 Angin</Text>
              <Text style={styles.miniVal}>
                {formatWind(current.wind_speed, windUnit)} {getWindDir(current.wind_deg)}
              </Text>
            </View>
            <View style={styles.miniItem}>
              <Text style={styles.miniLabel}>👁️ Jarak Pandang</Text>
              <Text style={styles.miniVal}>{formatVisibility(current.visibility)}</Text>
            </View>
          </View>
        </GradientBackground>

        {/* Cities Carousel */}
        {cities.length > 0 && <CitiesCarousel cities={cities} />}

        {/* Weather Alerts */}
        {data.alerts && <WeatherAlertBanner alerts={data.alerts} />}

        {/* Grafik Suhu 24 Jam */}
        <TemperatureChart data={data.hourly} />

        {/* Daily */}
        <DailyForecast data={data.daily} />

        {/* Detail Grid */}
        <View style={[styles.section, { paddingHorizontal: 16, marginTop: 12 }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DETAIL CUACA</Text>
          <View style={styles.grid}>
            <WeatherDetailRow icon="☀️" label="Indeks UV" value={String(Math.round(current.uvi))} sub={uv.label} />
            <WeatherDetailRow icon="🌡️" label="Tekanan" value={convertPressure(current.pressure, pressureUnit)} />
            <WeatherDetailRow icon="💧" label="Titik Embun" value={formatTemp(current.dew_point, tempUnit)} />
            <WeatherDetailRow icon="☁️" label="Tutupan Awan" value={`${current.clouds}%`} />
          </View>
        </View>

        {/* Air Quality */}
        {airQuality && <AirQualityCard data={airQuality} />}

        {/* Sunrise Sunset */}
        <SunriseSunsetCard
          sunrise={current.sunrise}
          sunset={current.sunset}
          current={current.dt}
        />

        {/* Share Button */}
        <WeatherShareButton
          data={data}
          airQuality={airQuality}
          cityName={activeCityName ?? 'Lokasi Saat Ini'}
        />
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 28 },
  searchBtn: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 12,
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  greeting: { color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '500' },
  cityName: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  clock: { color: '#fff', fontSize: 42, fontWeight: '200', marginTop: 8, letterSpacing: 2 },
  date: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
  tempRow: { marginTop: 16, alignItems: 'center' },
  bigTemp: { color: '#fff', fontSize: 80, fontWeight: '200' },
  desc: { color: 'rgba(255,255,255,0.9)', fontSize: 18, textTransform: 'capitalize', textAlign: 'center' },
  feelsLike: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', marginTop: 4 },
  miniStats: { flexDirection: 'row', marginTop: 24, gap: 8 },
  miniItem: { flex: 1, alignItems: 'center' },
  miniLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  miniVal: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 2 },
  section: {},
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
});
