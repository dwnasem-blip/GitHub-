import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';

export interface CaptionProps extends RNTextProps {
  variant?: 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'tertiary' | 'custom';
  customColor?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  rtl?: boolean;
  style?: TextStyle;
}

const styles = StyleSheet.create({
  base: {
    color: theme.colors.semantic.text.tertiary,
  },
});

export const Caption = React.forwardRef<RNText, CaptionProps>(
  (
    {
      variant = 'caption',
      color = 'tertiary',
      customColor,
      align = 'left',
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
        default:
          return themeObj.colors.semantic.text.tertiary;
      }
    };

    const getCaptionStyle = (): TextStyle => {
      const styleKey = variant as keyof typeof themeObj.typography.styles;
      const captionStyle = themeObj.typography.styles[styleKey];

      return {
        fontSize: captionStyle.fontSize,
        fontWeight: captionStyle.fontWeight,
        lineHeight: captionStyle.lineHeight * captionStyle.fontSize,
        letterSpacing: captionStyle.letterSpacing,
      };
    };

    const computedStyle: TextStyle = {
      color: getTextColor(),
      ...getCaptionStyle(),
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

Caption.displayName = 'Caption';
