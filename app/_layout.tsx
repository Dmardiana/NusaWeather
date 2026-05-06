

// ============================================================
// NusaWeather — app/_layout.tsx (Root Layout)
// ============================================================
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { LoadingSpinner } from '../src/components/common/LoadingSpinner';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { UnitsProvider } from '../src/contexts/UnitsContext';
import { useAuth } from '../src/hooks/useAuth';

function RootLayoutInner() {
  const { isInitialized } = useAuth();
  const { isDark } = useTheme();
  if (!isInitialized) return <LoadingSpinner message="Memuat NusaWeather..." />;
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
export default function RootLayout() {
  return (
    <ThemeProvider>
      <UnitsProvider>
        <RootLayoutInner />
      </UnitsProvider>
    </ThemeProvider>
  );
}
