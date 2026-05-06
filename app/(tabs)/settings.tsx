// ============================================================
// NusaWeather — app/(tabs)/settings.tsx
// ============================================================
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Keyboard,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { APP, STR } from '../../src/constants';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useUnits } from '../../src/contexts/UnitsContext';
import { useAuth } from '../../src/hooks/useAuth';
import { TempUnit } from '../../src/types';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, setTheme, isDark } = useTheme();
  const { tempUnit, setTempUnit, windUnit, setWindUnit } = useUnits();
  const { user, logout, updateDisplayName, isLoading } = useAuth(); // ✅ tambah updateDisplayName, hapus firestoreService

  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState(user?.displayName ?? '');
  const [isSaving, setIsSaving] = useState(false);

const handleLogout = () => {
  if (isLoading) return;

  const runLogout = async () => {
    try {
      await logout();
      router.dismissAll();
      router.replace('/login');
    } catch (e: any) {
      Alert.alert('Gagal Logout', e.message);
    }
  };

  if (Platform.OS === 'web') {
    const confirmed = typeof window !== 'undefined' ? window.confirm('Yakin ingin keluar?') : false;
    if (confirmed) {
      void runLogout();
    }
    return;
  }

  Alert.alert(
    'Logout',                    // ✅ hardcode, bukan STR.LOGOUT
    'Yakin ingin keluar?',
    [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Logout',          // ✅ hardcode, bukan STR.LOGOUT
        style: 'destructive',
        onPress: () => void runLogout(),
      },
    ]
  );
};

  // ✅ Fix: Update profile dengan proper error handling & real-time update
  const handleSaveProfile = async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Nama tidak boleh kosong.');
      return;
    }
    
    // Cegah double submit
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // ✅ Update Firebase Auth + Firestore + local store
      await updateDisplayName(trimmed);
      
      // ✅ Dismiss keyboard & close modal DULU sebelum show alert
      Keyboard.dismiss();
      setEditVisible(false);
      
      // ✅ Beri delay kecil agar modal sempat menutup sebelum alert muncul
      setTimeout(() => {
        Alert.alert('Berhasil! ✅', `Nama profil berhasil diubah menjadi "${trimmed}"`);
      }, 100);
    } catch (e: any) {
      // ✅ Show error message jika gagal
      Keyboard.dismiss();
      const errorMsg = e.message || 'Tidak bisa menyimpan profil.';
      Alert.alert('Gagal ❌', errorMsg);
      console.error('Save profile error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const Row = ({ icon, label, right }: { icon: string; label: string; right: React.ReactNode }) => (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{icon}</Text>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      {right}
    </View>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      {children}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.profileName}>{user?.displayName ?? 'Pengguna'}</Text>
        <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>

        {user && (
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => {
              Keyboard.dismiss();
              setEditName(user?.displayName ?? '');
              setIsSaving(false);
              setEditVisible(true);
            }}
          >
            <Ionicons name="pencil-outline" size={14} color="#fff" />
            <Text style={styles.editProfileText}>Edit Profil</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Appearance */}
      <Section title="TAMPILAN">
        <Row icon={isDark ? '🌙' : '☀️'} label="Mode Gelap"
          right={
            <Switch value={isDark} onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={isDark ? colors.primary : '#f4f3f4'} />
          }
        />
      </Section>

      {/* Units */}
      <Section title="SATUAN">
        <Row icon="🌡️" label="Suhu"
          right={
            <View style={styles.unitRow}>
              {(['celsius', 'fahrenheit'] as TempUnit[]).map((u) => (
                <TouchableOpacity key={u}
                  style={[styles.unitBtn, tempUnit === u && { backgroundColor: colors.primary }]}
                  onPress={() => setTempUnit(u)}
                >
                  <Text style={[styles.unitText, { color: tempUnit === u ? '#fff' : colors.textSecondary }]}>
                    {u === 'celsius' ? '°C' : '°F'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          }
        />
        <Row icon="💨" label="Kecepatan Angin"
          right={
            <View style={styles.unitRow}>
              {(['ms', 'kmh', 'mph'] as const).map((u) => (
                <TouchableOpacity key={u}
                  style={[styles.unitBtn, windUnit === u && { backgroundColor: colors.primary }]}
                  onPress={() => setWindUnit(u)}
                >
                  <Text style={[styles.unitText, { color: windUnit === u ? '#fff' : colors.textSecondary }]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          }
        />
      </Section>

      {/* About */}
      <Section title="TENTANG">
        <Row icon="📱" label={`${APP.NAME} v${APP.VERSION}`} right={null} />
        <Row icon="🌐" label={APP.TAGLINE} right={null} />
      </Section>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: colors.error, opacity: isLoading ? 0.7 : 1 }]}
        onPress={handleLogout}
        disabled={isLoading}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>{STR.LOGOUT}</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />

      {/* Modal Edit Profile */}
      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              ✏️ Edit Profil
            </Text>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Nama Tampilan
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
              onSubmitEditing={handleSaveProfile}
              placeholder="Masukkan nama kamu"
              placeholderTextColor={colors.textMuted}
              autoFocus
              editable={!isSaving}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => setEditVisible(false)}
                disabled={isSaving}
              >
                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>
                  Batal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary, opacity: isSaving ? 0.7 : 1 }]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileCard: { paddingTop: 64, paddingBottom: 32, alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  profileName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  profileEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  editProfileBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 12, paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.25)',
  },
  editProfileText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  section: { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  sectionTitle: { fontSize: 12, fontWeight: '700', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowIcon: { fontSize: 20, marginRight: 12 },
  rowLabel: { fontSize: 15 },
  unitRow: { flexDirection: 'row', gap: 4 },
  unitBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'transparent' },
  unitText: { fontSize: 13, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, paddingVertical: 16, borderRadius: 16, borderWidth: 1,
  },
  logoutText: { fontSize: 16, fontWeight: '700' },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: { width: '100%', borderRadius: 20, padding: 24, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  inputLabel: { fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { fontWeight: '700', fontSize: 15 },
});