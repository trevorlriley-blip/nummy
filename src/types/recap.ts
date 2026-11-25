export type DinnerStatus = 'made' | 'skipped' | 'ate-out';
export type DinnerVerdict = 'loved' | 'ok' | 'not-again';

export interface RecapRating {
  plannedMealId: string;
  recipeId: string;
  title: string;
  status: DinnerStatus;
  /** Only set when status is 'made'. */
  verdict?: DinnerVerdict;
}

export interface TossedItem {
  name: string;
  /** Free text the user typed, e.g. "half a bag". */
  quantity?: string;
  /** Estimated dollars; 0 when the item has no known price. */
  cost: number;
}

export interface WeekendRecap {
  /** Monday of the recapped week, YYYY-MM-DD. */
  weekOf: string;
  /** The user's paper-count starting point, carried on every recap; null if skipped. */
  baseline: number | null;
  tossedItems: TossedItem[];
  tossedCount: number;
  wastedEstimate: number;
  mealsMade: number;
  mealsPlanned: number;
  ratings: RecapRating[];
  completedAt: string;
}
