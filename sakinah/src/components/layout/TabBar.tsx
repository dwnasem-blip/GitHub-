import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle, Pressable, PressableProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { theme } from '@/theme';
import { Text } from '../typography/Text';
import { mergeStyles } from '@/utils/styleUtils';

export interface TabBarItemProps extends Omit<PressableProps, 'style'> {
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  active?: boolean;
  rtl?: boolean;
  style?: ViewStyle;
}

export interface TabBarProps extends ViewProps {
  rtl?: boolean;
  backgroundColor?: string;
  borderTopColor?: string;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    backgroundColor: theme.colors.semantic.background.secondary,
    minHeight: 56,
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    gap: theme.spacing[1],
  },
});

export const TabBar = React.forwardRef<View, TabBarProps>(
  ({ rtl = false, backgroundColor, borderTopColor, style, children, ...props }, ref) => {
    const { theme: themeObj } = useTheme();

    const containerStyle = mergeStyles(
      styles.container,
      {
        backgroundColor: backgroundColor || themeObj.colors.semantic.background.secondary,
        borderTopColor: borderTopColor || themeObj.colors.semantic.border.light,
        flexDirection: rtl ? 'row-reverse' : 'row',
      },
      style
    ) as ViewStyle;

    return (
      <View ref={ref} {...props} style={containerStyle}>
        {children}
      </View>
    );
  }
);
TabBar.displayName = 'TabBar';

export const TabBarItem = React.forwardRef<Pressable, TabBarItemProps>(
  ({ label, icon, badge, active = false, rtl = false, style, ...props }, ref) => {
    const { theme: themeObj } = useTheme();
    const itemStyle = mergeStyles(styles.itemContainer, { opacity: active ? 1 : 0.6, borderBottomWidth: active ? 2 : 0, borderBottomColor: active ? themeObj.colors.accent.main : 'transparent' }, style) as any;
    return (
      <Pressable ref={ref} {...props} style={({ pressed }) => [itemStyle, pressed && { opacity: 0.5 }]}>
        <View style={{ flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', gap: themeObj.spacing[1] }}>
          {icon && <View>{icon}</View>}
          <Text size="sm" weight={active ? 'semibold' : 'normal'} color={active ? 'primary' : 'secondary'}>
            {label}
          </Text>
        </View>
      </Pressable>
    );
  }
);
TabBarItem.displayName = 'TabBarItem';
