import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';

export interface TextProps extends RNTextProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'custom';
  customColor?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  rtl?: boolean;
  style?: TextStyle;
  flex?: number;
}

const styles = StyleSheet.create({ base: { color: theme.colors.semantic.text.primary } });

export const Text = React.forwardRef<RNText, TextProps>(
  ({ size = 'base', weight = 'normal', color = 'primary', customColor, align = 'left', rtl = false, style, flex, children, ...props }, ref) => {
    const { theme: themeObj } = useTheme();
    const getTextColor = (): string => {
      if (customColor) return customColor;
      switch (color) {
        case 'primary': return themeObj.colors.semantic.text.primary;
        case 'secondary': return themeObj.colors.semantic.text.secondary;
        case 'tertiary': return themeObj.colors.semantic.text.tertiary;
        case 'error': return themeObj.colors.status.error;
        case 'success': return themeObj.colors.status.success;
        default: return themeObj.colors.semantic.text.primary;
      }
    };
    const fontSize = themeObj.typography.fontSize[size];
    const fontWeight = themeObj.typography.fontWeight[weight];
    const lineHeight = fontSize * themeObj.typography.lineHeight.normal;
    const computedStyle: TextStyle = { color: getTextColor(), fontSize, fontWeight, lineHeight, textAlign: rtl ? 'right' : align, ...(flex && { flex }) };
    return <RNText ref={ref} {...props} style={[styles.base, computedStyle, style]}>{children}</RNText>;
  }
);
Text.displayName = 'Text';
