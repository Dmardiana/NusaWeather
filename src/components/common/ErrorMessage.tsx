// ============================================================
// NusaWeather — src/components/common/ErrorMessage.tsx
// ============================================================
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
interface Props { message: string; onRetry?: () => void }
export const ErrorMessage: React.FC<Props> = ({ message, onRetry }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={onRetry}>
          <Text style={styles.btnText}>Coba Lagi</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  icon: { fontSize: 48 },
  message: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});