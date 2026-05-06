
// ============================================================
// NusaWeather — src/components/weather/HourlyForecast.tsx
// ============================================================
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useUnits } from '../../contexts/UnitsContext';
import { geocodingService } from '../../services/weather/geocoding.service';
import { HourlyWeather } from '../../types';
import { formatTime } from '../../utils/date.utils';
import { formatTemp } from '../../utils/unit.utils';

interface Props { data: HourlyWeather[] }
export const HourlyForecast: React.FC<Props> = ({ data }) => {
  const { colors } = useTheme();
  const { tempUnit } = useUnits();
  const items = data.slice(0, 24);
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>PRAKIRAAN PER JAM</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {items.map((item, i) => (
          <View key={item.dt} style={styles.item}>
            <Text style={[styles.time, { color: colors.textSecondary }]}>
              {i === 0 ? 'Skrg' : formatTime(item.dt)}
            </Text>
            <Image
              source={{ uri: geocodingService.getIconUrl(item.weather[0].icon) }}
              style={styles.icon}
            />
            <Text style={[styles.temp, { color: colors.text }]}>
              {formatTemp(item.temp, tempUnit)}
            </Text>
            <Text style={[styles.pop, { color: colors.primary }]}>
              {item.pop > 0 ? `${Math.round(item.pop * 100)}%` : ''}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, marginHorizontal: 16, marginTop: 12, borderWidth: 1 },
  title: { fontSize: 12, fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  scroll: { gap: 16, paddingRight: 8 },
  item: { alignItems: 'center', minWidth: 52 },
  time: { fontSize: 12 },
  icon: { width: 36, height: 36, marginVertical: 4 },
  temp: { fontSize: 14, fontWeight: '600' },
  pop: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});