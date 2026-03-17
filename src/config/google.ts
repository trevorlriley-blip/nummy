/**
 * Google OAuth configuration.
 *
 * To set up:
 * 1. Go to https://console.cloud.google.com
 * 2. Create a project and enable the Google Calendar API
 * 3. Create OAuth 2.0 credentials (Web application type for Expo Go)
 * 4. Add authorized redirect URI: https://auth.expo.io/@{your-username}/nummy
 * 5. Replace the client ID below with your own
 */
export const GOOGLE_CLIENT_ID = '169416195595-kigt759bogf7gl58e4hmech0au1lnop1.apps.googleusercontent.com';

export const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
