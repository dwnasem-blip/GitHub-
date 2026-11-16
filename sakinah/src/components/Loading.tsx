import React from 'react';
import {
  View,
  ViewProps,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';
import { Text } from './typography/Text';

export interface LoadingProps extends ViewProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  message?: string;
  rtl?: boolean;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing[4],
  },
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.semantic.background.primary,
  },
  contentContainer: {
    alignItems: 'center',
    gap: theme.spacing[3],
  },
});

export const Loading = React.forwardRef<View, LoadingProps>(
  (
    {
      size = 'large',
      color,
      fullScreen = false,
      message,
      rtl = false,
      style,
      ...props
    },
    ref
  ) => {
    const { theme: themeObj } = useTheme();

    const containerStyle: ViewStyle = {
      ...styles.container,
      ...(fullScreen && styles.fullScreen),
    };

    const indicatorColor = color || themeObj.colors.accent.main;

    return (
      <View
        ref={ref}
        {...props}
        style={[containerStyle, style]}
      >
        <View style={styles.contentContainer}>
          <ActivityIndicator
            size={size}
            color={indicatorColor}
          />
          {message && (
            <Text
              size="base"
              color="secondary"
              align={rtl ? 'right' : 'center'}
              rtl={rtl}
            >
              {message}
            </Text>
          )}
        </View>
      </View>
    );
  }
);

Loading.displayName = 'Loading';
