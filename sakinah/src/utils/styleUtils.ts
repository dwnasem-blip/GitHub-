import { ViewStyle, TextStyle } from 'react-native';
import { theme } from '@/theme';

type AllStyles = ViewStyle | TextStyle;

/**
 * Merges multiple style objects, with later ones overriding earlier ones
 */
export const mergeStyles = (...styles: (AllStyles | undefined)[]): AllStyles => {
  return styles.reduce((acc, style) => ({ ...acc, ...style }), {}) as AllStyles;
};

/**
 * Creates padding styles with support for RTL
 */
export const getPaddingStyles = (
  padding?: keyof typeof theme.spacing | number,
  rtl: boolean = false
): ViewStyle => {
  if (!padding) return {};

  const paddingValue = typeof padding === 'number' ? padding : theme.spacing[padding];

  return {
    paddingHorizontal: paddingValue,
    paddingVertical: paddingValue,
  };
};

/**
 * Creates margin styles with support for RTL
 */
export const getMarginStyles = (
  margin?: keyof typeof theme.spacing | number,
  rtl: boolean = false
): ViewStyle => {
  if (!margin) return {};

  const marginValue = typeof margin === 'number' ? margin : theme.spacing[margin];

  return {
    marginHorizontal: marginValue,
    marginVertical: marginValue,
  };
};

/**
 * Creates flexbox layout styles
 */
export const getFlexStyles = (
  direction: 'row' | 'column' = 'column',
  align: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' = 'center',
  justify:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly' = 'center',
  gap?: keyof typeof theme.spacing | number
): ViewStyle => {
  const styles: ViewStyle = {
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
  };

  if (gap) {
    const gapValue = typeof gap === 'number' ? gap : theme.spacing[gap];
    styles.gap = gapValue;
  }

  return styles;
};

/**
 * Creates border styles
 */
export const getBorderStyles = (
  radius?: keyof typeof theme.radius | number,
  borderColor?: string,
  borderWidth: number = 1
): ViewStyle => {
  const styles: ViewStyle = {
    borderWidth,
  };

  if (radius) {
    const radiusValue = typeof radius === 'number' ? radius : theme.radius[radius];
    styles.borderRadius = radiusValue;
  }

  if (borderColor) {
    styles.borderColor = borderColor;
  }

  return styles;
};

/**
 * Creates shadow styles
 */
export const getShadowStyles = (
  shadowSize?: keyof typeof theme.shadows
): ViewStyle => {
  if (!shadowSize || shadowSize === 'none') return {};

  const shadow = theme.shadows[shadowSize];
  if (shadow === 'none') return {};

  return shadow as ViewStyle;
};

/**
 * Creates text styles with RTL support
 */
export const getTextStyles = (
  fontSize?: keyof typeof theme.typography.fontSize | number,
  fontWeight?: keyof typeof theme.typography.fontWeight | string,
  lineHeight?: keyof typeof theme.typography.lineHeight | number,
  rtl: boolean = false
): TextStyle => {
  const styles: TextStyle = {};

  if (fontSize) {
    const fontSizeValue = typeof fontSize === 'number' ? fontSize : theme.typography.fontSize[fontSize];
    styles.fontSize = fontSizeValue;
  }

  if (fontWeight) {
    const fontWeightValue = typeof fontWeight === 'number' ? fontWeight : theme.typography.fontWeight[fontWeight as keyof typeof theme.typography.fontWeight];
    styles.fontWeight = fontWeightValue;
  }

  if (lineHeight) {
    const lineHeightValue = typeof lineHeight === 'number' ? lineHeight : theme.typography.lineHeight[lineHeight as keyof typeof theme.typography.lineHeight];
    styles.lineHeight = lineHeightValue;
  }

  styles.textAlign = rtl ? 'right' : 'left';

  return styles;
};

/**
 * Gets color value from theme
 */
export const getColor = (colorPath: string, isDark: boolean = true): string => {
  const colors = isDark ? theme.colors : theme.colors;

  const parts = colorPath.split('.');
  let result: any = colors;

  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part];
    } else {
      console.warn(`Color path not found: ${colorPath}`);
      return theme.colors.semantic.text.primary;
    }
  }

  return typeof result === 'string' ? result : theme.colors.semantic.text.primary;
};

/**
 * Creates a responsive size value based on screen size hints
 */
export const getResponsiveSize = (
  mobileSize: number,
  tabletSize?: number,
  desktopSize?: number
): number => {
  // Can be extended with react-native-dimension or similar
  return mobileSize;
};
