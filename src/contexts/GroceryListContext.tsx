import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { GroceryList, GroceryItem } from '../types/groceryList';
import { StoreSection } from '../types/recipe';
import { sampleGroceryList } from '../data/groceryList';
import { generateGroceryList, applyConsolidation } from '../utils/groceryListGenerator';
import { useMealPlan } from './MealPlanContext';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';
import { namesMatch } from '../utils/pantryMatch';
import { useAuth } from './AuthContext';

interface MergeGroup {
  ids: string[];
  name: string;
  quantity: number;
  unit: string;
}

interface GroceryListContextValue {
  groceryList: GroceryList | null;
  isConsolidating: boolean;
  toggleItemChecked: (itemId: string) => void;
  checkAllInSection: (category: StoreSection) => void;
  uncheckAll: () => void;
  /** Marks items matching the given pantry names as haveIt (replacing earlier matches). Returns the match count. */
  applyPantryMatch: (pantryNames: string[]) => number;
  setItemHaveIt: (itemId: string, haveIt: boolean) => void;
  haveItItems: GroceryItem[];
  haveItCount: number;
  checkedCount: number;
  totalCount: number;
  totalCost: number;
  checkedCost: number;
}

const GroceryListContext = createContext<GroceryListContextValue | undefined>(undefined);

export function GroceryListProvider({ children }: { children: React.ReactNode }) {
  const { currentPlan } = useMealPlan();
  const { session } = useAuth();
  const tokenRef = useRef(session?.access_token);
  tokenRef.current = session?.access_token;
  const [groceryLists, setGroceryLists] = useState<Record<string, GroceryList>>({
    [sampleGroceryList.mealPlanId]: sampleGroceryList,
  });
  const [isConsolidating, setIsConsolidating] = useState(false);
  const isLoaded = useRef(false);

  // Load grocery lists from storage
  useEffect(() => {
    loadFromStorage<Record<string, GroceryList>>(STORAGE_KEYS.GROCERY_LISTS).then((stored) => {
      if (stored && Object.keys(stored).length > 0) {
        setGroceryLists(stored);
      }
      isLoaded.current = true;
    });
  }, []);

  // Persist grocery lists
  useEffect(() => {
    if (isLoaded.current) {
      saveToStorage(STORAGE_KEYS.GROCERY_LISTS, groceryLists);
    }
  }, [groceryLists]);

  // Auto-generate and consolidate grocery list when a new plan is selected
  useEffect(() => {
    if (!currentPlan || groceryLists[currentPlan.id]) return;

    const basicList = generateGroceryList(currentPlan);
    setGroceryLists((prev) => ({ ...prev, [currentPlan.id]: basicList }));

    const allItems = basicList.sections.flatMap((s) =>
      s.items.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, unit: i.unit, category: i.category }))
    );

    setIsConsolidating(true);
    fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL ?? ''}/api/consolidate-grocery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
      },
      body: JSON.stringify({ items: allItems }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { groups: MergeGroup[] }) => {
        if (data.groups?.length) {
          const consolidated = applyConsolidation(basicList, data.groups);
          setGroceryLists((prev) => ({ ...prev, [basicList.mealPlanId]: consolidated }));
        }
      })
      .catch(() => {/* keep basic list on failure */})
      .finally(() => setIsConsolidating(false));
  }, [currentPlan?.id]);

  const groceryList = currentPlan ? (groceryLists[currentPlan.id] ?? null) : null;

  const updateCurrentList = useCallback(
    (updater: (list: GroceryList) => GroceryList) => {
      if (!currentPlan) return;
      setGroceryLists((prev) => {
        const current = prev[currentPlan.id];
        if (!current) return prev;
        return { ...prev, [currentPlan.id]: updater(current) };
      });
    },
    [currentPlan?.id]
  );

  const toggleItemChecked = useCallback(
    (itemId: string) => {
      updateCurrentList((list) => {
        let checkedItems = list.checkedItems;
        const sections = list.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => {
            if (item.id === itemId) {
              checkedItems += item.isChecked ? -1 : 1;
              return { ...item, isChecked: !item.isChecked };
            }
            return item;
          }),
        }));
        return { ...list, sections, checkedItems };
      });
    },
    [updateCurrentList]
  );

  const checkAllInSection = useCallback(
    (category: StoreSection) => {
      updateCurrentList((list) => {
        let checkedItems = list.checkedItems;
        const sections = list.sections.map((section) => {
          if (section.category !== category) return section;
          return {
            ...section,
            items: section.items.map((item) => {
              if (!item.isChecked) checkedItems++;
              return { ...item, isChecked: true };
            }),
          };
        });
        return { ...list, sections, checkedItems };
      });
    },
    [updateCurrentList]
  );

  const uncheckAll = useCallback(() => {
    updateCurrentList((list) => {
      const sections = list.sections.map((section) => ({
        ...section,
        items: section.items.map((item) => ({ ...item, isChecked: false })),
      }));
      return { ...list, sections, checkedItems: 0 };
    });
  }, [updateCurrentList]);

  const applyPantryMatch = useCallback(
    (pantryNames: string[]): number => {
      if (!groceryList) return 0;
      const matches = (item: GroceryItem) => pantryNames.some((n) => namesMatch(n, item.name));
      const count = groceryList.sections.reduce(
        (sum, s) => sum + s.items.filter(matches).length,
        0
      );
      updateCurrentList((list) => ({
        ...list,
        sections: list.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => ({ ...item, haveIt: matches(item) })),
        })),
      }));
      return count;
    },
    [groceryList, updateCurrentList]
  );

  const setItemHaveIt = useCallback(
    (itemId: string, haveIt: boolean) => {
      updateCurrentList((list) => ({
        ...list,
        sections: list.sections.map((section) => ({
          ...section,
          items: section.items.map((item) => (item.id === itemId ? { ...item, haveIt } : item)),
        })),
      }));
    },
    [updateCurrentList]
  );

  // Items the pantry already covers are excluded from progress and cost totals.
  const allItems = groceryList?.sections.flatMap((s) => s.items) ?? [];
  const needed = allItems.filter((i) => !i.haveIt);
  const haveItItems = allItems.filter((i) => i.haveIt);
  const checkedCount = needed.filter((i) => i.isChecked).length;
  const totalCount = needed.length;
  const totalCost = needed.reduce((sum, i) => sum + i.estimatedCost, 0);
  const checkedCost = needed.filter((i) => i.isChecked).reduce((sum, i) => sum + i.estimatedCost, 0);

  return (
    <GroceryListContext.Provider
      value={{
        groceryList,
        isConsolidating,
        toggleItemChecked,
        checkAllInSection,
        uncheckAll,
        applyPantryMatch,
        setItemHaveIt,
        haveItItems,
        haveItCount: haveItItems.length,
        checkedCount,
        totalCount,
        totalCost,
        checkedCost,
      }}
    >
      {children}
    </GroceryListContext.Provider>
  );
}

export function useGroceryList() {
  const context = useContext(GroceryListContext);
  if (!context) throw new Error('useGroceryList must be used within GroceryListProvider');
  return context;
}
