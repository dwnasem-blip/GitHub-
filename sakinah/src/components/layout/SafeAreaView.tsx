import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle, useSafeAreaInsets } from 'react-native';
import { mergeStyles } from '@/utils/styleUtils';

export interface SafeAreaViewProps extends ViewProps {
  paddingHorizontal?: boolean;
  paddingVertical?: boolean;
  paddingTop?: boolean;
  paddingBottom?: boolean;
  customPaddingHorizontal?: number;
  customPaddingVertical?: number;
  rtl?: boolean;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
});

export const SafeAreaView = React.forwardRef<View, SafeAreaViewProps>(
  (
    {
      paddingHorizontal = true,
      paddingVertical = true,
      paddingTop = true,
      paddingBottom = true,
      customPaddingHorizontal,
      customPaddingVertical,
      rtl = false,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();

    const safeAreaStyle: ViewStyle = {};

    if (paddingHorizontal) {
      safeAreaStyle.paddingLeft = customPaddingHorizontal || insets.left;
      safeAreaStyle.paddingRight = customPaddingHorizontal || insets.right;
    }

    if (paddingVertical) {
      if (paddingTop) {
        safeAreaStyle.paddingTop = customPaddingVertical || insets.top;
      }
      if (paddingBottom) {
        safeAreaStyle.paddingBottom = customPaddingVertical || insets.bottom;
      }
    }

    const containerStyle = mergeStyles(
      styles.base,
      safeAreaStyle,
      style
    ) as ViewStyle;

    return (
      <View ref={ref} {...props} style={containerStyle}>
        {children}
      </View>
    );
  }
);

SafeAreaView.displayName = 'SafeAreaView';
