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

interface ForgotPasswordFormData {
  email: string;
}

interface FormErrors {
  email?: string;
}

export interface ForgotPasswordScreenProps {
  onResetRequestSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onResetRequestSuccess,
  onNavigateToLogin,
}) => {
  const { t } = useTranslation();
  const { resetPassword, isLoading, error } = useAuthContext();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isRTL = I18nManager.isRTL;

  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = t('common.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await resetPassword(formData.email);
      setSubmitted(true);
      Alert.alert(
        'Success',
        'Password reset instructions have been sent to your email address. Please check your email and follow the link to reset your password.',
        [
          {
            text: 'OK',
            onPress: () => {
              onResetRequestSuccess?.();
              onNavigateToLogin?.();
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Error', error || 'Failed to send reset email');
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
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        {/* Error Alert */}
        {error && (
          <View style={[styles.errorAlert, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Text style={styles.errorAlertText}>{error}</Text>
          </View>
        )}

        {/* Success Message */}
        {submitted && (
          <View style={[styles.successAlert, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Text style={styles.successAlertText}>
              Reset link has been sent to your email. Please check your inbox and follow the instructions.
            </Text>
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

          {/* Send Link Button */}
          <Button
            label={isLoading ? t('common.loading') : 'Send Reset Link'}
            onPress={handleResetPassword}
            variant="primary"
            size="lg"
            disabled={isLoading}
            loading={isLoading}
            fullWidth
            style={styles.sendButton}
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
  successAlert: {
    borderRadius: 8,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  successAlertText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  sendButton: {
    marginTop: Spacing.three,
  },
  backToLoginLink: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
});
