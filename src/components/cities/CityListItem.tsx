// ============================================================
// NusaWeather — src/components/cities/CityListItem.tsx
// ============================================================
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { City } from '../../types';

interface Props {
  city: City;
  onPress: (city: City) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  onUpdate: (id: string, newName: string) => void; // ✅ prop baru
}

export const CityListItem: React.FC<Props> = ({
  city,
  onPress,
  onDelete,
  onSetDefault,
  onUpdate,
}) => {
  const { colors } = useTheme();
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState(city.name);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const confirmDelete = () => {
    const runDelete = async () => {
      try {
        setIsDeleting(true);
        await onDelete(city.id);
        console.log('[CityListItem] Delete completed:', city.id);
      } catch (e: any) {
        console.error('[CityListItem] Delete error:', e);
        Alert.alert('Gagal ❌', e.message || 'Tidak bisa menghapus kota.');
      } finally {
        setIsDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined'
          ? window.confirm(`Yakin ingin menghapus ${city.name}?`)
          : false;
      if (confirmed) {
        void runDelete();
      }
      return;
    }

    Alert.alert(
      '🗑️ Hapus Kota',
      `Yakin ingin menghapus ${city.name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => void runDelete(),
        },
      ]
    );
  };

  const handleSaveEdit = async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Nama kota tidak boleh kosong.');
      return;
    }
    if (trimmed === city.name) {
      setEditVisible(false);
      return;
    }
    try {
      setIsUpdating(true);
      await onUpdate(city.id, trimmed); // ✅ kirim update ke parent
      setEditVisible(false);
      Alert.alert('Berhasil! ✅', `Nama kota berhasil diubah menjadi "${trimmed}"`);
    } catch (e: any) {
      console.error('[CityListItem] Update error:', e);
      Alert.alert('Gagal ❌', e.message || 'Tidak bisa mengubah nama kota.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetDefault = async () => {
    try {
      setIsSettingDefault(true);
      await onSetDefault(city.id);
      console.log('[CityListItem] Set default completed:', city.id);
    } catch (e: any) {
      console.error('[CityListItem] Set default error:', e);
      Alert.alert('Gagal ❌', e.message || 'Tidak bisa mengatur kota default.');
    } finally {
      setIsSettingDefault(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => onPress(city)}
        activeOpacity={0.7}
      >
        <View style={styles.left}>
          {city.isDefault && (
            <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>Default</Text>
            </View>
          )}
          <Text style={[styles.name, { color: colors.text }]}>{city.name}</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            {[city.state, city.country].filter(Boolean).join(', ')}
          </Text>
        </View>

        <View style={styles.actions}>
          {/* ✅ Tombol Edit */}
          <TouchableOpacity
            onPress={() => {
              setEditName(city.name);
              setEditVisible(true);
            }}
            style={[styles.btn, (isDeleting || isUpdating || isSettingDefault) ? { opacity: 0.5 } : {}]}
            disabled={isDeleting || isUpdating || isSettingDefault}
          >
            <Ionicons name="pencil-outline" size={20} color={colors.primary} />
          </TouchableOpacity>

          {/* ✅ Tombol Set Default */}
          {!city.isDefault && (
            <TouchableOpacity
              onPress={handleSetDefault}
              style={[styles.btn, (isDeleting || isUpdating || isSettingDefault) ? { opacity: 0.5 } : {}]}
              disabled={isDeleting || isUpdating || isSettingDefault}
            >
              {isSettingDefault ? (
                <ActivityIndicator size={20} color={colors.warning} />
              ) : (
                <Ionicons name="star-outline" size={20} color={colors.warning} />
              )}
            </TouchableOpacity>
          )}

          {/* ✅ Tombol Delete */}
          <TouchableOpacity
            onPress={confirmDelete}
            style={[styles.btn, (isDeleting || isUpdating || isSettingDefault) ? { opacity: 0.5 } : {}]}
            disabled={isDeleting || isUpdating || isSettingDefault}
          >
            {isDeleting ? (
              <ActivityIndicator size={20} color={colors.error} />
            ) : (
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* ✅ Modal Edit Nama Kota */}
      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isUpdating && setEditVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              ✏️ Edit Nama Kota
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nama kota"
              placeholderTextColor={colors.textMuted}
              autoFocus
              editable={!isUpdating}
              onSubmitEditing={handleSaveEdit}
              returnKeyType="done"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => setEditVisible(false)}
                disabled={isUpdating}
              >
                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>
                  Batal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary, opacity: isUpdating ? 0.7 : 1 }]}
                onPress={handleSaveEdit}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size={18} color="#fff" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1,
  },
  left: { flex: 1 },
  badge: {
    alignSelf: 'flex-start', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 6, marginBottom: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { padding: 6 },

  // Modal styles
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: {
    width: '100%', borderRadius: 20,
    padding: 24, gap: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  input: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalBtn: {
    flex: 1, paddingVertical: 12,
    borderRadius: 12, alignItems: 'center',
  },
  modalBtnText: { fontWeight: '700', fontSize: 15 },
});