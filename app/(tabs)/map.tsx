// ============================================================
// NusaWeather — app/(tabs)/map.tsx (native only)
// ============================================================
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useWeatherStore } from '../../src/stores/weather.store';

export default function MapScreen() {
  const { colors } = useTheme();
  const { activeLat, activeLon, activeCityName, data } = useWeatherStore();
  const lat = activeLat ?? -6.2088;
  const lon = activeLon ?? 106.8456;
  const temp = data ? Math.round(data.current.temp) : null;

  return (
    <View style={styles.flex}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>🗺️ Peta Cuaca</Text>
        {activeCityName && (
          <Text style={[styles.sub, { color: colors.textSecondary }]}>{activeCityName}</Text>
        )}
      </View>
      <MapView
        style={styles.flex}
        initialRegion={{
          latitude: lat,
          longitude: lon,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        <UrlTile
          urlTemplate={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${process.env.EXPO_PUBLIC_OWM_API_KEY}`}
          maximumZ={19}
          opacity={0.6}
        />
        {activeLat && activeLon && (
          <Marker coordinate={{ latitude: lat, longitude: lon }}>
            <View style={[styles.marker, { backgroundColor: colors.primary }]}>
              <Text style={styles.markerText}>{temp !== null ? `${temp}°` : '📍'}</Text>
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  sub: { fontSize: 14, marginTop: 2 },
  marker: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  markerText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});