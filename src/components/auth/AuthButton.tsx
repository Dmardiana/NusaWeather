// ============================================================
// NusaWeather — src/components/auth/AuthButton.tsx
// ============================================================
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
}
export const AuthButton: React.FC<Props> = ({
  label, onPress, loading, disabled, variant = 'primary',
}) => {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        isPrimary
          ? { backgroundColor: colors.primary }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
        (loading || disabled) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={isPrimary ? '#fff' : colors.primary} />
        : <Text style={[styles.text, { color: isPrimary ? '#fff' : colors.primary }]}>{label}</Text>
      }
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  disabled: { opacity: 0.6 },
  text: { fontSize: 16, fontWeight: '700' },
});
