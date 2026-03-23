import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { WeeklyMealPlan, PlannedMeal, DayPlan, MealRejection } from '../types/mealPlan';
import { Recipe, MealType } from '../types/recipe';
import { UserPreferences } from '../types/user';
import { sampleWeeklyPlan } from '../data/mealPlan';
import { sampleRecipes } from '../data/recipes';
import { format, addDays } from 'date-fns';
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '../utils/storage';
import { useRecipes } from './RecipeContext';

interface PlanHistoryState {
  plans: WeeklyMealPlan[];
  selectedIndex: number;
}

interface MealPlanContextValue {
  plans: WeeklyMealPlan[];
  selectedIndex: number;
  currentPlan: WeeklyMealPlan | null;
  isGenerating: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  generateNewPlan: (preferences: UserPreferences) => void;
  swapMeal: (plannedMealId: string, newRecipeId: string) => void;
  markMealCompleted: (plannedMealId: string) => void;
  getPlannedMeal: (id: string) => PlannedMeal | undefined;
  getMealsForDate: (date: string) => PlannedMeal[];
  draftPlan: WeeklyMealPlan | null;
  draftRejections: MealRejection[];
  acceptDraftPlan: () => void;
  discardDraftPlan: () => void;
  replaceDraftMeal: (plannedMealId: string, newRecipeId: string) => void;
  setDraftPlan: (plan: WeeklyMealPlan) => void;
  deletePlan: (planId: string) => void;
}

const MealPlanContext = createContext<MealPlanContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Recipe selection with rejection-weighted randomness
// ---------------------------------------------------------------------------

function getRejectionCount(
  recipeId: string,
  mealType: MealType,
  rejections: MealRejection[]
): number {
  return rejections.filter(
    (r) => r.recipeId === recipeId && r.mealType === mealType
  ).length;
}

function pickRandomRecipe(
  recipes: Recipe[],
  mealType: MealType,
  exclude: Set<string>,
  rejections: MealRejection[] = []
): Recipe {
  const candidates = recipes.filter(
    (r) => r.mealTypes.includes(mealType) && !exclude.has(r.id)
  );

  if (candidates.length === 0) {
    const fallback = recipes.filter((r) => r.mealTypes.includes(mealType));
    return fallback[Math.floor(Math.random() * fallback.length)] ?? recipes[0];
  }

  if (rejections.length === 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Weighted random: weight = 1 / (1 + rejectionCount)
  const weighted = candidates.map((recipe) => {
    const count = getRejectionCount(recipe.id, mealType, rejections);
    return { recipe, weight: 1 / (1 + count) };
  });

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;

  for (const { recipe, weight } of weighted) {
    random -= weight;
    if (random <= 0) return recipe;
  }

  return weighted[weighted.length - 1].recipe;
}

// ---------------------------------------------------------------------------
// Plan builder
// ---------------------------------------------------------------------------

function buildMealPlan(
  preferences: UserPreferences,
  rejectionHistory: MealRejection[] = []
): WeeklyMealPlan {
  const startDate = new Date();
  const day = startDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  startDate.setDate(startDate.getDate() + diff);

  const weekStartStr = format(startDate, 'yyyy-MM-dd');
  const usedRecipeIds = new Set<string>();
  const days: DayPlan[] = [];
  let totalCost = 0;
  let totalCalories = 0;
  let mealCounter = 0;

  for (let d = 0; d < 7; d++) {
    const date = addDays(startDate, d);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = format(date, 'EEEE');
    const meals: PlannedMeal[] = [];

    const mealTypes: MealType[] = [...preferences.mealsToInclude];
    if (preferences.includeSnacks) mealTypes.push('snack');
    if (preferences.includeDesserts) mealTypes.push('dessert');

    for (const mealType of mealTypes) {
      const recipe = pickRandomRecipe(sampleRecipes, mealType, usedRecipeIds, rejectionHistory);
      usedRecipeIds.add(recipe.id);
      const scaledCost = recipe.estimatedCostPerServing * preferences.familySize;
      totalCost += scaledCost;
      totalCalories += recipe.nutrition.calories * preferences.familySize;
      mealCounter++;

      meals.push({
        id: `pm-${String(mealCounter).padStart(3, '0')}`,
        mealType,
        recipe,
        servings: preferences.familySize,
        date: dateStr,
        isCompleted: false,
      });
    }

    days.push({ date: dateStr, dayOfWeek, meals });
  }

  return {
    id: `plan-${Date.now()}`,
    weekStartDate: weekStartStr,
    weekEndDate: format(addDays(startDate, 6), 'yyyy-MM-dd'),
    days,
    totalEstimatedCost: Math.round(totalCost * 100) / 100,
    totalCalories: Math.round(totalCalories),
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Recalculate plan totals after a meal swap
// ---------------------------------------------------------------------------

function recalcPlanTotals(plan: WeeklyMealPlan): WeeklyMealPlan {
  let totalCost = 0;
  let totalCalories = 0;
  for (const day of plan.days) {
    for (const meal of day.meals) {
      totalCost += meal.recipe.estimatedCostPerServing * meal.servings;
      totalCalories += meal.recipe.nutrition.calories * meal.servings;
    }
  }
  return {
    ...plan,
    totalEstimatedCost: Math.round(totalCost * 100) / 100,
    totalCalories: Math.round(totalCalories),
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function MealPlanProvider({ children }: { children: React.ReactNode }) {
  const { addRecipes, recipes: contextRecipes } = useRecipes();
  const [plans, setPlans] = useState<WeeklyMealPlan[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const isLoaded = useRef(false);

  // Draft plan state (preview before accepting)
  const [draftPlan, setDraftPlan] = useState<WeeklyMealPlan | null>(null);
  const [draftRejections, setDraftRejections] = useState<MealRejection[]>([]);
  const [rejectionHistory, setRejectionHistory] = useState<MealRejection[]>([]);

  // Load plan history from storage
  useEffect(() => {
    loadFromStorage<PlanHistoryState>(STORAGE_KEYS.MEAL_PLAN_HISTORY).then((stored) => {
      if (stored && stored.plans && stored.plans.length > 0) {
        setPlans(stored.plans);
        setSelectedIndex(Math.min(stored.selectedIndex, stored.plans.length - 1));
        // Populate RecipeContext so favorited recipes are resolvable by ID
        const planRecipes = stored.plans.flatMap((p) =>
          p.days.flatMap((d) => d.meals.map((m) => m.recipe))
        );
        addRecipes(planRecipes);
      }
      isLoaded.current = true;
    });
  }, []);

  // Load rejection history from storage
  useEffect(() => {
    loadFromStorage<{ rejections: MealRejection[] }>(STORAGE_KEYS.REJECTION_HISTORY).then(
      (stored) => {
        if (stored?.rejections) {
          setRejectionHistory(stored.rejections);
        }
      }
    );
  }, []);

  // Persist plan history
  useEffect(() => {
    if (isLoaded.current) {
      saveToStorage(STORAGE_KEYS.MEAL_PLAN_HISTORY, { plans, selectedIndex });
    }
  }, [plans, selectedIndex]);

  // Persist rejection history
  useEffect(() => {
    if (isLoaded.current) {
      saveToStorage(STORAGE_KEYS.REJECTION_HISTORY, { rejections: rejectionHistory });
    }
  }, [rejectionHistory]);

  const currentPlan = plans[selectedIndex] ?? null;
  const canGoBack = selectedIndex > 0;
  const canGoForward = selectedIndex < plans.length - 1;

  const goToPreviousWeek = useCallback(() => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setSelectedIndex((prev) => Math.min(plans.length - 1, prev + 1));
  }, [plans.length]);

  // Generate a new plan as a draft (not committed until accepted)
  const generateNewPlan = useCallback(
    (preferences: UserPreferences) => {
      setIsGenerating(true);
      setTimeout(() => {
        const plan = buildMealPlan(preferences, rejectionHistory);
        setDraftPlan(plan);
        setDraftRejections([]);
        setIsGenerating(false);
      }, 1200);
    },
    [rejectionHistory]
  );

  // Accept the draft plan — replace any existing plan for the same week, sort chronologically
  const acceptDraftPlan = useCallback(() => {
    if (!draftPlan) return;
    setPlans((prev) => {
      const filtered = prev.filter((p) => p.weekStartDate !== draftPlan.weekStartDate);
      const newPlans = [...filtered, draftPlan].sort((a, b) =>
        a.weekStartDate.localeCompare(b.weekStartDate)
      );
      const newIndex = newPlans.findIndex((p) => p.id === draftPlan.id);
      setSelectedIndex(newIndex >= 0 ? newIndex : newPlans.length - 1);
      return newPlans;
    });
    if (draftRejections.length > 0) {
      setRejectionHistory((prev) => [...prev, ...draftRejections]);
    }
    setDraftPlan(null);
    setDraftRejections([]);
  }, [draftPlan, draftRejections]);

  const deletePlan = useCallback((planId: string) => {
    setPlans((prev) => {
      const idx = prev.findIndex((p) => p.id === planId);
      if (idx === -1) return prev;
      const newPlans = prev.filter((p) => p.id !== planId);
      setSelectedIndex((si) => Math.min(si, Math.max(0, newPlans.length - 1)));
      return newPlans;
    });
  }, []);

  // Discard the draft plan without saving
  const discardDraftPlan = useCallback(() => {
    setDraftPlan(null);
    setDraftRejections([]);
  }, []);

  // Set draft plan directly (used by the AI agent)
  const setDraftPlanFromAgent = useCallback((plan: WeeklyMealPlan) => {
    setDraftPlan(plan);
    setDraftRejections([]);
  }, []);

  // Replace a meal in the draft plan and record the rejection
  const replaceDraftMeal = useCallback(
    (plannedMealId: string, newRecipeId: string) => {
      if (!draftPlan) return;
      const newRecipe = contextRecipes.find((r) => r.id === newRecipeId) ?? sampleRecipes.find((r) => r.id === newRecipeId);
      if (!newRecipe) return;

      // Find the meal being replaced to record the rejection
      let rejectedMeal: PlannedMeal | undefined;
      for (const day of draftPlan.days) {
        rejectedMeal = day.meals.find((m) => m.id === plannedMealId);
        if (rejectedMeal) break;
      }

      if (rejectedMeal) {
        const rejection: MealRejection = {
          id: `rej-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          recipeId: rejectedMeal.recipe.id,
          mealType: rejectedMeal.mealType,
          planId: draftPlan.id,
          rejectedAt: new Date().toISOString(),
          replacedWithRecipeId: newRecipeId,
        };
        setDraftRejections((prev) => [...prev, rejection]);
      }

      // Replace the meal and recalculate totals
      const updated: WeeklyMealPlan = {
        ...draftPlan,
        days: draftPlan.days.map((day) => ({
          ...day,
          meals: day.meals.map((meal) =>
            meal.id === plannedMealId ? { ...meal, recipe: newRecipe } : meal
          ),
        })),
      };
      setDraftPlan(recalcPlanTotals(updated));
    },
    [draftPlan]
  );

  const swapMeal = useCallback((plannedMealId: string, newRecipeId: string) => {
    const newRecipe = contextRecipes.find((r) => r.id === newRecipeId) ?? sampleRecipes.find((r) => r.id === newRecipeId);
    if (!newRecipe) return;
    setPlans((prev) =>
      prev.map((plan, i) => {
        if (i !== selectedIndex) return plan;
        return {
          ...plan,
          days: plan.days.map((day) => ({
            ...day,
            meals: day.meals.map((meal) =>
              meal.id === plannedMealId ? { ...meal, recipe: newRecipe } : meal
            ),
          })),
        };
      })
    );
  }, [selectedIndex]);

  const markMealCompleted = useCallback((plannedMealId: string) => {
    setPlans((prev) =>
      prev.map((plan, i) => {
        if (i !== selectedIndex) return plan;
        return {
          ...plan,
          days: plan.days.map((day) => ({
            ...day,
            meals: day.meals.map((meal) =>
              meal.id === plannedMealId ? { ...meal, isCompleted: true } : meal
            ),
          })),
        };
      })
    );
  }, [selectedIndex]);

  const getPlannedMeal = useCallback(
    (id: string) => {
      if (!currentPlan) return undefined;
      for (const day of currentPlan.days) {
        const meal = day.meals.find((m) => m.id === id);
        if (meal) return meal;
      }
      return undefined;
    },
    [currentPlan]
  );

  const getMealsForDate = useCallback(
    (date: string) => {
      if (!currentPlan) return [];
      const day = currentPlan.days.find((d) => d.date === date);
      return day?.meals ?? [];
    },
    [currentPlan]
  );

  return (
    <MealPlanContext.Provider
      value={{
        plans,
        selectedIndex,
        currentPlan,
        isGenerating,
        canGoBack,
        canGoForward,
        goToPreviousWeek,
        goToNextWeek,
        generateNewPlan,
        swapMeal,
        markMealCompleted,
        getPlannedMeal,
        getMealsForDate,
        draftPlan,
        draftRejections,
        acceptDraftPlan,
        discardDraftPlan,
        replaceDraftMeal,
        setDraftPlan: setDraftPlanFromAgent,
        deletePlan,
      }}
    >
      {children}
    </MealPlanContext.Provider>
  );
}

export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (!context) throw new Error('useMealPlan must be used within MealPlanProvider');
  return context;
}
