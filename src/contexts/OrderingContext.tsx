import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { BrandPreference, CompletedOrder, GroceryRequest, OrderedItem, Staple } from '../types/ordering';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';
import { normalizeName } from '../utils/pantryMatch';
import { logEvent } from '../utils/testLog';

interface OrderingState {
  staples: Staple[];
  requests: GroceryRequest[];
  defaultBrand: BrandPreference;
  /** Per-item brand override, keyed by normalized item name. */
  brandOverrides: Record<string, BrandPreference>;
  /** ISO time the current Smith's order was started; null when no order is in progress. */
  orderStartedAt: string | null;
  /** Item ids checked off in the current order (separate from the in-store isChecked). */
  orderChecked: Record<string, true>;
  /** The most recent completed order (checked items only), used by the Weekend Recap. */
  lastOrder: CompletedOrder | null;
}

const INITIAL: OrderingState = {
  staples: [],
  requests: [],
  defaultBrand: 'store',
  brandOverrides: {},
  orderStartedAt: null,
  orderChecked: {},
  lastOrder: null,
};

interface OrderingContextValue extends OrderingState {
  /** False until persisted state has loaded. */
  ready: boolean;
  addStaple: (staple: Omit<Staple, 'id'>) => void;
  deleteStaple: (id: string) => void;
  addRequest: (requester: string, item: string) => void;
  removeRequest: (id: string) => void;
  setDefaultBrand: (pref: BrandPreference) => void;
  setBrandOverride: (itemName: string, pref: BrandPreference) => void;
  toggleOrderChecked: (itemId: string) => void;
  /** Starts the timer if no order is running; logs order_started only when it actually starts. */
  startOrderIfNeeded: (detail: Record<string, unknown>) => void;
  /** Stops the timer, logs order_done, clears the given requests and the order checkboxes. */
  completeOrder: (detail: Record<string, unknown>, clearRequestIds: string[], orderedItems?: OrderedItem[]) => void;
}

const OrderingContext = createContext<OrderingContextValue | undefined>(undefined);

export function OrderingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OrderingState>(INITIAL);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    loadFromStorage<Partial<OrderingState>>(STORAGE_KEYS.ORDERING).then((stored) => {
      if (stored) setState({ ...INITIAL, ...stored });
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) saveToStorage(STORAGE_KEYS.ORDERING, state);
  }, [state, ready]);

  const addStaple = useCallback((staple: Omit<Staple, 'id'>) => {
    setState((s) => ({ ...s, staples: [...s.staples, { ...staple, id: `st-${Date.now()}` }] }));
  }, []);

  const deleteStaple = useCallback((id: string) => {
    setState((s) => ({ ...s, staples: s.staples.filter((x) => x.id !== id) }));
  }, []);

  const addRequest = useCallback((requester: string, item: string) => {
    const request: GroceryRequest = {
      id: `rq-${Date.now()}`,
      requester: requester.trim(),
      item: item.trim(),
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, requests: [...s.requests, request] }));
    logEvent('request_added', { requester: request.requester, item: request.item });
  }, []);

  const removeRequest = useCallback((id: string) => {
    setState((s) => ({ ...s, requests: s.requests.filter((r) => r.id !== id) }));
  }, []);

  const setDefaultBrand = useCallback((pref: BrandPreference) => {
    setState((s) => ({ ...s, defaultBrand: pref }));
  }, []);

  const setBrandOverride = useCallback((itemName: string, pref: BrandPreference) => {
    setState((s) => ({ ...s, brandOverrides: { ...s.brandOverrides, [normalizeName(itemName)]: pref } }));
  }, []);

  const toggleOrderChecked = useCallback((itemId: string) => {
    setState((s) => {
      const next = { ...s.orderChecked };
      if (next[itemId]) delete next[itemId];
      else next[itemId] = true;
      return { ...s, orderChecked: next };
    });
  }, []);

  const startOrderIfNeeded = useCallback((detail: Record<string, unknown>) => {
    if (stateRef.current.orderStartedAt) return;
    const startedAt = new Date().toISOString();
    // Update the ref immediately so a quick re-render can't log twice
    stateRef.current = { ...stateRef.current, orderStartedAt: startedAt };
    setState((s) => ({ ...s, orderStartedAt: s.orderStartedAt ?? startedAt }));
    logEvent('order_started', detail);
  }, []);

  const completeOrder = useCallback((detail: Record<string, unknown>, clearRequestIds: string[], orderedItems: OrderedItem[] = []) => {
    const started = stateRef.current.orderStartedAt;
    const minutes = started ? Math.round(((Date.now() - Date.parse(started)) / 60000) * 10) / 10 : 0;
    logEvent('order_done', { minutes, ...detail });
    const clear = new Set(clearRequestIds);
    setState((s) => ({
      ...s,
      requests: s.requests.filter((r) => !clear.has(r.id)),
      orderStartedAt: null,
      orderChecked: {},
      lastOrder: orderedItems.length > 0 ? { completedAt: new Date().toISOString(), items: orderedItems } : s.lastOrder,
    }));
  }, []);

  return (
    <OrderingContext.Provider
      value={{
        ...state,
        ready,
        addStaple,
        deleteStaple,
        addRequest,
        removeRequest,
        setDefaultBrand,
        setBrandOverride,
        toggleOrderChecked,
        startOrderIfNeeded,
        completeOrder,
      }}
    >
      {children}
    </OrderingContext.Provider>
  );
}

export function useOrdering() {
  const context = useContext(OrderingContext);
  if (!context) throw new Error('useOrdering must be used within OrderingProvider');
  return context;
}
