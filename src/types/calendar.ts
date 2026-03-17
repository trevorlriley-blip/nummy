import { MealType } from './recipe';

/** Time of day as hours (0-23) and minutes (0-59). Stored in 24h format. */
export interface TimeOfDay {
  hour: number;
  minute: number;
}

/** Default meal times keyed by meal type. */
export type MealTimeDefaults = Record<MealType, TimeOfDay>;

export const DEFAULT_MEAL_TIMES: MealTimeDefaults = {
  breakfast: { hour: 8, minute: 0 },
  lunch: { hour: 12, minute: 0 },
  dinner: { hour: 18, minute: 0 },
  snack: { hour: 15, minute: 0 },
  dessert: { hour: 20, minute: 0 },
};

/** Google OAuth tokens. */
export interface GoogleAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp in ms
}

/** Record of a sync operation for a specific meal plan. */
export interface CalendarSyncRecord {
  planId: string;
  syncedAt: string; // ISO timestamp
  eventIds: string[];
}

/** Persisted calendar feature state. */
export interface CalendarSettings {
  mealTimeDefaults: MealTimeDefaults;
  googleAuth: GoogleAuthTokens | null;
  syncHistory: CalendarSyncRecord[];
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

/** Shape of a Google Calendar event for the insert API. */
export interface CalendarEventPayload {
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
}
