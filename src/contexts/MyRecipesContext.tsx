import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Recipe } from '../types/recipe';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';
import { useRecipes } from './RecipeContext';

interface MyRecipesContextValue {
  myRecipes: Recipe[];
  isLoading: boolean;
  addMyRecipe: (recipe: Recipe) => void;
  updateMyRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteMyRecipe: (id: string) => void;
  isMyRecipe: (id: string) => boolean;
}

const MyRecipesContext = createContext<MyRecipesContextValue | undefined>(undefined);

export function MyRecipesProvider({ children }: { children: React.ReactNode }) {
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isLoaded = useRef(false);
  const { addRecipes } = useRecipes();

  // Load from storage on mount
  useEffect(() => {
    loadFromStorage<Recipe[]>(STORAGE_KEYS.MY_RECIPES).then((stored) => {
      if (stored && stored.length > 0) {
        setMyRecipes(stored);
        addRecipes(stored);
      }
      isLoaded.current = true;
      setIsLoading(false);
    });
  }, []);

  // Persist on change
  useEffect(() => {
    if (isLoaded.current) {
      saveToStorage(STORAGE_KEYS.MY_RECIPES, myRecipes);
    }
  }, [myRecipes]);

  const addMyRecipe = useCallback((recipe: Recipe) => {
    setMyRecipes((prev) => [recipe, ...prev]);
    addRecipes([recipe]);
  }, [addRecipes]);

  const updateMyRecipe = useCallback((id: string, updates: Partial<Recipe>) => {
    setMyRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const deleteMyRecipe = useCallback((id: string) => {
    setMyRecipes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const isMyRecipe = useCallback(
    (id: string) => myRecipes.some((r) => r.id === id),
    [myRecipes]
  );

  return (
    <MyRecipesContext.Provider
      value={{ myRecipes, isLoading, addMyRecipe, updateMyRecipe, deleteMyRecipe, isMyRecipe }}
    >
      {children}
    </MyRecipesContext.Provider>
  );
}

export function useMyRecipes() {
  const context = useContext(MyRecipesContext);
  if (!context) throw new Error('useMyRecipes must be used within MyRecipesProvider');
  return context;
}
