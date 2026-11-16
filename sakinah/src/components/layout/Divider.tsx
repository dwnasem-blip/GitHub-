import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';

export interface DividerProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  thickness?: number;
  margin?: keyof typeof theme.spacing | number;
  rtl?: boolean;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
    height: 1,
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});

export const Divider = React.forwardRef<View, DividerProps>(
  (
    {
      orientation = 'horizontal',
      color,
      thickness = 1,
      margin,
      rtl = false,
      style,
      ...props
    },
    ref
  ) => {
    const { theme: themeObj } = useTheme();

    const getMarginValue = (m?: keyof typeof themeObj.spacing | number): number | undefined => {
      if (m === undefined) return undefined;
      return typeof m === 'number' ? m : themeObj.spacing[m];
    };

    const marginStyles: ViewStyle = {};
    if (margin !== undefined) {
      const m = getMarginValue(margin);
      if (m) {
        marginStyles.marginHorizontal = m;
        marginStyles.marginVertical = m;
      }
    }

    const dividerStyle: ViewStyle = {
      ...(orientation === 'horizontal' ? styles.horizontal : styles.vertical),
      height: orientation === 'horizontal' ? thickness : '100%',
      width: orientation === 'vertical' ? thickness : '100%',
      backgroundColor: color || themeObj.colors.semantic.border.light,
      ...marginStyles,
    };

    return <View ref={ref} {...props} style={[dividerStyle, style]} />;
  }
);

Divider.displayName = 'Divider';
