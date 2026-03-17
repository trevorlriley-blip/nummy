export interface MealFeedback {
  id: string;
  plannedMealId: string;
  recipeId: string;
  date: string;
  didMakeIt: boolean;
  /** Rating from 1 to 5 */
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: string;
}

export interface FeedbackSummary {
  recipeId: string;
  recipeTitle: string;
  averageRating: number;
  timesMade: number;
  timesSkipped: number;
  lastMade?: string;
}
