import { MealType } from '../../types/recipe';

export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: 'coffee',
  lunch: 'food',
  dinner: 'silverware-fork-knife',
  snack: 'cookie',
  dessert: 'ice-cream',
};

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  dessert: 'Dessert',
};
