import React, { useMemo } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useWeatherStore } from '../../src/stores/weather.store';

const IFrame = 'iframe' as any;

export default function MapScreen() {
  const { colors } = useTheme();
  const { activeLat, activeLon, activeCityName } = useWeatherStore();

  const lat = activeLat ?? -6.2088;
  const lon = activeLon ?? 106.8456;

  const embedUrl = useMemo(
    () =>
      `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.3}%2C${lat - 0.2}%2C${lon + 0.3}%2C${lat + 0.2}&layer=mapnik&marker=${lat}%2C${lon}`,
    [lat, lon]
  );
  const openUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=10/${lat}/${lon}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>🗺️ Peta Cuaca</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          {activeCityName ?? 'Lokasi Saat Ini'}
        </Text>
      </View>

      <View style={styles.mapWrap}>
        <IFrame
          src={embedUrl}
          title="NusaWeather Map"
          style={styles.iframe}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </View>

      <TouchableOpacity
        style={[styles.linkBtn, { borderColor: colors.primary }]}
        onPress={() => void Linking.openURL(openUrl)}
      >
        <Text style={[styles.linkText, { color: colors.primary }]}>Buka peta penuh di tab baru</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: '800' },
  sub: { fontSize: 14, marginTop: 2 },
  mapWrap: { flex: 1, padding: 12 },
  iframe: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    borderRadius: 12,
  },
  linkBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  linkText: { fontSize: 14, fontWeight: '700' },
});