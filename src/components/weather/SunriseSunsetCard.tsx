// ============================================================
// NusaWeather — src/components/weather/SunriseSunsetCard.tsx
// ============================================================
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { formatTime } from '../../utils/date.utils';
interface Props { sunrise: number; sunset: number; current: number }
export const SunriseSunsetCard: React.FC<Props> = ({ sunrise, sunset, current }) => {
  const { colors } = useTheme();
  const total = sunset - sunrise;
  const progress = Math.min(Math.max((current - sunrise) / total, 0), 1);
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>MATAHARI</Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.sunIcon}>🌅</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Terbit</Text>
          <Text style={[styles.time, { color: colors.text }]}>{formatTime(sunrise)}</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.track, { backgroundColor: colors.border }]}>
            <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>
        <View style={styles.col}>
          <Text style={styles.sunIcon}>🌇</Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Terbenam</Text>
          <Text style={[styles.time, { color: colors.text }]}>{formatTime(sunset)}</Text>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, marginHorizontal: 16, marginTop: 12, borderWidth: 1 },
  title: { fontSize: 12, fontWeight: '700', marginBottom: 16, letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  col: { alignItems: 'center', flex: 1 },
  sunIcon: { fontSize: 28 },
  label: { fontSize: 12, marginTop: 4 },
  time: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  progressContainer: { flex: 2 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});
