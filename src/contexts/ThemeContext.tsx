// ============================================================
// NusaWeather — src/contexts/ThemeContext.tsx
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DarkColors, LightColors } from '../constants';
import { ThemeColors, ThemeMode } from '../types';

const STORAGE_KEY = '@nusa_theme';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  isDark: false,
  colors: LightColors,
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'light' || val === 'dark' || val === 'system') {
        setThemeState(val);
      }
      setReady(true);
    });
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode);
  };

  const isDark = theme === 'system' ? scheme === 'dark' : theme === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  const value = useMemo(
    () => ({ theme, isDark, colors, setTheme }),
    [theme, isDark, colors]
  );

  if (!ready) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);