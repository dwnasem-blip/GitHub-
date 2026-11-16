import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { colors } from '@/theme/colors';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  fullWidth?: boolean;
  rtl?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  labelStyle,
  fullWidth = false,
  rtl = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getBackgroundColor = () => {
    if (disabled) {
      return isDark ? Colors.dark.backgroundSelected : Colors.light.backgroundSelected;
    }

    switch (variant) {
      case 'primary':
        return colors.accent.main;
      case 'secondary':
        return colors.primary.light;
      case 'outline':
        return 'transparent';
      case 'danger':
        return '#ef4444';
      default:
        return colors.accent.main;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? Colors.dark.textSecondary : colors.accent.main;
    }
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'outline') {
      return colors.accent.main;
    }
    return '#ffffff';
  };

  const getSizeStyles = (): { paddingVertical: number; paddingHorizontal: number; minHeight: number } => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: Spacing.one,
          paddingHorizontal: Spacing.two,
          minHeight: 36,
        };
      case 'lg':
        return {
          paddingVertical: Spacing.two,
          paddingHorizontal: Spacing.four,
          minHeight: 56,
        };
      case 'md':
      default:
        return {
          paddingVertical: Spacing.two,
          paddingHorizontal: Spacing.three,
          minHeight: 48,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          minHeight: sizeStyles.minHeight,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled && !loading ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color: getTextColor(),
              textAlign: 'center',
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
