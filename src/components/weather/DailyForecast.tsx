// ============================================================
// NusaWeather — src/components/weather/DailyForecast.tsx
// ============================================================
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useUnits } from '../../contexts/UnitsContext';
import { geocodingService } from '../../services/weather/geocoding.service';
import { DailyWeather } from '../../types';
import { formatDayShort } from '../../utils/date.utils';
import { formatTemp } from '../../utils/unit.utils';
interface Props { data: DailyWeather[] }
export const DailyForecast: React.FC<Props> = ({ data }) => {
  const { colors } = useTheme();
  const { tempUnit } = useUnits();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>PRAKIRAAN 7 HARI</Text>
      {data.slice(0, 7).map((item, i) => (
        <View key={item.dt} style={[styles.row, i < 6 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
          <Text style={[styles.day, { color: colors.text }]}>
            {i === 0 ? 'Hari Ini' : formatDayShort(item.dt)}
          </Text>
          <Image
            source={{ uri: geocodingService.getIconUrl(item.weather[0].icon) }}
            style={styles.icon}
          />
          <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.summary ?? item.weather[0].description}
          </Text>
          <View style={styles.temps}>
            <Text style={[styles.tempMin, { color: colors.textMuted }]}>
              {formatTemp(item.temp.min, tempUnit)}
            </Text>
            <Text style={[styles.tempMax, { color: colors.text }]}>
              {formatTemp(item.temp.max, tempUnit)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, marginHorizontal: 16, marginTop: 12, borderWidth: 1 },
  title: { fontSize: 12, fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  day: { width: 64, fontSize: 14, fontWeight: '500' },
  icon: { width: 32, height: 32 },
  desc: { flex: 1, fontSize: 12, textTransform: 'capitalize' },
  temps: { flexDirection: 'row', gap: 8 },
  tempMin: { fontSize: 14 },
  tempMax: { fontSize: 14, fontWeight: '700' },
});
