import { ViewStyle } from 'react-native';
import { theme } from '@/theme';

export interface LayoutOptions {
  rtl?: boolean;
  isDark?: boolean;
}

/**
 * Creates a centered flex layout
 */
export const createCenteredLayout = (): ViewStyle => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

/**
 * Creates a space-between flex layout
 */
export const createSpaceBetweenLayout = (direction: 'row' | 'column' = 'row'): ViewStyle => ({
  flexDirection: direction,
  justifyContent: 'space-between',
  alignItems: direction === 'row' ? 'center' : 'stretch',
});

/**
 * Creates a full-width/height layout
 */
export const createFullLayout = (): ViewStyle => ({
  width: '100%',
  height: '100%',
});

/**
 * Creates RTL-aware flexbox layout
 */
export const createFlexLayout = (
  direction: 'row' | 'column' = 'column',
  align: 'flex-start' | 'flex-end' | 'center' | 'stretch' = 'flex-start',
  justify: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' = 'flex-start',
  options: LayoutOptions = {}
): ViewStyle => {
  const style: ViewStyle = {
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
  };

  if (direction === 'row' && options.rtl) {
    // For RTL, we might need to adjust the flex direction
    // This would typically be handled by react-native's I18nManager
  }

  return style;
};

/**
 * Creates padding for safe area
 */
export const createSafeAreaPadding = (
  topPadding?: keyof typeof theme.spacing | number,
  bottomPadding?: keyof typeof theme.spacing | number,
  sidePadding?: keyof typeof theme.spacing | number
): ViewStyle => {
  const style: ViewStyle = {};

  if (topPadding) {
    const value = typeof topPadding === 'number' ? topPadding : theme.spacing[topPadding];
    style.paddingTop = value;
  }

  if (bottomPadding) {
    const value = typeof bottomPadding === 'number' ? bottomPadding : theme.spacing[bottomPadding];
    style.paddingBottom = value;
  }

  if (sidePadding) {
    const value = typeof sidePadding === 'number' ? sidePadding : theme.spacing[sidePadding];
    style.paddingHorizontal = value;
  }

  return style;
};

/**
 * Creates container constraints (max-width, etc.)
 */
export const createContainerConstraints = (maxWidth?: number): ViewStyle => {
  const style: ViewStyle = {
    width: '100%',
  };

  if (maxWidth) {
    style.maxWidth = maxWidth;
  }

  return style;
};

/**
 * Creates a responsive aspect ratio
 */
export const createAspectRatio = (width: number, height: number): ViewStyle => ({
  aspectRatio: width / height,
});

/**
 * Creates absolute positioning styles
 */
export const createAbsolutePosition = (
  top?: number,
  right?: number,
  bottom?: number,
  left?: number
): ViewStyle => ({
  position: 'absolute',
  top,
  right,
  bottom,
  left,
});

/**
 * Creates RTL-aware left/right positioning
 */
export const createRTLAwarePosition = (
  value: number,
  position: 'left' | 'right',
  rtl: boolean = false
): ViewStyle => {
  if (rtl && position === 'left') {
    return { right: value };
  }
  if (rtl && position === 'right') {
    return { left: value };
  }

  return { [position]: value };
};

/**
 * Creates a grid layout
 */
export const createGridLayout = (
  columns: number,
  gap?: keyof typeof theme.spacing | number
): ViewStyle => {
  const gapValue = gap ? (typeof gap === 'number' ? gap : theme.spacing[gap]) : 0;

  return {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: gapValue,
    marginHorizontal: -(gapValue / 2),
  };
};

/**
 * Creates a grid item
 */
export const createGridItem = (
  columns: number,
  gap?: keyof typeof theme.spacing | number
): ViewStyle => {
  const gapValue = gap ? (typeof gap === 'number' ? gap : theme.spacing[gap]) : 0;
  const itemWidth = `${100 / columns}%`;

  return {
    width: itemWidth,
    paddingHorizontal: gapValue / 2,
    marginBottom: gapValue,
  };
};

/**
 * Creates a divider layout
 */
export const createDividerLayout = (
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  color?: string
): ViewStyle => {
  if (orientation === 'horizontal') {
    return {
      height: 1,
      width: '100%',
      backgroundColor: color || theme.colors.semantic.border.light,
    };
  }

  return {
    width: 1,
    height: '100%',
    backgroundColor: color || theme.colors.semantic.border.light,
  };
};

/**
 * Creates a tab layout
 */
export const createTabLayout = (): ViewStyle => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTopWidth: 1,
  borderTopColor: theme.colors.semantic.border.light,
  backgroundColor: theme.colors.semantic.background.secondary,
});

/**
 * Creates a modal overlay layout
 */
export const createModalOverlay = (): ViewStyle => ({
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
});

/**
 * Creates a modal content layout
 */
export const createModalContent = (): ViewStyle => ({
  backgroundColor: theme.colors.semantic.background.primary,
  borderRadius: theme.radius.lg,
  overflow: 'hidden',
  ...theme.shadows.lg,
});
