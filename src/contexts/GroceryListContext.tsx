import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { GroceryList } from '../types/groceryList';
import { StoreSection } from '../types/recipe';
import { sampleGroceryList } from '../data/groceryList';
import { generateGroceryList } from '../utils/groceryListGenerator';
import { useMealPlan } from './MealPlanContext';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';

interface GroceryListContextValue {
  groceryList: GroceryList | null;
  toggleItemChecked: (itemId: string) => void;
  checkAllInSection: (category: StoreSection) => void;
  uncheckAll: () => void;
  checkedCount: number;
  totalCount: number;
  totalCost: number;
  checkedCost: number;
}

const GroceryListContext = createContext<GroceryListContextValue | undefined>(undefined);

export function GroceryListProvider({ children }: { children: React.ReactNode }) {
  const { currentPlan } = useMealPlan();
  const [groceryLists, setGroceryLists] = useState<Record<string, GroceryList>>({
    [sampleGroceryList.mealPlanId]: sampleGroceryList,
  });
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

  // Auto-generate grocery list when a new plan is selected that doesn't have one yet
  useEffect(() => {
    if (currentPlan && !groceryLists[currentPlan.id]) {
      const newList = generateGroceryList(currentPlan);
      setGroceryLists((prev) => ({ ...prev, [currentPlan.id]: newList }));
    }
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

  const checkedCount = groceryList?.checkedItems ?? 0;
  const totalCount = groceryList?.totalItems ?? 0;
  const totalCost = groceryList?.totalEstimatedCost ?? 0;
  const checkedCost = groceryList
    ? groceryList.sections.reduce(
        (sum, s) => sum + s.items.filter((i) => i.isChecked).reduce((s2, i) => s2 + i.estimatedCost, 0),
        0
      )
    : 0;

  return (
    <GroceryListContext.Provider
      value={{
        groceryList,
        toggleItemChecked,
        checkAllInSection,
        uncheckAll,
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
