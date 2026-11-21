import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { PantryItem, PantrySnapshot } from '../types/pantry';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';

/** A scan result under review — in memory only until the user saves it. */
export interface PantryDraft {
  items: PantryItem[];
  useFirst: string[];
  /** Snapshot of what the scan returned, to compute edit stats on save. */
  original: PantryItem[];
}

interface PantryContextValue {
  snapshot: PantrySnapshot | null;
  draft: PantryDraft | null;
  startDraft: (items: PantryItem[], useFirst: string[]) => void;
  discardDraft: () => void;
  saveSnapshot: (items: PantryItem[], useFirst: string[]) => PantrySnapshot;
  /** Items to use first: flagged use-soon by the scan, or named in useFirst. */
  useFirstItems: PantryItem[];
}

const PantryContext = createContext<PantryContextValue | undefined>(undefined);

export function PantryProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<PantrySnapshot | null>(null);
  const [draft, setDraft] = useState<PantryDraft | null>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    loadFromStorage<PantrySnapshot>(STORAGE_KEYS.PANTRY_SNAPSHOT).then((stored) => {
      if (stored) setSnapshot(stored);
      isLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (isLoaded.current) saveToStorage(STORAGE_KEYS.PANTRY_SNAPSHOT, snapshot);
  }, [snapshot]);

  const startDraft = useCallback((items: PantryItem[], useFirst: string[]) => {
    setDraft({ items, useFirst, original: items });
  }, []);

  const discardDraft = useCallback(() => setDraft(null), []);

  const saveSnapshot = useCallback((items: PantryItem[], useFirst: string[]) => {
    const next: PantrySnapshot = {
      id: `pantry-${Date.now()}`,
      takenAt: new Date().toISOString(),
      items,
      useFirst,
    };
    setSnapshot(next);
    setDraft(null);
    return next;
  }, []);

  const useFirstItems = useMemo(() => {
    if (!snapshot) return [];
    const named = new Set(snapshot.useFirst);
    return snapshot.items.filter(
      (i) => i.freshness !== 'past' && (i.freshness === 'use-soon' || named.has(i.name))
    );
  }, [snapshot]);

  return (
    <PantryContext.Provider
      value={{ snapshot, draft, startDraft, discardDraft, saveSnapshot, useFirstItems }}
    >
      {children}
    </PantryContext.Provider>
  );
}

export function usePantry() {
  const context = useContext(PantryContext);
  if (!context) throw new Error('usePantry must be used within PantryProvider');
  return context;
}
