export interface NutritionInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
}

export type IngredientUnit = string;

export type StoreSection =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'seafood'
  | 'bakery'
  | 'pantry'
  | 'frozen'
  | 'spices'
  | 'condiments'
  | 'beverages'
  | 'snacks'
  | 'deli'
  | 'other';

export type CuisineType =
  | 'american'
  | 'italian'
  | 'mexican'
  | 'asian'
  | 'indian'
  | 'mediterranean'
  | 'middle-eastern'
  | 'french'
  | 'thai'
  | 'japanese'
  | 'chinese'
  | 'korean'
  | 'greek'
  | 'other';

export type DietaryTag =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'keto'
  | 'paleo'
  | 'low-sodium'
  | 'low-sugar'
  | 'high-protein'
  | 'heart-healthy'
  | 'diabetic-friendly'
  | 'nut-free'
  | 'soy-free';

export type MealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'dessert';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: IngredientUnit;
  category: StoreSection;
  estimatedCostUSD: number;
  optional?: boolean;
}

export interface InstructionStep {
  stepNumber: number;
  instruction: string;
  durationMinutes?: number;
  tip?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUri: string;
  cuisineType: CuisineType;
  mealTypes: MealType[];
  dietaryTags: DietaryTag[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  nutrition: NutritionInfo;
  estimatedCostPerServing: number;
  allergens: string[];
  createdAt: string;
}
