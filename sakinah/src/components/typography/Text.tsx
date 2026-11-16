import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';

export interface TextProps extends RNTextProps {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'custom';
  customColor?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  lineHeight?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  rtl?: boolean;
  style?: TextStyle;
}

const styles = StyleSheet.create({
  base: {
    color: theme.colors.semantic.text.primary,
  },
});

export const Text = React.forwardRef<RNText, TextProps>(
  (
    {
      size = 'base',
      weight = 'normal',
      color = 'primary',
      customColor,
      align = 'left',
      lineHeight,
      rtl = false,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const { theme: themeObj } = useTheme();

    const getTextColor = (): string => {
      if (customColor) return customColor;

      switch (color) {
        case 'primary':
          return themeObj.colors.semantic.text.primary;
        case 'secondary':
          return themeObj.colors.semantic.text.secondary;
        case 'tertiary':
          return themeObj.colors.semantic.text.tertiary;
        case 'error':
          return themeObj.colors.status.error;
        case 'success':
          return themeObj.colors.status.success;
        default:
          return themeObj.colors.semantic.text.primary;
      }
    };

    const getFontSize = (): number => {
      return themeObj.typography.fontSize[size];
    };

    const getFontWeight = (): TextStyle['fontWeight'] => {
      return themeObj.typography.fontWeight[weight];
    };

    const getLineHeight = (): number => {
      if (lineHeight) {
        return getFontSize() * themeObj.typography.lineHeight[lineHeight];
      }
      return getFontSize() * themeObj.typography.lineHeight.normal;
    };

    const computedStyle: TextStyle = {
      color: getTextColor(),
      fontSize: getFontSize(),
      fontWeight: getFontWeight(),
      lineHeight: getLineHeight(),
      textAlign: rtl ? 'right' : align,
    };

    return (
      <RNText
        ref={ref}
        {...props}
        style={[styles.base, computedStyle, style]}
      >
        {children}
      </RNText>
    );
  }
);

Text.displayName = 'Text';
