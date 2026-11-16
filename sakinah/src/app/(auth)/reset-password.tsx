import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Text, useColorScheme } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '@/services/authService';
import { Colors } from '@/constants/theme';

export default function ResetPasswordPage() {
  const { token } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      setIsLoading(true);
      await authService.confirmPasswordReset(token as string, password);
      Alert.alert('Success', 'Password reset successfully', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>Reset Password</Text>

      <TextInput placeholder="New Password" value={password} onChangeText={setPassword} secureTextEntry editable={!isLoading} style={[styles.input, { color: isDark ? Colors.dark.text : Colors.light.text, borderColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected, backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement }]} />
      <TextInput placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry editable={!isLoading} style={[styles.input, { color: isDark ? Colors.dark.text : Colors.light.text, borderColor: isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected, backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement }]} />

      <TouchableOpacity onPress={handleReset} disabled={isLoading} style={styles.button}>
        <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'Reset Password'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={{ color: '#3b82f6', textAlign: 'center', marginTop: 15 }}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, padding: 12, marginBottom: 15, borderRadius: 8, minHeight: 48 },
  button: { backgroundColor: '#2d8b56', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
