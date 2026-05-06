// ============================================================
// NusaWeather — app/(auth)/_layout.tsx
// ============================================================
import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../../src/stores/auth.store';

export default function AuthLayout() {
  const { user, isInitialized } = useAuthStore();

  // Tunggu Firebase selesai cek auth state
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1628' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (user) return <Redirect href="/" />;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}