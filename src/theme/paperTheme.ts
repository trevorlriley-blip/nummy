/**
 * React Native Paper MD3 custom theme for the MealPlan App.
 *
 * Maps the "Warm & Earthy" palette onto Material Design 3 color tokens so
 * every Paper component automatically picks up the correct brand colors.
 */

import { MD3LightTheme, MD3DarkTheme, type MD3Theme } from 'react-native-paper';
import {
  terracotta,
  olive,
  golden,
  cream,
  brown,
  gray,
  white,
  black,
  semantic,
} from './colors';

// ---------------------------------------------------------------------------
// Light theme
// ---------------------------------------------------------------------------

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,

  roundness: 12,

  colors: {
    ...MD3LightTheme.colors,

    // ---- Primary (terracotta) ----
    primary: terracotta[500],
    onPrimary: white,
    primaryContainer: terracotta[100],
    onPrimaryContainer: terracotta[900],

    // ---- Secondary (olive) ----
    secondary: olive[500],
    onSecondary: white,
    secondaryContainer: olive[100],
    onSecondaryContainer: olive[900],

    // ---- Tertiary (golden) ----
    tertiary: golden[500],
    onTertiary: white,
    tertiaryContainer: golden[100],
    onTertiaryContainer: golden[900],

    // ---- Error ----
    error: semantic.error.main,
    onError: white,
    errorContainer: '#FDECEA',
    onErrorContainer: semantic.error.dark,

    // ---- Background & Surface ----
    background: cream[100],
    onBackground: brown[500],

    surface: white,
    onSurface: brown[500],

    surfaceVariant: cream[200],
    onSurfaceVariant: brown[400],

    surfaceDisabled: gray[200],
    onSurfaceDisabled: gray[500],

    // ---- Outline ----
    outline: gray[400],
    outlineVariant: gray[300],

    // ---- Inverse ----
    inverseSurface: brown[700],
    inverseOnSurface: cream[100],
    inversePrimary: terracotta[200],

    // ---- Elevation overlays ----
    elevation: {
      level0: 'transparent',
      level1: cream[50],
      level2: cream[100],
      level3: cream[200],
      level4: cream[300],
      level5: cream[400],
    },

    // ---- Miscellaneous ----
    shadow: black,
    scrim: black,
    backdrop: 'rgba(62, 39, 35, 0.4)',
  },
};

// ---------------------------------------------------------------------------
// Dark theme
// ---------------------------------------------------------------------------

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,

  roundness: 12,

  colors: {
    ...MD3DarkTheme.colors,

    // ---- Primary (lighter terracotta for dark bg) ----
    primary: terracotta[300],
    onPrimary: terracotta[900],
    primaryContainer: terracotta[800],
    onPrimaryContainer: terracotta[100],

    // ---- Secondary (lighter olive) ----
    secondary: olive[300],
    onSecondary: olive[900],
    secondaryContainer: olive[800],
    onSecondaryContainer: olive[100],

    // ---- Tertiary (lighter golden) ----
    tertiary: golden[300],
    onTertiary: golden[900],
    tertiaryContainer: golden[800],
    onTertiaryContainer: golden[100],

    // ---- Error ----
    error: semantic.error.light,
    onError: '#3E0000',
    errorContainer: '#5C1616',
    onErrorContainer: '#FDECEA',

    // ---- Background & Surface ----
    background: brown[900],
    onBackground: cream[200],

    surface: brown[800],
    onSurface: cream[200],

    surfaceVariant: brown[700],
    onSurfaceVariant: cream[400],

    surfaceDisabled: gray[800],
    onSurfaceDisabled: gray[600],

    // ---- Outline ----
    outline: gray[600],
    outlineVariant: gray[700],

    // ---- Inverse ----
    inverseSurface: cream[200],
    inverseOnSurface: brown[700],
    inversePrimary: terracotta[600],

    // ---- Elevation overlays ----
    elevation: {
      level0: 'transparent',
      level1: brown[800],
      level2: brown[700],
      level3: '#3A2822',
      level4: '#44302A',
      level5: '#4E3832',
    },

    // ---- Miscellaneous ----
    shadow: black,
    scrim: black,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

// Keep backward-compatible export name
export const paperTheme = lightTheme;

// ---------------------------------------------------------------------------
// Exported type
// ---------------------------------------------------------------------------

/**
 * Use `AppTheme` anywhere you need to type-check against the custom theme,
 * e.g. with `useTheme<AppTheme>()` from react-native-paper.
 */
export type AppTheme = typeof lightTheme;

export default paperTheme;
