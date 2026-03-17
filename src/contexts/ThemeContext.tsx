import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const isLoaded = useRef(false);

  // Load persisted preference
  useEffect(() => {
    loadFromStorage<ThemeMode>(STORAGE_KEYS.THEME_PREFERENCE).then((stored) => {
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        setThemeModeState(stored);
      }
      isLoaded.current = true;
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    saveToStorage(STORAGE_KEYS.THEME_PREFERENCE, mode);
  }, []);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode must be used within ThemeProvider');
  return context;
}
