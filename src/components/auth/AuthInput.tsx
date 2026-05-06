// ============================================================
// NusaWeather — src/components/auth/AuthInput.tsx
// ============================================================
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
interface Props extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}
export const AuthInput: React.FC<Props> = ({ label, error, isPassword, ...rest }) => {
  const { colors } = useTheme();
  const [show, setShow] = useState(false);
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[
        styles.inputBox,
        { backgroundColor: colors.surfaceVariant, borderColor: error ? colors.error : colors.border }
      ]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !show}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShow(!show)} style={styles.eye}>
            <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};
const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 16,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 14 },
  eye: { padding: 4 },
  error: { fontSize: 12, marginTop: 4 },
});
