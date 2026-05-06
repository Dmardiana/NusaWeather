// ============================================================
// NusaWeather — app/(tabs)/cities.tsx
// ============================================================
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AddCityModal } from '../../src/components/cities/AddCityModal';
import { CityListItem } from '../../src/components/cities/CityListItem';
import { LoadingSpinner } from '../../src/components/common/LoadingSpinner';
import { STR } from '../../src/constants';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useCities } from '../../src/hooks/useCities';
import { useWeather } from '../../src/hooks/useWeather';
import { City, GeocodingResult } from '../../src/types';

export default function CitiesScreen() {
  const { colors } = useTheme();
  const { cities, isLoading, add, remove, update, setDefault, isGuest } = useCities();
  const { fetch } = useWeather();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (city: City) => {
    fetch(city.lat, city.lon, city.name, true);
  };

  const handleAddResult = async (result: GeocodingResult) => {
    try {
      await add({
        name: result.name,
        country: result.country,
        state: result.state,
        lat: result.lat,
        lon: result.lon,
      });
      setModalVisible(false);
      Alert.alert('Berhasil! ✅', `Kota ${result.name} berhasil ditambahkan`);
    } catch (e: any) {
      console.error('[CitiesScreen] Add city error:', e);
      Alert.alert('Gagal ❌', e.message || 'Tidak bisa menambahkan kota.');
    }
  };

  if (isLoading && !cities.length) return <LoadingSpinner message="Memuat kota..." />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>🏙️ {STR.SAVED_CITIES}</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>{STR.ADD_CITY}</Text>
        </TouchableOpacity>
      </View>

      {/* Guest Banner */}
      {isGuest && (
        <View style={[styles.guestBanner, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 13 }}>
            💡 Login untuk menyimpan kota favoritmu secara permanen
          </Text>
        </View>
      )}

      {/* Empty State */}
      {cities.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏙️</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {STR.NO_CITIES}
          </Text>
          <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
            Tekan tombol &quot;+ Tambah Kota&quot; untuk mulai
          </Text>
        </View>
      ) : (
        <FlatList
          data={cities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CityListItem
              city={item}
              onPress={handleSelect}
              onDelete={remove}
              onSetDefault={setDefault}
              onUpdate={update} // ✅ tambah ini
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal Tambah Kota */}
      <AddCityModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={handleAddResult}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '800' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 56 },
  emptyText: { fontSize: 16, fontWeight: '600' },
  emptyHint: { fontSize: 13 },
  guestBanner: {
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
});