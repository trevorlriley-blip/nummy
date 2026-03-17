import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { MealType } from '../types/recipe';
import { WeeklyMealPlan } from '../types/mealPlan';
import {
  TimeOfDay,
  MealTimeDefaults,
  GoogleAuthTokens,
  CalendarSyncRecord,
  CalendarSettings,
  SyncStatus,
  DEFAULT_MEAL_TIMES,
} from '../types/calendar';
import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from '../config/google';
import { syncWeeklyPlan, refreshAccessToken } from '../utils/calendarSync';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';

// Native redirect URI using the reversed iOS client ID scheme.
const EXPO_REDIRECT_URI = AuthSession.makeRedirectUri({
  native: 'com.googleusercontent.apps.169416195595-kigt759bogf7gl58e4hmech0au1lnop1:/oauth2redirect',
});

WebBrowser.maybeCompleteAuthSession();

interface CalendarContextValue {
  mealTimeDefaults: MealTimeDefaults;
  updateMealTime: (mealType: MealType, time: TimeOfDay) => void;
  isConnected: boolean;
  connectGoogle: () => void;
  disconnectGoogle: () => void;
  syncStatus: SyncStatus;
  syncError: string | null;
  syncPlanToCalendar: (plan: WeeklyMealPlan) => Promise<void>;
  isSynced: (planId: string) => boolean;
  syncHistory: CalendarSyncRecord[];
  isLoading: boolean;
}

const CalendarContext = createContext<CalendarContextValue | undefined>(undefined);

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [mealTimeDefaults, setMealTimeDefaults] = useState<MealTimeDefaults>(DEFAULT_MEAL_TIMES);
  const [googleAuth, setGoogleAuth] = useState<GoogleAuthTokens | null>(null);
  const [syncHistory, setSyncHistory] = useState<CalendarSyncRecord[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isLoaded = useRef(false);

  const redirectUri = EXPO_REDIRECT_URI;

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: GOOGLE_SCOPES,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      extraParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    discovery
  );

  // Load settings from storage
  useEffect(() => {
    loadFromStorage<CalendarSettings>(STORAGE_KEYS.CALENDAR_SETTINGS).then((stored) => {
      if (stored) {
        setMealTimeDefaults({ ...DEFAULT_MEAL_TIMES, ...stored.mealTimeDefaults });
        setGoogleAuth(stored.googleAuth);
        setSyncHistory(stored.syncHistory ?? []);
      }
      isLoaded.current = true;
      setIsLoading(false);
    });
  }, []);

  // Persist settings
  useEffect(() => {
    if (isLoaded.current) {
      const settings: CalendarSettings = { mealTimeDefaults, googleAuth, syncHistory };
      saveToStorage(STORAGE_KEYS.CALENDAR_SETTINGS, settings);
    }
  }, [mealTimeDefaults, googleAuth, syncHistory]);

  // Handle OAuth response
  useEffect(() => {
    if (response?.type === 'success' && response.params.code && request?.codeVerifier) {
      exchangeCodeForTokens(response.params.code, request.codeVerifier);
    }
  }, [response]);

  async function exchangeCodeForTokens(code: string, codeVerifier: string) {
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          code,
          code_verifier: codeVerifier,
          grant_type: 'authorization_code',
          redirect_uri: EXPO_REDIRECT_URI,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const data = await tokenResponse.json();
      setGoogleAuth({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      });
    } catch (e) {
      console.error('OAuth token exchange failed:', e);
    }
  }

  const isConnected = googleAuth !== null;

  const updateMealTime = useCallback((mealType: MealType, time: TimeOfDay) => {
    setMealTimeDefaults((prev) => ({ ...prev, [mealType]: time }));
  }, []);

  const connectGoogle = useCallback(() => {
    promptAsync();
  }, [promptAsync]);

  const disconnectGoogle = useCallback(() => {
    if (googleAuth?.accessToken) {
      // Best-effort revoke
      fetch(`https://oauth2.googleapis.com/revoke?token=${googleAuth.accessToken}`, {
        method: 'POST',
      }).catch(() => {});
    }
    setGoogleAuth(null);
  }, [googleAuth]);

  const getValidAccessToken = useCallback(async (): Promise<string> => {
    if (!googleAuth) throw new Error('Not connected to Google Calendar');

    if (googleAuth.expiresAt > Date.now() + 60_000) {
      return googleAuth.accessToken;
    }

    // Token expired, attempt refresh
    if (googleAuth.refreshToken) {
      const refreshed = await refreshAccessToken(googleAuth.refreshToken);
      setGoogleAuth((prev) =>
        prev ? { ...prev, accessToken: refreshed.accessToken, expiresAt: refreshed.expiresAt } : prev
      );
      return refreshed.accessToken;
    }

    // No refresh token, need to re-authenticate
    setGoogleAuth(null);
    throw new Error('Session expired. Please reconnect your Google account.');
  }, [googleAuth]);

  const syncPlanToCalendar = useCallback(
    async (plan: WeeklyMealPlan) => {
      setSyncStatus('syncing');
      setSyncError(null);

      try {
        const accessToken = await getValidAccessToken();
        const eventIds = await syncWeeklyPlan(plan, mealTimeDefaults, accessToken);

        const record: CalendarSyncRecord = {
          planId: plan.id,
          syncedAt: new Date().toISOString(),
          eventIds,
        };
        setSyncHistory((prev) => [record, ...prev]);
        setSyncStatus('success');
      } catch (e: any) {
        setSyncError(e.message || 'Failed to sync to calendar');
        setSyncStatus('error');
      }
    },
    [getValidAccessToken, mealTimeDefaults]
  );

  const isSynced = useCallback(
    (planId: string) => syncHistory.some((r) => r.planId === planId),
    [syncHistory]
  );

  return (
    <CalendarContext.Provider
      value={{
        mealTimeDefaults,
        updateMealTime,
        isConnected,
        connectGoogle,
        disconnectGoogle,
        syncStatus,
        syncError,
        syncPlanToCalendar,
        isSynced,
        syncHistory,
        isLoading,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) throw new Error('useCalendar must be used within CalendarProvider');
  return context;
}
