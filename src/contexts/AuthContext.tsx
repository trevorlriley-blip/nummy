import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const SESSION_KEY = '@nummy_session';

interface AuthUser {
  id: string;
  email: string;
  user_metadata: Record<string, any>;
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function authFetch(path: string, body: object, token?: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return res.json();
  } catch (e: any) {
    return { error: e?.message ?? 'Network error' };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY).then((stored) => {
      if (stored) {
        try {
          setSession(JSON.parse(stored));
        } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  const persistSession = async (s: AuthSession | null) => {
    setSession(s);
    if (s) {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const data = await authFetch('/signup', {
      email,
      password,
      data: { display_name: displayName },
    });

    if (data.error || data.error_description || data.msg) {
      return { error: data.error_description || data.msg || data.error || 'Sign up failed' };
    }
    if (!data.access_token) {
      return { error: 'Sign up failed — please try again.' };
    }

    await persistSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
    });
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const data = await authFetch('/token?grant_type=password', { email, password });

    if (data.error || data.error_description) {
      return { error: data.error_description || data.error || 'Sign in failed' };
    }
    if (!data.access_token) {
      return { error: 'Invalid email or password.' };
    }

    await persistSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
    });
    return { error: null };
  };

  const signOut = async () => {
    if (session?.access_token) {
      authFetch('/logout', {}, session.access_token).catch(() => {});
    }
    await persistSession(null);
  };

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      isLoading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
