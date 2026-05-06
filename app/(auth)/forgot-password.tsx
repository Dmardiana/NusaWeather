// ============================================================
// NusaWeather — app/(auth)/forgot-password.tsx
// ============================================================
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthButton } from '../../src/components/auth/AuthButton';
import { AuthInput } from '../../src/components/auth/AuthInput';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/hooks/useAuth';
export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message);
  };

  const handle = async () => {
    if (!email.trim()) {
      showAlert('Error', 'Masukkan email kamu.');
      return;
    }
    try {
      await resetPassword(email.trim());
      if (Platform.OS === 'web') {
        showAlert('Berhasil', 'Link reset password telah dikirim ke email kamu.');
        router.back();
        return;
      }
      Alert.alert('Berhasil', 'Link reset password telah dikirim ke email kamu.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      showAlert('Gagal', e?.message || 'Terjadi kesalahan saat mengirim email reset.');
    }
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.icon}>🔑</Text>
      <Text style={[styles.title, { color: colors.text }]}>Lupa Kata Sandi</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Masukkan email yang terdaftar untuk menerima link reset
      </Text>
      <AuthInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="email@contoh.com"
      />
      <AuthButton label="Kirim Link Reset" onPress={handle} loading={isLoading} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  back: { marginBottom: 24 },
  icon: { fontSize: 48, textAlign: 'center' },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginTop: 8, marginBottom: 32 },
});
