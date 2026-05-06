// ============================================================
// NusaWeather — src/components/weather/WeatherAlertBanner.tsx
// ============================================================
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { WeatherAlert } from '../../types';
interface Props { alerts: WeatherAlert[] }
export const WeatherAlertBanner: React.FC<Props> = ({ alerts }) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  if (!alerts.length) return null;
  return (
    <TouchableOpacity
      style={[styles.banner, { backgroundColor: colors.error + '20', borderColor: colors.error }]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.alertIcon}>⚠️</Text>
        <Text style={[styles.title, { color: colors.error }]}>
          {alerts[0].event}
        </Text>
        <Text style={{ color: colors.error }}>{expanded ? '▲' : '▼'}</Text>
      </View>
      {expanded && (
        <Text style={[styles.desc, { color: colors.text }]}>{alerts[0].description}</Text>
      )}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  banner: { borderRadius: 16, padding: 14, marginHorizontal: 16, marginTop: 12, borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertIcon: { fontSize: 18 },
  title: { flex: 1, fontSize: 14, fontWeight: '700' },
  desc: { fontSize: 13, lineHeight: 20, marginTop: 10 },
});
