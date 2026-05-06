// ============================================================
// NusaWeather — src/components/weather/WeatherDetailRow.tsx
// ============================================================
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
interface Props { icon: string; label: string; value: string; sub?: string }
export const WeatherDetailRow: React.FC<Props> = ({ icon, label, value, sub }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      {sub && <Text style={[styles.sub, { color: colors.textMuted }]}>{sub}</Text>}
    </View>
  );
};
const styles = StyleSheet.create({
  card: {
    width: '47%', borderRadius: 16, padding: 16, borderWidth: 1,
    margin: '1.5%',
  },
  icon: { fontSize: 24, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '500' },
  value: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  sub: { fontSize: 11, marginTop: 2 },
});