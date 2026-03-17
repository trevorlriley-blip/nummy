import { DietaryTag, MealType } from './recipe';

export type HealthIssue =
  | 'diabetes'
  | 'heart-disease'
  | 'high-blood-pressure'
  | 'high-cholesterol'
  | 'celiac-disease'
  | 'ibs'
  | 'gerd'
  | 'kidney-disease'
  | 'osteoporosis'
  | 'anemia'
  | 'obesity'
  | 'none';

export type DietaryGoal =
  | 'lose-weight'
  | 'gain-muscle'
  | 'maintain-weight'
  | 'eat-healthier'
  | 'reduce-sugar'
  | 'increase-fiber'
  | 'increase-protein'
  | 'reduce-sodium'
  | 'heart-health'
  | 'meal-variety'
  | 'save-money'
  | 'reduce-food-waste';

export type Allergy =
  | 'peanuts'
  | 'tree-nuts'
  | 'milk'
  | 'eggs'
  | 'wheat'
  | 'soy'
  | 'fish'
  | 'shellfish'
  | 'sesame'
  | 'corn'
  | 'mustard'
  | 'none';

export type CookingMethod =
  | 'stovetop'
  | 'oven'
  | 'air-fryer'
  | 'slow-cooker'
  | 'pressure-cooker'
  | 'grill'
  | 'smoker'
  | 'microwave'
  | 'no-cook';

export type BudgetRange =
  | 'budget-friendly'
  | 'moderate'
  | 'comfortable'
  | 'premium';

export interface BudgetPreference {
  range: BudgetRange;
  weeklyMinUSD: number;
  weeklyMaxUSD: number;
}

export interface UserPreferences {
  familySize: number;
  dietaryRestrictions: DietaryTag[];
  allergies: Allergy[];
  healthIssues: HealthIssue[];
  dietaryGoals: DietaryGoal[];
  foodAversions: string[];
  cookingMethods: CookingMethod[];
  budget: BudgetPreference;
  mealsToInclude: MealType[];
  includeSnacks: boolean;
  includeDesserts: boolean;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUri?: string;
  preferences: UserPreferences;
  favoriteRecipeIds: string[];
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}
