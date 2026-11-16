import React from 'react';
import {
  View,
  ViewProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';
import { mergeStyles, getShadowStyles } from '@/utils/styleUtils';

export interface CardProps extends ViewProps {
  padding?: keyof typeof theme.spacing | number;
  paddingTop?: keyof typeof theme.spacing | number;
  paddingBottom?: keyof typeof theme.spacing | number;
  paddingLeft?: keyof typeof theme.spacing | number;
  paddingRight?: keyof typeof theme.spacing | number;
  paddingHorizontal?: keyof typeof theme.spacing | number;
  paddingVertical?: keyof typeof theme.spacing | number;
  shadow?: keyof typeof theme.shadows;
  radius?: keyof typeof theme.radius | number;
  bordered?: boolean;
  borderColor?: string;
  backgroundColor?: string;
  rtl?: boolean;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.semantic.background.secondary,
    overflow: 'hidden',
  },
});

export const Card = React.forwardRef<View, CardProps>(
  (
    {
      padding,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      paddingHorizontal,
      paddingVertical,
      shadow = 'md',
      radius = 'lg',
      bordered = false,
      borderColor,
      backgroundColor,
      rtl = false,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const { theme: themeObj } = useTheme();

    const getPaddingValue = (p?: keyof typeof themeObj.spacing | number): number | undefined => {
      if (p === undefined) return undefined;
      return typeof p === 'number' ? p : themeObj.spacing[p];
    };

    const paddingStyles: ViewStyle = {};

    if (padding !== undefined) {
      const p = getPaddingValue(padding);
      if (p) {
        paddingStyles.paddingHorizontal = p;
        paddingStyles.paddingVertical = p;
      }
    } else {
      if (paddingHorizontal !== undefined) {
        const p = getPaddingValue(paddingHorizontal);
        if (p) paddingStyles.paddingHorizontal = p;
      }
      if (paddingVertical !== undefined) {
        const p = getPaddingValue(paddingVertical);
        if (p) paddingStyles.paddingVertical = p;
      }
      if (paddingTop !== undefined) {
        const p = getPaddingValue(paddingTop);
        if (p) paddingStyles.paddingTop = p;
      }
      if (paddingBottom !== undefined) {
        const p = getPaddingValue(paddingBottom);
        if (p) paddingStyles.paddingBottom = p;
      }
      if (paddingLeft !== undefined) {
        const p = getPaddingValue(paddingLeft);
        if (p) paddingStyles.paddingLeft = p;
      }
      if (paddingRight !== undefined) {
        const p = getPaddingValue(paddingRight);
        if (p) paddingStyles.paddingRight = p;
      }
    }

    const radiusValue = typeof radius === 'number' ? radius : themeObj.radius[radius];

    const baseStyle = mergeStyles(
      styles.base,
      {
        borderRadius: radiusValue,
        backgroundColor: backgroundColor || themeObj.colors.semantic.background.secondary,
        ...(bordered && {
          borderWidth: 1,
          borderColor: borderColor || themeObj.colors.semantic.border.light,
        }),
      },
      getShadowStyles(shadow),
      paddingStyles,
      style
    ) as ViewStyle;

    return (
      <View
        ref={ref}
        {...props}
        style={baseStyle}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = 'Card';
