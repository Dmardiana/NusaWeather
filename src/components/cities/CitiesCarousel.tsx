// ============================================================
// NusaWeather — src/components/cities/CitiesCarousel.tsx
// ============================================================
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useWeather } from '../../hooks/useWeather';
import { weatherService } from '../../services/weather/weather.service';
import { City } from '../../types';

const { width: SW } = Dimensions.get('window');
const CARD_WIDTH = SW - 48;
const CARD_MARGIN = 8;

interface CityCardProps {
  city: City;
  isActive: boolean;
  onPress: () => void;
  weather: { temp: number; desc: string; icon: string } | null;
  colors: any;
}

// ─── Mini weather icon dari kondisi ──────────────────────────
const getWeatherEmoji = (icon: string): string => {
  const code = icon?.slice(0, 2);
  const isNight = icon?.endsWith('n');
  switch (code) {
    case '01': return isNight ? '🌙' : '☀️';
    case '02': return isNight ? '🌙' : '⛅';
    case '03': return '☁️';
    case '04': return '☁️';
    case '09': return '🌧️';
    case '10': return '🌦️';
    case '11': return '⛈️';
    case '13': return '❄️';
    case '50': return '🌫️';
    default:   return '🌤️';
  }
};

// ─── Gradient warna per kondisi cuaca ────────────────────────
const getCardGradient = (icon: string): [string, string] => {
  const code = icon?.slice(0, 2);
  const isNight = icon?.endsWith('n');
  if (code === '01') return isNight ? ['#0A1628', '#1A3A5C'] : ['#2196F3', '#1565C0'];
  if (code === '02') return ['#546E7A', '#2196F3'];
  if (code === '03' || code === '04') return ['#546E7A', '#37474F'];
  if (code === '09' || code === '10') return ['#373B44', '#4286F4'];
  if (code === '11') return ['#141E30', '#243B55'];
  if (code === '13') return ['#90CAF9', '#E3F2FD'];
  if (code === '50') return ['#606C88', '#3F4C6B'];
  return ['#2196F3', '#1565C0'];
};

// ─── Single City Card ─────────────────────────────────────────
const CityCard: React.FC<CityCardProps> = ({ city, isActive, onPress, weather, colors }) => {
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.93)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.75)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1 : 0.93,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: isActive ? 1 : 0.75,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive, scaleAnim, opacityAnim]);

  const icon = weather?.icon ?? '01d';
  const [colorTop, colorBottom] = getCardGradient(icon);
  const emoji = getWeatherEmoji(icon);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[styles.card, { backgroundColor: colorTop }]}
      >
        {/* Background overlay */}
        <View style={[styles.cardOverlay, { backgroundColor: colorBottom }]} />

        {/* Active indicator */}
        {isActive && (
          <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
        )}

        {/* Default badge */}
        {city.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>⭐ Default</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Kiri: info kota */}
          <View style={styles.cardLeft}>
            <Text style={styles.cardEmoji}>{emoji}</Text>
            <Text style={styles.cardCity} numberOfLines={1}>{city.name}</Text>
            <Text style={styles.cardState} numberOfLines={1}>
              {[city.state, city.country].filter(Boolean).join(', ')}
            </Text>
            {isActive && (
              <View style={styles.activeIndicator}>
                <View style={[styles.activePulse, { backgroundColor: colors.primary }]} />
                <Text style={[styles.activeText, { color: colors.primary }]}>Sedang ditampilkan</Text>
              </View>
            )}
          </View>

          {/* Kanan: suhu + deskripsi */}
          <View style={styles.cardRight}>
            {weather ? (
              <>
                <Text style={styles.cardTemp}>{Math.round(weather.temp)}°</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {weather.desc}
                </Text>
              </>
            ) : (
              <Text style={styles.cardLoading}>...</Text>
            )}
          </View>
        </View>

        {/* Tap hint */}
        {!isActive && (
          <Text style={styles.tapHint}>Ketuk untuk lihat cuaca</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Pagination Dots ──────────────────────────────────────────
const PaginationDots: React.FC<{ count: number; active: number; colors: any }> = ({
  count, active, colors,
}) => (
  <View style={styles.dotsRow}>
    {Array.from({ length: count }).map((_, i) => (
      <Animated.View
        key={i}
        style={[
          styles.dot,
          {
            backgroundColor: i === active ? colors.primary : colors.border,
            width: i === active ? 20 : 6,
          },
        ]}
      />
    ))}
  </View>
);

// ─── Main Carousel ────────────────────────────────────────────
interface Props {
  cities: City[];
}

export const CitiesCarousel: React.FC<Props> = ({ cities }) => {
  const { colors } = useTheme();
  const { fetch, activeLat, activeLon } = useWeather();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [weatherCache, setWeatherCache] = useState<
    Record<string, { temp: number; desc: string; icon: string }>
  >({});

  // Fetch preview cuaca untuk semua kota (temp saja, pakai cache)
  useEffect(() => {
    cities.forEach(async (city) => {
      const key = `${city.lat.toFixed(2)}_${city.lon.toFixed(2)}`;
      if (weatherCache[key]) return;
      try {
        const wx = await weatherService.getWeather(city.lat, city.lon);
        setWeatherCache((prev) => ({
          ...prev,
          [key]: {
            temp: wx.current.temp,
            desc: wx.current.weather[0].description,
            icon: wx.current.weather[0].icon,
          },
        }));
      } catch {}
    });
  }, [cities, weatherCache]);

  // Sync active index dengan kota yang sedang ditampilkan
  useEffect(() => {
    if (!activeLat || !activeLon) return;
    const idx = cities.findIndex(
      (c) => Math.abs(c.lat - activeLat) < 0.01 && Math.abs(c.lon - activeLon) < 0.01
    );
    if (idx >= 0 && idx !== activeIndex) {
      setActiveIndex(idx);
      scrollRef.current?.scrollTo({ x: idx * (CARD_WIDTH + CARD_MARGIN * 2), animated: true });
    }
  }, [activeLat, activeLon, cities, activeIndex])


  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_MARGIN * 2));
      if (idx >= 0 && idx < cities.length) setActiveIndex(idx);
    },
    [cities.length]
  );

  const handleCityPress = useCallback(
    (city: City, index: number) => {
      setActiveIndex(index);
      fetch(city.lat, city.lon, city.name, true);
      scrollRef.current?.scrollTo({
        x: index * (CARD_WIDTH + CARD_MARGIN * 2),
        animated: true,
      });
    },
    [fetch]
  );

  if (cities.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textSecondary }]}>
          🏙️ KOTA TERSIMPAN
        </Text>
        <Text style={[styles.counter, { color: colors.textMuted }]}>
          {activeIndex + 1} / {cities.length}
        </Text>
      </View>

      {/* Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
      >
        {cities.map((city, index) => {
          const key = `${city.lat.toFixed(2)}_${city.lon.toFixed(2)}`;
          return (
            <CityCard
              key={city.id}
              city={city}
              isActive={index === activeIndex}
              onPress={() => handleCityPress(city, index)}
              weather={weatherCache[key] ?? null}
              colors={colors}
            />
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
      {cities.length > 1 && (
        <PaginationDots count={cities.length} active={activeIndex} colors={colors} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  counter: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: CARD_MARGIN,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
    minHeight: 110,
    justifyContent: 'space-between',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    opacity: 0.5,
    borderRadius: 20,
  },
  activeDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  defaultBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardLeft: {
    flex: 1,
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  cardCity: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  cardState: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  activePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardTemp: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '200',
    lineHeight: 46,
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    textAlign: 'right',
    textTransform: 'capitalize',
    maxWidth: 90,
    marginTop: 2,
  },
  cardLoading: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 32,
    fontWeight: '200',
  },
  tapHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});