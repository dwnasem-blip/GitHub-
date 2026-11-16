import React, { useState, useCallback } from 'react';
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
import { colors } from '@/theme/colors';
import { authService } from '@/services/authService';

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface SignUpScreenProps {
  onSignUpSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUpSuccess, onNavigateToLogin }) => {
  const { t } = useTranslation();
  const { signUp, isLoading, error } = useAuthContext();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isRTL = I18nManager.isRTL;

  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('common.required');
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t('auth.fullName') + ' must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = t('common.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = t('common.required');
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain an uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain a lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain a number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('common.required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = useCallback((text: string) => {
    setFormData((prev) => ({ ...prev, password: text }));
    setPasswordStrength(authService.calculatePasswordStrength(text));
  }, []);

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

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.fullName);
      Alert.alert(
        'Success',
        'Account created successfully! Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: onSignUpSuccess,
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', error || 'Failed to create account');
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
            {t('auth.createAccount')}
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
            {t('auth.or')} {t('auth.haveAccount')}
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
            label={t('auth.fullName')}
            placeholder="John Doe"
            value={formData.fullName}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, fullName: text }))}
            error={errors.fullName}
            editable={!isLoading}
            rtl={isRTL}
            required
          />

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

          <View>
            <FormInput
              label={t('auth.password')}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={handlePasswordChange}
              error={errors.password}
              editable={!isLoading}
              rtl={isRTL}
              required
            />

            {/* Password Strength Indicator */}
            {formData.password && (
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

            {formData.password && (
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

          {/* Sign Up Button */}
          <Button
            label={isLoading ? t('common.loading') : t('auth.signUp')}
            onPress={handleSignUp}
            variant="primary"
            size="lg"
            disabled={isLoading}
            loading={isLoading}
            fullWidth
            style={styles.signUpButton}
          />

          {/* Login Link */}
          <View style={[styles.loginLink, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text
              style={{
                color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
              }}
            >
              {t('auth.haveAccount')} {' '}
            </Text>
            <Button
              label={t('auth.signIn')}
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
  signUpButton: {
    marginTop: Spacing.three,
  },
  loginLink: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
});
