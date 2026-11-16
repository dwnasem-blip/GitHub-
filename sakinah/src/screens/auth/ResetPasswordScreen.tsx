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
import { authService } from '@/services/authService';
import { FormInput } from '@/components/forms/FormInput';
import { Button } from '@/components/Button';
import { Colors, Spacing } from '@/constants/theme';

interface ResetPasswordFormData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface ResetPasswordScreenProps {
  token?: string;
  onResetSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  token = '',
  onResetSuccess,
  onNavigateToLogin,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isRTL = I18nManager.isRTL;

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    token,
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.token) {
      newErrors.token = 'Reset token is missing';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t('common.required');
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain an uppercase letter';
    } else if (!/[a-z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain a lowercase letter';
    } else if (!/[0-9]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain a number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('common.required');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Strong';
      case 4:
        return 'Very Strong';
      default:
        return '';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 1:
        return '#ef4444';
      case 2:
        return '#f59e0b';
      case 3:
        return '#3b82f6';
      case 4:
        return '#10b981';
      default:
        return 'transparent';
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await authService.confirmPasswordReset(formData.token, formData.newPassword);

      Alert.alert('Success', 'Your password has been reset successfully. You can now log in with your new password.', [
        {
          text: 'OK',
          onPress: () => {
            onResetSuccess?.();
            onNavigateToLogin?.();
          },
        },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
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
            {t('auth.resetPassword')}
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
            Enter your new password below to reset your account password.
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
          <View>
            <FormInput
              label={t('auth.password')}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={formData.newPassword}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, newPassword: text }));
                setPasswordStrength(authService.calculatePasswordStrength(text));
              }}
              error={errors.newPassword}
              editable={!isLoading}
              rtl={isRTL}
              required
            />

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <View style={styles.strengthContainer}>
                <View
                  style={[
                    styles.strengthBar,
                    {
                      width: `${(passwordStrength / 4) * 100}%`,
                      backgroundColor: getPasswordStrengthColor(),
                    },
                  ]}
                />
              </View>
            )}

            {formData.newPassword && (
              <Text
                style={[
                  styles.strengthLabel,
                  {
                    color: getPasswordStrengthColor(),
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {t('auth.passwordStrength')}: {getPasswordStrengthLabel()}
              </Text>
            )}
          </View>

          <FormInput
            label={t('auth.confirmPassword')}
            placeholder="••••••••"
            secureTextEntry={!showConfirmPassword}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, confirmPassword: text }))}
            error={errors.confirmPassword}
            editable={!isLoading}
            rtl={isRTL}
            required
          />

          {/* Reset Button */}
          <Button
            label={isLoading ? t('common.loading') : 'Reset Password'}
            onPress={handleResetPassword}
            variant="primary"
            size="lg"
            disabled={isLoading}
            loading={isLoading}
            fullWidth
            style={styles.resetButton}
          />

          {/* Back to Login Link */}
          <View style={styles.backToLoginLink}>
            <Button
              label="Back to Login"
              onPress={onNavigateToLogin}
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
    lineHeight: 20,
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
  strengthContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginVertical: Spacing.one,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: Spacing.one,
  },
  resetButton: {
    marginTop: Spacing.three,
  },
  backToLoginLink: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
});
