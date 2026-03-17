/**
 * Warm & Earthy color palette for the MealPlan App.
 *
 * Each palette color provides shades from 50 (lightest) to 900 (darkest).
 * Semantic colors, neutrals (gray), and common helpers (white / black / transparent)
 * are also exported for convenience.
 */

// ---------------------------------------------------------------------------
// Palette colors
// ---------------------------------------------------------------------------

export const terracotta = {
  50: '#FBE9E2',
  100: '#F5C9B8',
  200: '#EFA78C',
  300: '#E88560',
  400: '#E26B40',
  500: '#C75B39',
  600: '#B04E30',
  700: '#944027',
  800: '#78331E',
  900: '#5C2615',
} as const;

export const olive = {
  50: '#F0F3E4',
  100: '#D9E0BC',
  200: '#C0CC92',
  300: '#A7B768',
  400: '#93A74D',
  500: '#6B7B3A',
  600: '#5D6C32',
  700: '#4D5A29',
  800: '#3E4820',
  900: '#2E3617',
} as const;

export const cream = {
  50: '#FFFDF8',
  100: '#FFF9EE',
  200: '#FFF4DE',
  300: '#FFEDCA',
  400: '#FFE5B4',
  500: '#F5D89A',
  600: '#E0C47F',
  700: '#C9AC64',
  800: '#B0944C',
  900: '#8F7636',
} as const;

export const brown = {
  50: '#EFEBE9',
  100: '#D7CCC8',
  200: '#BCAAA4',
  300: '#A1887F',
  400: '#8D6E63',
  500: '#3E2723',
  600: '#37211D',
  700: '#2E1B17',
  800: '#251511',
  900: '#1B0F0B',
} as const;

export const golden = {
  50: '#FDF6E3',
  100: '#FAE9B8',
  200: '#F5DA89',
  300: '#F0CB5A',
  400: '#ECBF36',
  500: '#D4A017',
  600: '#BB8C13',
  700: '#9E750F',
  800: '#815E0B',
  900: '#644807',
} as const;

// ---------------------------------------------------------------------------
// Neutral grays
// ---------------------------------------------------------------------------

export const gray = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#EEEEEE',
  300: '#E0E0E0',
  400: '#BDBDBD',
  500: '#9E9E9E',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
} as const;

// ---------------------------------------------------------------------------
// Semantic colors
// ---------------------------------------------------------------------------

export const semantic = {
  success: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
  },
  warning: {
    light: '#FFD54F',
    main: '#FFC107',
    dark: '#FFA000',
  },
  error: {
    light: '#E57373',
    main: '#D32F2F',
    dark: '#B71C1C',
  },
  info: {
    light: '#64B5F6',
    main: '#2196F3',
    dark: '#1565C0',
  },
} as const;

// ---------------------------------------------------------------------------
// Common helpers
// ---------------------------------------------------------------------------

export const white = '#FFFFFF' as const;
export const black = '#000000' as const;
export const transparent = 'transparent' as const;

// ---------------------------------------------------------------------------
// Aggregated palette export
// ---------------------------------------------------------------------------

export const colors = {
  terracotta,
  olive,
  cream,
  brown,
  golden,
  gray,
  semantic,
  white,
  black,
  transparent,
} as const;

export type Colors = typeof colors;

export default colors;
