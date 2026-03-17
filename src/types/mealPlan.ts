import { MealType, Recipe } from './recipe';

/** Record of a recipe rejected during meal plan preview. */
export interface MealRejection {
  id: string;
  recipeId: string;
  mealType: MealType;
  planId: string;
  rejectedAt: string;
  replacedWithRecipeId?: string;
}

export interface PlannedMeal {
  id: string;
  mealType: MealType;
  recipe: Recipe;
  servings: number;
  /** Date in YYYY-MM-DD format */
  date: string;
  isCompleted: boolean;
  feedbackId?: string;
}

export interface DayPlan {
  date: string;
  dayOfWeek: string;
  meals: PlannedMeal[];
}

export interface WeeklyMealPlan {
  id: string;
  weekStartDate: string;
  weekEndDate: string;
  days: DayPlan[];
  totalEstimatedCost: number;
  totalCalories: number;
  generatedAt: string;
}
