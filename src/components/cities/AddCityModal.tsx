// ============================================================
// NusaWeather — src/components/cities/AddCityModal.tsx
// ============================================================
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { geocodingService } from '../../services/weather/geocoding.service';
import { GeocodingResult } from '../../types';
import { SearchBar } from '../common/SearchBar';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (result: GeocodingResult) => void;
}

// Flag emoji dari kode negara
const getFlagEmoji = (countryCode: string): string => {
  if (!countryCode) return '🌍';
  const code = countryCode.toUpperCase();
  return code
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e0 + c.charCodeAt(0) - 65))
    .join('');
};

// Warna badge berdasarkan negara
const getBadgeColor = (country: string) => {
  if (country === 'ID') return '#2196F3';
  return '#78909C';
};

export const AddCityModal: React.FC<Props> = ({ visible, onClose, onSelect }) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(false);
    setResults([]);
    try {
      console.log('[AddCityModal] Searching for:', query);
      const data = await geocodingService.search(query.trim());
      console.log('[AddCityModal] Search results:', data?.length);
      setResults(data);
      setSearched(true);
      if (!data || data.length === 0) {
        setError(`Kota "${query}" tidak ditemukan. Coba nama lain atau kota besar di Indonesia.`);
      }
    } catch (e: any) {
      console.error('[AddCityModal] Search error:', e);
      const errorMsg = e.message || 'Gagal mencari kota. Periksa koneksi internet.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: GeocodingResult) => {
    onSelect(item);
    setQuery('');
    setResults([]);
    setSearched(false);
    onClose();
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setSearched(false);
    onClose();
  };

  const renderItem = ({ item, index }: { item: GeocodingResult; index: number }) => {
    const flag = getFlagEmoji(item.country);
    const badgeColor = getBadgeColor(item.country);
    const locationParts = [item.state, item.country].filter(Boolean).join(', ');
    const coords = `${Math.abs(item.lat).toFixed(2)}°${item.lat >= 0 ? 'N' : 'S'}, ${Math.abs(item.lon).toFixed(2)}°${item.lon >= 0 ? 'E' : 'W'}`;

    return (
      <TouchableOpacity
        style={[
          styles.result,
          {
            backgroundColor: index % 2 === 0 ? colors.surface : colors.surfaceVariant,
            borderLeftColor: badgeColor,
          },
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        {/* Kiri: flag + info */}
        <View style={styles.resultLeft}>
          <Text style={styles.flag}>{flag}</Text>
          <View style={styles.resultInfo}>
            <Text style={[styles.resultName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.resultState, { color: colors.textSecondary }]}>
              {locationParts}
            </Text>
            <Text style={[styles.resultCoords, { color: colors.textMuted }]}>
              📍 {coords}
            </Text>
          </View>
        </View>

        {/* Kanan: badge + arrow */}
        <View style={styles.resultRight}>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{item.country}</Text>
          </View>
          <Text style={[styles.arrow, { color: colors.textMuted }]}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>🔍 Tambah Kota</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Pilih kota yang tepat dari hasil pencarian
          </Text>

          {/* Search Bar */}
          <SearchBar
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (!text.trim()) {
                setResults([]);
                setSearched(false);
                setError(null);
              }
            }}
            onSubmit={search}
            placeholder="Ketik nama kota, lalu tekan enter..."
          />

          {/* Loading */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Mencari kota...
              </Text>
            </View>
          )}

          {/* Error */}
          {error && !loading && (
            <View style={[styles.errorContainer, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.error, { color: colors.error }]}>⚠️ {error}</Text>
            </View>
          )}

          {/* Hint awal */}
          {!loading && !searched && !error && (
            <View style={styles.hintContainer}>
              <Text style={[styles.hintText, { color: colors.textMuted }]}>
                💡 Tip: Ketik nama kota lalu tekan enter atau ikon search
              </Text>
            </View>
          )}

          {/* Jumlah hasil */}
          {searched && results.length > 0 && !loading && (
            <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
              {results.length} hasil ditemukan — pilih yang paling tepat
            </Text>
          )}

          {/* List Hasil */}
          <FlatList
            data={results}
            keyExtractor={(item, i) => `${item.lat}_${item.lon}_${i}`}
            renderItem={renderItem}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
          />

          {/* Tombol Tutup */}
          <TouchableOpacity
            style={[styles.closeBtn, { borderColor: colors.border }]}
            onPress={handleClose}
          >
            <Text style={[styles.closeTxt, { color: colors.textSecondary }]}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
  hintContainer: {
    marginTop: 20,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  hintText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  resultCount: {
    fontSize: 12,
    marginTop: 12,
    marginBottom: 4,
    marginLeft: 2,
  },
  list: {
    marginTop: 4,
    maxHeight: 380,
  },
  separator: {
    height: 1,
  },
  result: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderRadius: 4,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  flag: {
    fontSize: 28,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultState: {
    fontSize: 13,
    marginTop: 2,
  },
  resultCoords: {
    fontSize: 11,
    marginTop: 2,
  },
  resultRight: {
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  arrow: {
    fontSize: 20,
    fontWeight: '300',
  },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  closeTxt: {
    fontSize: 15,
    fontWeight: '600',
  },
});