import React from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';
import { mergeStyles, getBorderStyles } from '@/utils/styleUtils';

export interface InputProps extends TextInputProps {
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rtl?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  inputBase: {
    flex: 1,
    color: theme.colors.semantic.text.primary,
    fontSize: theme.typography.fontSize.base,
  },
  textAlign: {
    textAlign: 'left',
  },
});

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      variant = 'outlined',
      size = 'md',
      error = false,
      disabled = false,
      icon,
      rightIcon,
      rtl = false,
      containerStyle,
      inputStyle,
      placeholderTextColor,
      editable,
      style,
      ...props
    },
    ref
  ) => {
    const { theme: themeObj } = useTheme();

    const getSizeStyles = (): ViewStyle => {
      switch (size) {
        case 'sm':
          return {
            paddingVertical: themeObj.spacing[2],
            paddingHorizontal: themeObj.spacing[2],
            minHeight: 32,
          };
        case 'md':
          return {
            paddingVertical: themeObj.spacing[3],
            paddingHorizontal: themeObj.spacing[3],
            minHeight: 44,
          };
        case 'lg':
          return {
            paddingVertical: themeObj.spacing[4],
            paddingHorizontal: themeObj.spacing[4],
            minHeight: 56,
          };
        default:
          return {
            paddingVertical: themeObj.spacing[3],
            paddingHorizontal: themeObj.spacing[3],
            minHeight: 44,
          };
      }
    };

    const getVariantStyles = (): ViewStyle => {
      switch (variant) {
        case 'filled':
          return {
            backgroundColor: themeObj.colors.semantic.background.tertiary,
            borderRadius: themeObj.radius.md,
          };
        case 'outlined':
          return {
            backgroundColor: 'transparent',
            borderRadius: themeObj.radius.md,
            borderWidth: 1,
            borderColor: error
              ? themeObj.colors.status.error
              : themeObj.colors.semantic.border.light,
          };
        case 'default':
        default:
          return {
            backgroundColor: themeObj.colors.semantic.background.tertiary,
            borderBottomWidth: 1,
            borderBottomColor: error
              ? themeObj.colors.status.error
              : themeObj.colors.semantic.border.light,
            borderRadius: 0,
          };
      }
    };

    const baseContainerStyle = mergeStyles(
      styles.container,
      getSizeStyles(),
      getVariantStyles(),
      disabled && { opacity: 0.6 },
      containerStyle
    ) as ViewStyle;

    const computedInputStyle = mergeStyles(
      styles.inputBase,
      {
        textAlign: rtl ? 'right' : 'left',
      },
      inputStyle,
      style
    ) as TextStyle;

    const paddingLeft = rtl ? 0 : icon ? themeObj.spacing[2] : 0;
    const paddingRight = rtl ? (icon ? themeObj.spacing[2] : 0) : 0;

    return (
      <View style={baseContainerStyle}>
        {icon && !rtl && <View style={styles.iconWrapper}>{icon}</View>}

        <TextInput
          ref={ref}
          {...props}
          editable={editable !== false && !disabled}
          selectTextOnFocus={!disabled}
          placeholderTextColor={
            placeholderTextColor || themeObj.colors.semantic.text.tertiary
          }
          style={[
            computedInputStyle,
            {
              paddingLeft,
              paddingRight,
            },
          ]}
        />

        {rightIcon && <View style={styles.iconWrapper}>{rightIcon}</View>}
        {icon && rtl && <View style={styles.iconWrapper}>{icon}</View>}
      </View>
    );
  }
);

Input.displayName = 'Input';
