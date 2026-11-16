import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';

export interface HeadingProps extends RNTextProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  color?: 'primary' | 'secondary' | 'accent' | 'custom';
  customColor?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  rtl?: boolean;
  style?: TextStyle;
}

const styles = StyleSheet.create({ base: { color: theme.colors.semantic.text.primary } });

export const Heading = React.forwardRef<RNText, HeadingProps>(
  ({ level = 1, color = 'primary', customColor, align = 'left', rtl = false, style, children, ...props }, ref) => {
    const { theme: themeObj } = useTheme();
    const getTextColor = (): string => {
      if (customColor) return customColor;
      switch (color) {
        case 'primary': return themeObj.colors.semantic.text.primary;
        case 'secondary': return themeObj.colors.semantic.text.secondary;
        case 'accent': return themeObj.colors.accent.main;
        default: return themeObj.colors.semantic.text.primary;
      }
    };
    const styleKey = `h${level}` as keyof typeof themeObj.typography.styles;
    const headingStyle = themeObj.typography.styles[styleKey];
    const computedStyle: TextStyle = {
      color: getTextColor(),
      fontSize: headingStyle.fontSize,
      fontWeight: headingStyle.fontWeight,
      lineHeight: headingStyle.lineHeight * headingStyle.fontSize,
      letterSpacing: headingStyle.letterSpacing,
      textAlign: rtl ? 'right' : align,
    };
    return <RNText ref={ref} {...props} style={[styles.base, computedStyle, style]}>{children}</RNText>;
  }
);
Heading.displayName = 'Heading';
