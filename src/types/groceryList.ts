import { IngredientUnit, StoreSection } from './recipe';

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: IngredientUnit;
  category: StoreSection;
  estimatedCost: number;
  isChecked: boolean;
  fromRecipeIds: string[];
  notes?: string;
}

export interface GrocerySection {
  category: StoreSection;
  displayName: string;
  items: GroceryItem[];
  sectionTotal: number;
}

export interface GroceryList {
  id: string;
  mealPlanId: string;
  sections: GrocerySection[];
  totalEstimatedCost: number;
  totalItems: number;
  checkedItems: number;
  createdAt: string;
}
