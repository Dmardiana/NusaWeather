// ============================================================
// NusaWeather — app/(auth)/register.tsx
// ============================================================
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View,
} from 'react-native';
import { AuthButton } from '../../src/components/auth/AuthButton';
import { AuthInput } from '../../src/components/auth/AuthInput';
import { LIMITS, STR } from '../../src/constants';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/hooks/useAuth';
export default function RegisterScreen() {
  const { colors } = useTheme();
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showError = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nama wajib diisi';
    if (!email.trim()) e.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = STR.ERR_INVALID_EMAIL;
    if (!password) e.password = 'Password wajib diisi';
    else if (password.length < LIMITS.MIN_PASSWORD) e.password = STR.ERR_WEAK_PW;
    if (password !== confirm) e.confirm = 'Password tidak cocok';
    setErrors(e);
    return !Object.keys(e).length;
  };
  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({ email: email.trim(), password, displayName: name.trim() });
    } catch (e: any) {
      showError('Registrasi Gagal', e?.message || 'Terjadi kesalahan saat registrasi.');
    }
  };
  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Buat Akun</Text>
          <AuthInput label="Nama Lengkap" value={name} onChangeText={setName}
            placeholder="Nama kamu" autoCapitalize="words" error={errors.name} />
          <AuthInput label="Email" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
            placeholder="email@contoh.com" error={errors.email} />
          <AuthInput label="Kata Sandi" value={password} onChangeText={setPassword}
            placeholder="Minimal 6 karakter" isPassword error={errors.password} />
          <AuthInput label="Konfirmasi Kata Sandi" value={confirm} onChangeText={setConfirm}
            placeholder="Ulangi password" isPassword error={errors.confirm} />
          <AuthButton label={STR.REGISTER} onPress={handleRegister} loading={isLoading} />
          <View style={styles.bottomRow}>
            <Text style={[styles.bottomText, { color: colors.textSecondary }]}>
              Sudah punya akun?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.link, { color: colors.primary }]}>{STR.LOGIN}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { borderRadius: 24, padding: 24, borderWidth: 1 },
  cardTitle: { fontSize: 24, fontWeight: '800', marginBottom: 24, textAlign: 'center' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  bottomText: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: '700' },
});