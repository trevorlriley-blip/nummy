import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { WeekendRecap } from '../types/recap';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';

interface RecapState {
  recaps: WeekendRecap[];
  /** weekOf of the weekend whose Home card was dismissed. */
  dismissedWeek: string | null;
}

interface RecapContextValue extends RecapState {
  ready: boolean;
  /** Adds the recap, or replaces the one for the same week. */
  saveRecap: (recap: WeekendRecap) => void;
  dismissCard: (weekOf: string) => void;
  getRecap: (weekOf: string) => WeekendRecap | undefined;
}

const RecapContext = createContext<RecapContextValue | undefined>(undefined);

export function RecapProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RecapState>({ recaps: [], dismissedWeek: null });
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    loadFromStorage<Partial<RecapState>>(STORAGE_KEYS.RECAPS).then((stored) => {
      if (stored) setState({ recaps: stored.recaps ?? [], dismissedWeek: stored.dismissedWeek ?? null });
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) saveToStorage(STORAGE_KEYS.RECAPS, state);
  }, [state, ready]);

  const saveRecap = useCallback((recap: WeekendRecap) => {
    setState((s) => ({
      ...s,
      recaps: [...s.recaps.filter((r) => r.weekOf !== recap.weekOf), recap].sort((a, b) =>
        a.weekOf.localeCompare(b.weekOf)
      ),
    }));
  }, []);

  const dismissCard = useCallback((weekOf: string) => {
    setState((s) => ({ ...s, dismissedWeek: weekOf }));
  }, []);

  const getRecap = useCallback(
    (weekOf: string) => stateRef.current.recaps.find((r) => r.weekOf === weekOf),
    []
  );

  return (
    <RecapContext.Provider value={{ ...state, ready, saveRecap, dismissCard, getRecap }}>
      {children}
    </RecapContext.Provider>
  );
}

export function useRecaps() {
  const context = useContext(RecapContext);
  if (!context) throw new Error('useRecaps must be used within RecapProvider');
  return context;
}
