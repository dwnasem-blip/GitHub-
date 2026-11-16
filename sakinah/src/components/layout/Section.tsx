import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';
import { mergeStyles } from '@/utils/styleUtils';
import { Heading } from '../typography/Heading';

export interface SectionProps extends ViewProps {
  title?: string;
  subtitle?: string;
  padding?: keyof typeof theme.spacing | number;
  gap?: keyof typeof theme.spacing | number;
  divider?: boolean;
  bordered?: boolean;
  backgroundColor?: string;
  rtl?: boolean;
  style?: ViewStyle;
}

const styles = StyleSheet.create({ base: { width: '100%' }, content: { gap: theme.spacing[3] } });

export const Section = React.forwardRef<View, SectionProps>(
  ({ title, subtitle, padding, gap = 3, divider = false, bordered = false, backgroundColor, rtl = false, style, children, ...props }, ref) => {
    const { theme: themeObj } = useTheme();
    const getPaddingValue = (p?: keyof typeof themeObj.spacing | number): number | undefined => (p === undefined ? undefined : typeof p === 'number' ? p : themeObj.spacing[p]);
    const paddingStyles: ViewStyle = {};
    if (padding !== undefined) { const p = getPaddingValue(padding); if (p) { paddingStyles.paddingHorizontal = p; paddingStyles.paddingVertical = p; } }
    const gapValue = typeof gap === 'number' ? gap : themeObj.spacing[gap];
    const containerStyle = mergeStyles(styles.base, paddingStyles, { gap: gapValue, ...(bordered && { borderWidth: 1, borderColor: themeObj.colors.semantic.border.light, borderRadius: themeObj.radius.lg }), ...(backgroundColor && { backgroundColor }) }, style) as ViewStyle;
    return (
      <View ref={ref} {...props} style={containerStyle}>
        {(title || subtitle) && (<View>{title && (<Heading level={3} color="primary" align={rtl ? 'right' : 'left'} rtl={rtl}>{title}</Heading>)}{subtitle && (<Heading level={6} color="secondary" align={rtl ? 'right' : 'left'} rtl={rtl} style={{ marginTop: themeObj.spacing[1] }}>{subtitle}</Heading>)}</View>)}
        {divider && (title || subtitle) && <View style={{ height: 1, backgroundColor: themeObj.colors.semantic.border.light }} />}
        <View style={{ gap: gapValue }}>{children}</View>
      </View>
    );
  }
);
Section.displayName = 'Section';
