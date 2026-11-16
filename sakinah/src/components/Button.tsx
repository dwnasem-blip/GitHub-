import React from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableProps,
  View,
  ActivityIndicator,
} from 'react-native';
import { Text } from './typography/Text';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';
import { mergeStyles, getShadowStyles } from '@/utils/styleUtils';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  label: string;
  icon?: React.ReactNode;
  rtl?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  // Sizes
  sm: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    minHeight: 32,
  },
  md: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    minHeight: 44,
  },
  lg: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    minHeight: 56,
  },
  // Variants
  primaryBase: {
    backgroundColor: theme.colors.accent.main,
  },
  secondaryBase: {
    backgroundColor: theme.colors.neutral[700],
  },
  outlineBase: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.accent.main,
  },
  ghostBase: {
    backgroundColor: 'transparent',
  },
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
});

export const Button = React.forwardRef<Pressable, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      label,
      icon,
      rtl = false,
      style,
      textStyle,
      fullWidth = false,
      ...rest
    },
    ref
  ) => {
    const { theme: themeObj } = useTheme();

    const getVariantStyles = (): ViewStyle => {
      switch (variant) {
        case 'primary':
          return styles.primaryBase;
        case 'secondary':
          return styles.secondaryBase;
        case 'outline':
          return styles.outlineBase;
        case 'ghost':
          return styles.ghostBase;
        default:
          return styles.primaryBase;
      }
    };

    const getSizeStyles = (): ViewStyle => {
      switch (size) {
        case 'sm':
          return styles.sm;
        case 'md':
          return styles.md;
        case 'lg':
          return styles.lg;
        default:
          return styles.md;
      }
    };

    const getTextColor = (): string => {
      if (variant === 'outline' || variant === 'ghost') {
        return themeObj.colors.accent.main;
      }
      return themeObj.colors.semantic.text.primary;
    };

    const containerStyle = mergeStyles(
      styles.base,
      getSizeStyles(),
      getVariantStyles(),
      disabled && styles.disabled,
      fullWidth && styles.fullWidth,
      getShadowStyles(size === 'lg' ? 'md' : 'sm'),
      style
    ) as ViewStyle;

    const textStyleComputed = mergeStyles(
      {
        color: getTextColor(),
      },
      textStyle
    ) as TextStyle;

    const contentStyle = mergeStyles({
      flexDirection: rtl ? 'row-reverse' : 'row',
    }) as ViewStyle;

    return (
      <Pressable
        ref={ref}
        {...rest}
        disabled={disabled || loading}
        style={({ pressed }) => [
          containerStyle,
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={contentStyle}>
          {loading ? (
            <ActivityIndicator color={getTextColor()} size={size === 'sm' ? 'small' : 'large'} />
          ) : (
            icon && icon
          )}
          <Text
            style={textStyleComputed}
            weight="semibold"
            size={size === 'sm' ? 'sm' : 'base'}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    );
  }
);

Button.displayName = 'Button';
