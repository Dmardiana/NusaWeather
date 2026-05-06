// ============================================================
// NusaWeather — app/(auth)/login.tsx
// ============================================================
import { Link } from 'expo-router';
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
import { APP, STR } from '../../src/constants';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/hooks/useAuth';
export default function LoginScreen() {
  const { colors } = useTheme();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const showError = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message);
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = STR.ERR_INVALID_EMAIL;
    if (!password) e.password = 'Password wajib diisi';
    setErrors(e);
    return !Object.keys(e).length;
  };
  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login({ email: email.trim(), password });
    } catch (e: any) {
      showError('Login Gagal', e?.message || 'Terjadi kesalahan saat login.');
    }
  };
  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>🌤️</Text>
          <Text style={[styles.appName, { color: colors.primary }]}>{APP.NAME}</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>{APP.TAGLINE}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Masuk</Text>
          <AuthInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="email@contoh.com"
            error={errors.email}
          />
          <AuthInput
            label="Kata Sandi"
            value={password}
            onChangeText={setPassword}
            placeholder="Minimal 6 karakter"
            isPassword
            error={errors.password}
          />
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>{STR.FORGOT_PW}</Text>
            </TouchableOpacity>
          </Link>
          <AuthButton label={STR.LOGIN} onPress={handleLogin} loading={isLoading} />
          <View style={styles.bottomRow}>
            <Text style={[styles.bottomText, { color: colors.textSecondary }]}>
              Belum punya akun?{' '}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={[styles.link, { color: colors.primary }]}>{STR.REGISTER}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 64 },
  appName: { fontSize: 32, fontWeight: '800', marginTop: 8 },
  tagline: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  card: { borderRadius: 24, padding: 24, borderWidth: 1 },
  cardTitle: { fontSize: 24, fontWeight: '800', marginBottom: 24, textAlign: 'center' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 16 },
  forgotText: { fontSize: 13, fontWeight: '600' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  bottomText: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: '700' },
});