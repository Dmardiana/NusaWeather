// ============================================================
// NusaWeather — src/components/common/GradientBackground.tsx
// ============================================================
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
interface Props {
  colors: string[];
  children: React.ReactNode;
  style?: ViewStyle;
}
export const GradientBackground: React.FC<Props> = ({ colors, children, style }) => (
  <LinearGradient colors={colors as any} style={[styles.fill, style]}>
    {children}
  </LinearGradient>
);
const styles = StyleSheet.create({ fill: { flex: 1 } });
