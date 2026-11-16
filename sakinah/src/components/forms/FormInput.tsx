import React from 'react';
import {
  TextInput,
  View,
  Text,
  TextInputProps,
  StyleSheet,
  useColorScheme,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  rtl?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const FormInput = React.forwardRef<TextInput, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      rtl = false,
      containerStyle,
      inputStyle,
      required = false,
      disabled = false,
      icon,
      rightIcon,
      style,
      placeholderTextColor,
      editable,
      ...props
    },
    ref
  ) => {
    const colorScheme = useColorScheme();
    const theme = useTheme();
    const isDark = colorScheme === 'dark';

    const textAlign = rtl ? 'right' : 'left';
    const paddingLeft = rtl ? Spacing.three : icon ? Spacing.four + Spacing.three : Spacing.three;
    const paddingRight = rtl ? (icon ? Spacing.four + Spacing.three : Spacing.three) : Spacing.three;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text
            style={[
              styles.label,
              {
                color: isDark ? Colors.dark.text : Colors.light.text,
                textAlign: rtl ? 'right' : 'left',
              },
            ]}
          >
            {label}
            {required && <Text style={{ color: '#ef4444' }}> *</Text>}
          </Text>
        )}

        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: isDark ? Colors.dark.backgroundElement : Colors.light.backgroundElement,
              borderColor: error ? '#ef4444' : isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected,
              opacity: disabled ? 0.6 : 1,
            },
          ]}
        >
          {icon && <View style={[styles.icon, { left: rtl ? undefined : Spacing.two }]}>{icon}</View>}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: isDark ? Colors.dark.text : Colors.light.text,
                paddingLeft,
                paddingRight,
                textAlign,
              },
              inputStyle,
              style,
            ]}
            placeholderTextColor={placeholderTextColor || (isDark ? Colors.dark.textSecondary : Colors.light.textSecondary)}
            editable={editable !== false && !disabled}
            selectTextOnFocus={!disabled}
            {...props}
          />

          {rightIcon && <View style={[styles.icon, { right: rtl ? undefined : Spacing.two }]}>{rightIcon}</View>}
        </View>

        {error && (
          <Text
            style={[
              styles.errorText,
              {
                textAlign: rtl ? 'right' : 'left',
              },
            ]}
          >
            {error}
          </Text>
        )}

        {helperText && !error && (
          <Text
            style={[
              styles.helperText,
              {
                color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
                textAlign: rtl ? 'right' : 'left',
              },
            ]}
          >
            {helperText}
          </Text>
        )}
      </View>
    );
  }
);

FormInput.displayName = 'FormInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.two,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: Spacing.one,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    marginTop: Spacing.one,
  },
});
