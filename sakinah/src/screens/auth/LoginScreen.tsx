import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Text,
  Alert,
  I18nManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '@/context/AuthContext';
import { FormInput } from '@/components/forms/FormInput';
import { Button } from '@/components/Button';
import { Colors, Spacing } from '@/constants/theme';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onNavigateToSignUp?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToSignUp,
  onNavigateToForgotPassword,
}) => {
  const { t } = useTranslation();
  const { login, isLoading, error } = useAuthContext();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isRTL = I18nManager.isRTL;

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = t('common.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = t('common.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      onLoginSuccess?.();
    } catch (err) {
      Alert.alert('Error', error || 'Failed to login');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: isDark ? Colors.dark.text : Colors.light.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {t('auth.signIn')}
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {t('auth.or')} {t('auth.noAccount')}
          </Text>
        </View>

        {/* Error Alert */}
        {error && (
          <View style={[styles.errorAlert, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Text style={styles.errorAlertText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <FormInput
            label={t('auth.email')}
            placeholder="user@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
            error={errors.email}
            editable={!isLoading}
            rtl={isRTL}
            required
          />

          <FormInput
            label={t('auth.password')}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, password: text }))}
            error={errors.password}
            editable={!isLoading}
            rtl={isRTL}
            required
          />

          {/* Login Button */}
          <Button
            label={isLoading ? t('common.loading') : t('auth.signIn')}
            onPress={handleLogin}
            variant="primary"
            size="lg"
            disabled={isLoading}
            loading={isLoading}
            fullWidth
            style={styles.loginButton}
          />

          {/* Forgot Password Link */}
          <View style={styles.forgotPasswordLink}>
            <Button
              label={t('auth.forgotPassword')}
              onPress={onNavigateToForgotPassword}
              variant="outline"
              size="sm"
              disabled={isLoading}
            />
          </View>

          {/* Sign Up Link */}
          <View style={[styles.signUpLink, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text
              style={{
                color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
              }}
            >
              {t('auth.noAccount')} {' '}
            </Text>
            <Button
              label={t('auth.signUp')}
              onPress={onNavigateToSignUp}
              variant="outline"
              size="sm"
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.four,
  },
  header: {
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
  },
  errorAlert: {
    borderRadius: 8,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  errorAlertText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  loginButton: {
    marginTop: Spacing.three,
  },
  forgotPasswordLink: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  signUpLink: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
});
