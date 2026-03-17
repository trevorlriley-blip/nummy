import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { MealFeedback, FeedbackSummary } from '../types/feedback';
import { PlannedMeal } from '../types/mealPlan';
import { sampleFeedback } from '../data/feedback';
import { sampleRecipes } from '../data/recipes';

interface FeedbackContextValue {
  feedbackEntries: MealFeedback[];
  submitFeedback: (feedback: Omit<MealFeedback, 'id' | 'createdAt'>) => void;
  getFeedbackForRecipe: (recipeId: string) => MealFeedback[];
  getFeedbackSummaries: () => FeedbackSummary[];
  getAverageRating: (recipeId: string) => number | null;
  hasFeedback: (plannedMealId: string) => boolean;
}

const FeedbackContext = createContext<FeedbackContextValue | undefined>(undefined);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [feedbackEntries, setFeedbackEntries] = useState<MealFeedback[]>(sampleFeedback);

  const submitFeedback = useCallback(
    (feedback: Omit<MealFeedback, 'id' | 'createdAt'>) => {
      const entry: MealFeedback = {
        ...feedback,
        id: `fb-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setFeedbackEntries((prev) => [...prev, entry]);
    },
    []
  );

  const getFeedbackForRecipe = useCallback(
    (recipeId: string) => feedbackEntries.filter((f) => f.recipeId === recipeId),
    [feedbackEntries]
  );

  const getAverageRating = useCallback(
    (recipeId: string) => {
      const entries = feedbackEntries.filter((f) => f.recipeId === recipeId && f.rating);
      if (entries.length === 0) return null;
      const sum = entries.reduce((s, f) => s + (f.rating ?? 0), 0);
      return Math.round((sum / entries.length) * 10) / 10;
    },
    [feedbackEntries]
  );

  const hasFeedback = useCallback(
    (plannedMealId: string) => feedbackEntries.some((f) => f.plannedMealId === plannedMealId),
    [feedbackEntries]
  );

  const getFeedbackSummaries = useCallback((): FeedbackSummary[] => {
    const recipeMap = new Map<string, MealFeedback[]>();
    for (const entry of feedbackEntries) {
      const list = recipeMap.get(entry.recipeId) ?? [];
      list.push(entry);
      recipeMap.set(entry.recipeId, list);
    }

    const summaries: FeedbackSummary[] = [];
    for (const [recipeId, entries] of recipeMap.entries()) {
      const recipe = sampleRecipes.find((r) => r.id === recipeId);
      const made = entries.filter((e) => e.didMakeIt);
      const ratings = made.filter((e) => e.rating).map((e) => e.rating!);
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      const lastMadeEntry = made.sort((a, b) => b.date.localeCompare(a.date))[0];

      summaries.push({
        recipeId,
        recipeTitle: recipe?.title ?? 'Unknown Recipe',
        averageRating: Math.round(avgRating * 10) / 10,
        timesMade: made.length,
        timesSkipped: entries.length - made.length,
        lastMade: lastMadeEntry?.date,
      });
    }

    return summaries;
  }, [feedbackEntries]);

  return (
    <FeedbackContext.Provider
      value={{ feedbackEntries, submitFeedback, getFeedbackForRecipe, getFeedbackSummaries, getAverageRating, hasFeedback }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used within FeedbackProvider');
  return context;
}
