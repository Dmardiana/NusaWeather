// ============================================================
// NusaWeather — src/components/weather/WeatherShareCard.tsx
// ============================================================
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { AQI_CONFIG } from '../../constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useUnits } from '../../contexts/UnitsContext';
import { AirQuality, OneCallWeather } from '../../types';
import { formatHumidity, formatTemp, formatWind } from '../../utils/unit.utils';
import { getWindDir } from '../../utils/weather.utils';

interface Props {
  data: OneCallWeather;
  airQuality: AirQuality | null;
  cityName: string;
}

// ─── Card yang akan di-screenshot ────────────────────────────
const ShareCard = React.forwardRef<View, Props>(
  ({ data, airQuality, cityName }, ref) => {
    const { tempUnit, windUnit } = useUnits();
    const current = data.current;
    const now = new Date();

    const dateStr = now.toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit',
    });

    const getGradient = () => {
      const icon = current.weather[0].icon;
      const hour = now.getHours();
      if (icon.startsWith('01')) {
        if (hour >= 5 && hour < 10) return ['#FF6B35', '#FF9A3C'];
        if (hour >= 10 && hour < 16) return ['#2196F3', '#1565C0'];
        if (hour >= 16 && hour < 19) return ['#FF9800', '#E65100'];
        return ['#0A1628', '#1A3A5C'];
      }
      if (icon.startsWith('09') || icon.startsWith('10')) return ['#373B44', '#4286F4'];
      if (icon.startsWith('11')) return ['#141E30', '#243B55'];
      if (icon.startsWith('13')) return ['#E0EAFC', '#CFDEF3'];
      if (icon.startsWith('50')) return ['#606C88', '#3F4C6B'];
      return ['#2196F3', '#1565C0'];
    };

    const [bgTop, bgBottom] = getGradient();
    const aqiData = airQuality ? AQI_CONFIG[airQuality.aqi] : null;
    const daily = data.daily.slice(0, 4);

    return (
      <View ref={ref} style={[styles.card, { backgroundColor: bgTop }]}>
        {/* Background gradient overlay */}
        <View style={[styles.gradientOverlay, { backgroundColor: bgBottom }]} />

        {/* Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardApp}>🌤️ NusaWeather</Text>
            <Text style={styles.cardCity}>{cityName}</Text>
            <Text style={styles.cardDate}>{dateStr}</Text>
            <Text style={styles.cardTime}>{timeStr} WIB</Text>
          </View>
          <View style={styles.cardTempBlock}>
            <Text style={styles.cardBigTemp}>
              {formatTemp(current.temp, tempUnit)}
            </Text>
            <Text style={styles.cardDesc}>
              {current.weather[0].description}
            </Text>
            <Text style={styles.cardFeels}>
              Terasa {formatTemp(current.feels_like, tempUnit)}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { icon: '💧', label: 'Kelembaban', value: formatHumidity(current.humidity) },
            { icon: '💨', label: 'Angin', value: `${formatWind(current.wind_speed, windUnit)} ${getWindDir(current.wind_deg)}` },
            { icon: '🌡️', label: 'Tekanan', value: `${current.pressure} hPa` },
            { icon: '☁️', label: 'Awan', value: `${current.clouds}%` },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Forecast 4 hari */}
        <Text style={styles.forecastTitle}>PRAKIRAAN 4 HARI</Text>
        <View style={styles.forecastRow}>
          {daily.map((day, i) => {
            const d = new Date(day.dt * 1000);
            const dayName = i === 0 ? 'Hari Ini' : d.toLocaleDateString('id-ID', { weekday: 'short' });
            return (
              <View key={day.dt} style={styles.forecastItem}>
                <Text style={styles.forecastDay}>{dayName}</Text>
                <Text style={styles.forecastIcon}>
                  {day.weather[0].main === 'Rain' ? '🌧️' :
                   day.weather[0].main === 'Clouds' ? '☁️' :
                   day.weather[0].main === 'Clear' ? '☀️' :
                   day.weather[0].main === 'Thunderstorm' ? '⛈️' :
                   day.weather[0].main === 'Snow' ? '❄️' : '🌤️'}
                </Text>
                <Text style={styles.forecastMax}>
                  {Math.round(day.temp.max)}°
                </Text>
                <Text style={styles.forecastMin}>
                  {Math.round(day.temp.min)}°
                </Text>
              </View>
            );
          })}
        </View>

        {/* AQI */}
        {aqiData && (
          <>
            <View style={styles.divider} />
            <View style={styles.aqiRow}>
              <Text style={styles.aqiLabel}>Kualitas Udara</Text>
              <View style={[styles.aqiBadge, { backgroundColor: aqiData.color }]}>
                <Text style={styles.aqiText}>{aqiData.icon} {aqiData.label}</Text>
              </View>
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>Dibuat dengan NusaWeather 🌤️</Text>
          <Text style={styles.footerSub}>Data dari OpenWeatherMap</Text>
        </View>
      </View>
    );
  }
);

ShareCard.displayName = 'ShareCard';

// ─── Share Button ─────────────────────────────────────────────
export const WeatherShareButton: React.FC<Props> = (props) => {
  const { colors } = useTheme();
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      if (Platform.OS === 'web') {
        // Web: share teks saja
        const current = props.data.current;
        const { tempUnit, windUnit } = { tempUnit: 'celsius' as const, windUnit: 'ms' as const };
        const text =
          `🌤️ NusaWeather — ${props.cityName}\n` +
          `🌡️ Suhu: ${formatTemp(current.temp, tempUnit)}\n` +
          `☁️ ${current.weather[0].description}\n` +
          `💧 Kelembaban: ${formatHumidity(current.humidity)}\n` +
          `💨 Angin: ${formatWind(current.wind_speed, windUnit)}\n` +
          `📅 ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}\n\n` +
          `Cek cuaca akurat di NusaWeather! 🌤️`;

        if (navigator.share) {
          await navigator.share({ title: 'NusaWeather', text });
        } else {
          await navigator.clipboard.writeText(text);
          Alert.alert('✅ Disalin!', 'Info cuaca sudah disalin ke clipboard.');
        }
        return;
      }

      // Native: screenshot + share
      const uri = await (cardRef.current as any).capture();
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Bagikan Cuaca',
        });
      } else {
        await Share.share({
          message: `Cuaca di ${props.cityName} sekarang ${formatTemp(props.data.current.temp, 'celsius')} - NusaWeather`,
          url: uri,
        });
      }
    } catch (e: any) {
      if (!e.message?.includes('cancel')) {
        Alert.alert('Gagal', 'Tidak bisa membagikan cuaca.');
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <View>
      {/* Hidden card untuk screenshot (native) */}
      {Platform.OS !== 'web' && (
        <ViewShot
          ref={cardRef as any}
          options={{ format: 'png', quality: 1 }}
          style={styles.hiddenCard}
        >
          <ShareCard {...props} />
        </ViewShot>
      )}

      {/* Tombol Share */}
      <TouchableOpacity
        style={[styles.shareBtn, { backgroundColor: colors.primary }]}
        onPress={handleShare}
        activeOpacity={0.85}
        disabled={sharing}
      >
        {sharing ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.shareBtnText}>
            {Platform.OS === 'web' ? '📋 Salin Info Cuaca' : '📤 Bagikan Cuaca'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Share Card
  card: {
    width: 380,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    opacity: 0.6,
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardApp: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  cardCity: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 4 },
  cardDate: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  cardTime: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  cardTempBlock: { alignItems: 'flex-end' },
  cardBigTemp: { color: '#fff', fontSize: 52, fontWeight: '200' },
  cardDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13, textTransform: 'capitalize', textAlign: 'right' },
  cardFeels: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'right' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statIcon: { fontSize: 18, marginBottom: 2 },
  statValue: { color: '#fff', fontSize: 12, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginTop: 1 },
  forecastTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between' },
  forecastItem: { alignItems: 'center', flex: 1 },
  forecastDay: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  forecastIcon: { fontSize: 20, marginVertical: 4 },
  forecastMax: { color: '#fff', fontSize: 13, fontWeight: '700' },
  forecastMin: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  aqiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  aqiLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  aqiBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  aqiText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cardFooter: { marginTop: 16, alignItems: 'center' },
  footerText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  footerSub: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 },
  // Share Button
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  hiddenCard: {
    position: 'absolute',
    top: -9999,
    left: -9999,
  },
});