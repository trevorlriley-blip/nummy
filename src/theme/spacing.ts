/**
 * Spacing scale and border-radius constants for the MealPlan App.
 *
 * Use these tokens instead of hard-coded numbers so the layout stays
 * consistent and can be adjusted from a single source of truth.
 */

// ---------------------------------------------------------------------------
// Spacing scale
// ---------------------------------------------------------------------------

export const spacing = {
  /** 4 px – extra-small gaps, tight icon padding */
  xs: 4,
  /** 8 px – small gaps, compact list padding */
  sm: 8,
  /** 16 px – default/medium spacing */
  md: 16,
  /** 24 px – large spacing, section margins */
  lg: 24,
  /** 32 px – extra-large spacing */
  xl: 32,
  /** 48 px – double-extra-large, page-level padding */
  xxl: 48,
} as const;

export type Spacing = typeof spacing;

// ---------------------------------------------------------------------------
// Border radius
// ---------------------------------------------------------------------------

export const borderRadius = {
  /** 8 px – subtle rounding (chips, small cards) */
  sm: 8,
  /** 12 px – default rounding (cards, buttons) – matches Paper roundness */
  md: 12,
  /** 16 px – pronounced rounding (modals, sheets) */
  lg: 16,
  /** 24 px – heavy rounding (pill-shaped elements) */
  xl: 24,
  /** 9999 px – fully circular (avatars, FABs) */
  full: 9999,
} as const;

export type BorderRadius = typeof borderRadius;

export default { spacing, borderRadius } as const;
