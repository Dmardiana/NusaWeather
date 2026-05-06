// ============================================================
// NusaWeather — src/components/weather/AirQualityCard.tsx
// ============================================================
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AQI_CONFIG } from '../../constants';
import { useTheme } from '../../contexts/ThemeContext';
import { AirQuality } from '../../types';
interface Props { data: AirQuality }
export const AirQualityCard: React.FC<Props> = ({ data }) => {
  const { colors } = useTheme();
  const cfg = AQI_CONFIG[data.aqi];
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>KUALITAS UDARA</Text>
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: cfg.color + '20' }]}>
          <Text style={styles.emoji}>{cfg.icon}</Text>
          <Text style={[styles.aqiLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <View style={styles.components}>
          {[
            { k: 'PM2.5', v: data.components.pm2_5.toFixed(1) },
            { k: 'PM10', v: data.components.pm10.toFixed(1) },
            { k: 'O₃', v: data.components.o3.toFixed(1) },
            { k: 'NO₂', v: data.components.no2.toFixed(1) },
          ].map((c) => (
            <View key={c.k} style={styles.comp}>
              <Text style={[styles.compKey, { color: colors.textMuted }]}>{c.k}</Text>
              <Text style={[styles.compVal, { color: colors.text }]}>{c.v}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, marginHorizontal: 16, marginTop: 12, borderWidth: 1 },
  title: { fontSize: 12, fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  badge: { borderRadius: 16, padding: 16, alignItems: 'center', minWidth: 100 },
  emoji: { fontSize: 32 },
  aqiLabel: { fontSize: 13, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  components: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  comp: { alignItems: 'center', minWidth: 52 },
  compKey: { fontSize: 11 },
  compVal: { fontSize: 14, fontWeight: '700' },
});
