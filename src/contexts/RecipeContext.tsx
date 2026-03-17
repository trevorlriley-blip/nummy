import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { Recipe, MealType, CuisineType, DietaryTag } from '../types/recipe';
import { UserPreferences } from '../types/user';
import { sampleRecipes } from '../data/recipes';

interface RecipeFilterCriteria {
  query?: string;
  mealTypes?: MealType[];
  cuisineTypes?: CuisineType[];
  dietaryTags?: DietaryTag[];
  maxPrepTime?: number;
  maxTotalTime?: number;
  difficulty?: Recipe['difficulty'];
  maxCostPerServing?: number;
}

interface RecipeContextValue {
  recipes: Recipe[];
  getRecipeById: (id: string) => Recipe | undefined;
  addRecipes: (recipes: Recipe[]) => void;
  searchRecipes: (query: string) => Recipe[];
  filterRecipes: (filters: RecipeFilterCriteria) => Recipe[];
  getRecipesByMealType: (type: MealType) => Recipe[];
  getRecipesByCuisine: (cuisine: CuisineType) => Recipe[];
  getCompatibleRecipes: (prefs: UserPreferences) => Recipe[];
}

const RecipeContext = createContext<RecipeContextValue | undefined>(undefined);

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [dynamicRecipes, setDynamicRecipes] = useState<Recipe[]>([]);

  const recipes = useMemo(
    () => [...sampleRecipes, ...dynamicRecipes],
    [dynamicRecipes]
  );

  const addRecipes = useCallback((newRecipes: Recipe[]) => {
    setDynamicRecipes((prev) => {
      const existingIds = new Set([...sampleRecipes.map((r) => r.id), ...prev.map((r) => r.id)]);
      const toAdd = newRecipes.filter((r) => !existingIds.has(r.id));
      if (toAdd.length === 0) return prev;
      return [...prev, ...toAdd];
    });
  }, []);

  const getRecipeById = useCallback(
    (id: string) => recipes.find((r) => r.id === id),
    [recipes]
  );

  const searchRecipes = useCallback(
    (query: string) => {
      const q = query.toLowerCase();
      return recipes.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.cuisineType.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q))
      );
    },
    [recipes]
  );

  const filterRecipes = useCallback(
    (filters: RecipeFilterCriteria) => {
      return recipes.filter((r) => {
        if (filters.query) {
          const q = filters.query.toLowerCase();
          const matchesQuery =
            r.title.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q);
          if (!matchesQuery) return false;
        }
        if (filters.mealTypes?.length) {
          if (!r.mealTypes.some((t) => filters.mealTypes!.includes(t))) return false;
        }
        if (filters.cuisineTypes?.length) {
          if (!filters.cuisineTypes.includes(r.cuisineType)) return false;
        }
        if (filters.dietaryTags?.length) {
          if (!filters.dietaryTags.every((t) => r.dietaryTags.includes(t))) return false;
        }
        if (filters.maxPrepTime && r.prepTimeMinutes > filters.maxPrepTime) return false;
        if (filters.maxTotalTime && r.totalTimeMinutes > filters.maxTotalTime) return false;
        if (filters.difficulty && r.difficulty !== filters.difficulty) return false;
        if (filters.maxCostPerServing && r.estimatedCostPerServing > filters.maxCostPerServing)
          return false;
        return true;
      });
    },
    [recipes]
  );

  const getRecipesByMealType = useCallback(
    (type: MealType) => recipes.filter((r) => r.mealTypes.includes(type)),
    [recipes]
  );

  const getRecipesByCuisine = useCallback(
    (cuisine: CuisineType) => recipes.filter((r) => r.cuisineType === cuisine),
    [recipes]
  );

  const getCompatibleRecipes = useCallback(
    (prefs: UserPreferences) => {
      return recipes.filter((r) => {
        // Check dietary restrictions
        if (prefs.dietaryRestrictions.length > 0) {
          const hasAllTags = prefs.dietaryRestrictions.every((tag) =>
            r.dietaryTags.includes(tag)
          );
          if (!hasAllTags) return false;
        }
        // Check food aversions
        if (prefs.foodAversions.length > 0) {
          const hasAversion = r.ingredients.some((i) =>
            prefs.foodAversions.some((a) => i.name.toLowerCase().includes(a.toLowerCase()))
          );
          if (hasAversion) return false;
        }
        // Check budget
        const maxCostPerServing =
          prefs.budget.weeklyMaxUSD / (prefs.familySize * 7 * prefs.mealsToInclude.length);
        if (r.estimatedCostPerServing > maxCostPerServing * 1.5) return false;
        return true;
      });
    },
    [recipes]
  );

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        getRecipeById,
        addRecipes,
        searchRecipes,
        filterRecipes,
        getRecipesByMealType,
        getRecipesByCuisine,
        getCompatibleRecipes,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) throw new Error('useRecipes must be used within RecipeProvider');
  return context;
}
