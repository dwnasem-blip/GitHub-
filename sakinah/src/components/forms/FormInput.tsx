import React from 'react';
import { TextInput, View, TextInputProps, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';
import { Text } from '../typography/Text';
import { mergeStyles } from '@/utils/styleUtils';

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

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing[3] },
  label: { marginBottom: theme.spacing[1] },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: theme.radius.md, paddingVertical: theme.spacing[2], paddingHorizontal: theme.spacing[2], minHeight: 48 },
  input: { flex: 1, fontSize: theme.typography.fontSize.base, paddingVertical: theme.spacing[2] },
  iconWrapper: { justifyContent: 'center', alignItems: 'center', width: 24, height: 24 },
  errorText: { marginTop: theme.spacing[1] },
  helperText: { marginTop: theme.spacing[1] },
});

export const FormInput = React.forwardRef<TextInput, FormInputProps>(
  ({ label, error, helperText, rtl = false, containerStyle, inputStyle, required = false, disabled = false, icon, rightIcon, style, placeholderTextColor, editable, ...props }, ref) => {
    const { theme: themeObj } = useTheme();
    const paddingLeft = rtl ? 0 : icon ? themeObj.spacing[4] : themeObj.spacing[2];
    const paddingRight = rtl ? (icon ? themeObj.spacing[4] : themeObj.spacing[2]) : 0;
    const inputWrapperStyle = mergeStyles(styles.inputWrapper, { backgroundColor: themeObj.colors.semantic.background.tertiary, borderColor: error ? themeObj.colors.status.error : themeObj.colors.semantic.border.light, opacity: disabled ? 0.6 : 1 }, containerStyle) as ViewStyle;
    const computedInputStyle = mergeStyles(styles.input, { color: themeObj.colors.semantic.text.primary, textAlign: rtl ? 'right' : 'left', paddingLeft, paddingRight }, inputStyle, style) as TextStyle;
    return (
      <View style={styles.container}>
        {label && (<Text style={styles.label} size="sm" weight="semibold" color="primary" rtl={rtl}>{label}{required && <Text size="sm" weight="semibold" customColor={themeObj.colors.status.error}> *</Text>}</Text>)}
        <View style={inputWrapperStyle}>
          {icon && !rtl && <View style={styles.iconWrapper}>{icon}</View>}
          <TextInput ref={ref} {...props} editable={editable !== false && !disabled} selectTextOnFocus={!disabled} placeholderTextColor={placeholderTextColor || themeObj.colors.semantic.text.tertiary} style={computedInputStyle} />
          {rightIcon && <View style={styles.iconWrapper}>{rightIcon}</View>}
          {icon && rtl && <View style={styles.iconWrapper}>{icon}</View>}
        </View>
        {error && (<Text style={styles.errorText} size="xs" color="error" align={rtl ? 'right' : 'left'} rtl={rtl}>{error}</Text>)}
        {helperText && !error && (<Text style={styles.helperText} size="xs" color="tertiary" align={rtl ? 'right' : 'left'} rtl={rtl}>{helperText}</Text>)}
      </View>
    );
  }
);
FormInput.displayName = 'FormInput';
