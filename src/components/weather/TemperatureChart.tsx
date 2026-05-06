// ============================================================
// NusaWeather — src/components/weather/TemperatureChart.tsx
// ============================================================
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { useUnits } from '../../contexts/UnitsContext';
import { geocodingService } from '../../services/weather/geocoding.service';
import { HourlyWeather } from '../../types';
import { formatTime } from '../../utils/date.utils';
import { convertTemp, formatTemp } from '../../utils/unit.utils';

interface Props {
  data: HourlyWeather[];
}

const CHART_HEIGHT = 80;
const ITEM_WIDTH = 64;
const PADDING = 16;

export const TemperatureChart: React.FC<Props> = ({ data }) => {
  const { colors } = useTheme();
  const { tempUnit } = useUnits();

  // FIX 1: Ref untuk cegah update setelah unmount
  const isMountedRef = useRef(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // FIX 2: ID gradient yang unik per instance, hindari konflik SVG Defs
  const gradientId = useRef(`areaGrad_${Math.random().toString(36).slice(2, 9)}`).current;

  const items = data.slice(0, 24);
  const totalWidth = items.length * ITEM_WIDTH + PADDING * 2;

  // FIX 3: Cleanup animasi saat unmount
  useEffect(() => {
    isMountedRef.current = true;

    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true, // FIX 4: pakai true agar animasi jalan di native thread
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      isMountedRef.current = false;
      animation.stop(); // hentikan animasi saat unmount
    };
  }, []); // hapus fadeAnim & slideAnim dari deps karena refs tidak berubah

  // Hitung suhu min/max
  const temps = useMemo(() => items.map((d) => convertTemp(d.temp, tempUnit)), [items, tempUnit]);
  const minTemp = useMemo(() => Math.min(...temps), [temps]);
  const maxTemp = useMemo(() => Math.max(...temps), [temps]);
  const range = useMemo(() => maxTemp - minTemp || 1, [maxTemp, minTemp]);

  // Koordinat Y untuk setiap titik (dibalik karena SVG Y dari atas)
  const getY = (temp: number) =>
    CHART_HEIGHT - ((temp - minTemp) / range) * (CHART_HEIGHT - 16) - 8;

  // Koordinat X untuk setiap titik
  const getX = (index: number) => index * ITEM_WIDTH + ITEM_WIDTH / 2 + PADDING;

  // Buat path smooth curve (bezier)
  const buildPath = (): string => {
    if (items.length === 0) return '';
    let path = `M ${getX(0)} ${getY(temps[0])}`;
    for (let i = 1; i < items.length; i++) {
      const x0 = getX(i - 1);
      const y0 = getY(temps[i - 1]);
      const x1 = getX(i);
      const y1 = getY(temps[i]);
      const cpX = (x0 + x1) / 2;
      path += ` C ${cpX} ${y0}, ${cpX} ${y1}, ${x1} ${y1}`;
    }
    return path;
  };

  // Area fill path (tutup ke bawah)
  const buildAreaPath = (): string => {
    if (items.length === 0) return '';
    let path = `M ${getX(0)} ${CHART_HEIGHT}`;
    path += ` L ${getX(0)} ${getY(temps[0])}`;
    for (let i = 1; i < items.length; i++) {
      const x0 = getX(i - 1);
      const y0 = getY(temps[i - 1]);
      const x1 = getX(i);
      const y1 = getY(temps[i]);
      const cpX = (x0 + x1) / 2;
      path += ` C ${cpX} ${y0}, ${cpX} ${y1}, ${x1} ${y1}`;
    }
    path += ` L ${getX(items.length - 1)} ${CHART_HEIGHT} Z`;
    return path;
  };

  // Warna berdasarkan suhu
  const getTempColor = (temp: number): string => {
    if (temp >= 35) return '#FF5722';
    if (temp >= 30) return '#FF9800';
    if (temp >= 25) return '#FFC107';
    if (temp >= 20) return '#4CAF50';
    if (temp >= 15) return '#2196F3';
    return '#90CAF9';
  };

  // FIX 5: Guard kalau data kosong
  if (!data || data.length === 0) return null;

  const linePath = buildPath();
  const areaPath = buildAreaPath();
  const avgColor = getTempColor((minTemp + maxTemp) / 2);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textSecondary }]}>
          📈 GRAFIK SUHU 24 JAM
        </Text>
        <View style={styles.rangeRow}>
          <Text style={[styles.rangeText, { color: '#FF5722' }]}>
            ↑ {formatTemp(maxTemp, tempUnit)}
          </Text>
          <Text style={[styles.rangeDivider, { color: colors.textMuted }]}>  |  </Text>
          <Text style={[styles.rangeText, { color: '#2196F3' }]}>
            ↓ {formatTemp(minTemp, tempUnit)}
          </Text>
        </View>
      </View>

      {/* Chart + Items */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ width: totalWidth }}
        // FIX 6: removeClippedSubviews bisa konflik dengan SVG, matikan
        removeClippedSubviews={false}
      >
        {/* SVG Chart */}
        <Svg
          width={totalWidth}
          height={CHART_HEIGHT + 8}
          style={styles.svg}
        >
          <Defs>
            {/* FIX 7: Pakai gradientId unik per instance */}
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={avgColor} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={avgColor} stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio, i) => (
            <Line
              key={`grid-${i}`}
              x1={PADDING}
              y1={CHART_HEIGHT * ratio}
              x2={totalWidth - PADDING}
              y2={CHART_HEIGHT * ratio}
              stroke={colors.border}
              strokeWidth="0.5"
              strokeDasharray="4,4"
            />
          ))}

          {/* Area fill */}
          <Path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Line */}
          <Path
            d={linePath}
            fill="none"
            stroke={avgColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots di setiap titik */}
          {items.map((item, i) => (
            <Circle
              key={`dot-${item.dt}-${i}`}
              cx={getX(i)}
              cy={getY(temps[i])}
              r="3.5"
              fill={getTempColor(temps[i])}
              stroke={colors.surface}
              strokeWidth="1.5"
            />
          ))}
        </Svg>

        {/* Item row di bawah chart */}
        <View style={styles.itemsRow}>
          {items.map((item, i) => (
            <View key={`item-${item.dt}-${i}`} style={styles.item}>
              {/* Label suhu di atas */}
              <Text style={[styles.tempLabel, { color: getTempColor(temps[i]) }]}>
                {Math.round(temps[i])}°
              </Text>
              {/* Icon cuaca */}
              <Image
                source={{ uri: geocodingService.getIconUrl(item.weather[0].icon) }}
                style={styles.icon}
              />
              {/* Jam */}
              <Text style={[styles.time, { color: colors.textSecondary }]}>
                {i === 0 ? 'Skrg' : formatTime(item.dt)}
              </Text>
              {/* Probabilitas hujan */}
              <Text 
                style={[
                  styles.pop, 
                  { 
                    color: colors.primary,
                    opacity: item.pop > 0.05 ? 1 : 0 
                  }
                ]}
              >
                {item.pop > 0.05 ? `💧${Math.round(item.pop * 100)}%` : ' '}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rangeDivider: {
    fontSize: 12,
  },
  svg: {
    marginBottom: 0,
  },
  itemsRow: {
    flexDirection: 'row',
    paddingHorizontal: PADDING,
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    gap: 2,
  },
  tempLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  icon: {
    width: 32,
    height: 32,
  },
  time: {
    fontSize: 11,
    fontWeight: '500',
  },
  pop: {
    fontSize: 10,
    fontWeight: '700',
  },
  popEmpty: {
    fontSize: 10,
    height: 14,
  },
});