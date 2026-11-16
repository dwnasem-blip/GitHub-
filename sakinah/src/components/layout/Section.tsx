import React from 'react';
import {
  View,
  ViewProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';
import { mergeStyles } from '@/utils/styleUtils';
import { Heading } from '../typography/Heading';

export interface SectionProps extends ViewProps {
  title?: string;
  subtitle?: string;
  padding?: keyof typeof theme.spacing | number;
  paddingTop?: keyof typeof theme.spacing | number;
  paddingBottom?: keyof typeof theme.spacing | number;
  paddingHorizontal?: keyof typeof theme.spacing | number;
  paddingVertical?: keyof typeof theme.spacing | number;
  gap?: keyof typeof theme.spacing | number;
  divider?: boolean;
  bordered?: boolean;
  backgroundColor?: string;
  rtl?: boolean;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
  },
  content: {
    gap: theme.spacing[3],
  },
  header: {
    marginBottom: theme.spacing[2],
  },
  title: {
    marginBottom: theme.spacing[1],
  },
  subtitle: {
    marginTop: theme.spacing[1],
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: theme.colors.semantic.border.light,
  },
});

export const Section = React.forwardRef<View, SectionProps>(
  (
    {
      title,
      subtitle,
      padding,
      paddingTop,
      paddingBottom,
      paddingHorizontal,
      paddingVertical,
      gap = 3,
      divider = false,
      bordered = false,
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
    }

    const gapValue = typeof gap === 'number' ? gap : themeObj.spacing[gap];

    const containerStyle = mergeStyles(
      styles.base,
      paddingStyles,
      {
        gap: gapValue,
        ...(bordered && {
          borderWidth: 1,
          borderColor: themeObj.colors.semantic.border.light,
          borderRadius: themeObj.radius.lg,
        }),
        ...(backgroundColor && { backgroundColor }),
      },
      style
    ) as ViewStyle;

    return (
      <View
        ref={ref}
        {...props}
        style={containerStyle}
      >
        {(title || subtitle) && (
          <View style={styles.header}>
            {title && (
              <Heading
                level={3}
                color="primary"
                align={rtl ? 'right' : 'left'}
                rtl={rtl}
                style={styles.title}
              >
                {title}
              </Heading>
            )}
            {subtitle && (
              <Heading
                level={6}
                color="secondary"
                align={rtl ? 'right' : 'left'}
                rtl={rtl}
                style={styles.subtitle}
              >
                {subtitle}
              </Heading>
            )}
          </View>
        )}

        {divider && (title || subtitle) && <View style={styles.divider} />}

        <View style={{ gap: gapValue }}>
          {children}
        </View>
      </View>
    );
  }
);

Section.displayName = 'Section';
