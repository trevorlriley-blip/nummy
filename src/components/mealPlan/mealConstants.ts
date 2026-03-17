import { MealType } from '../../types/recipe';

export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: 'weather-sunset-up',
  lunch: 'weather-sunny',
  dinner: 'weather-night',
  snack: 'cookie-outline',
  dessert: 'cupcake',
};

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  dessert: 'Dessert',
};
