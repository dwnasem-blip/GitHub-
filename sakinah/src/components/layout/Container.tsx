import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';
import { mergeStyles } from '@/utils/styleUtils';

export interface ContainerProps extends ViewProps {
  maxWidth?: number;
  padding?: keyof typeof theme.spacing | number;
  paddingHorizontal?: keyof typeof theme.spacing | number;
  paddingVertical?: keyof typeof theme.spacing | number;
  fullWidth?: boolean;
  centered?: boolean;
  rtl?: boolean;
  style?: ViewStyle;
}

const styles = StyleSheet.create({ base: { width: '100%' }, centered: { marginHorizontal: 'auto' } });

export const Container = React.forwardRef<View, ContainerProps>(
  ({ maxWidth, padding, paddingHorizontal, paddingVertical, fullWidth = true, centered = false, rtl = false, style, children, ...props }, ref) => {
    const { theme: themeObj } = useTheme();
    const getPaddingValue = (p?: keyof typeof themeObj.spacing | number): number | undefined => (p === undefined ? undefined : typeof p === 'number' ? p : themeObj.spacing[p]);
    const paddingStyles: any = {};
    if (padding !== undefined) {
      const p = getPaddingValue(padding);
      if (p) { paddingStyles.paddingHorizontal = p; paddingStyles.paddingVertical = p; }
    } else {
      if (paddingHorizontal !== undefined) { const p = getPaddingValue(paddingHorizontal); if (p) paddingStyles.paddingHorizontal = p; }
      if (paddingVertical !== undefined) { const p = getPaddingValue(paddingVertical); if (p) paddingStyles.paddingVertical = p; }
    }
    const containerStyle = mergeStyles(styles.base, paddingStyles, centered && styles.centered, maxWidth && { maxWidth }, !fullWidth && { width: 'auto' }, style) as ViewStyle;
    return <View ref={ref} {...props} style={containerStyle}>{children}</View>;
  }
);
Container.displayName = 'Container';
