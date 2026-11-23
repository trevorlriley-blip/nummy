import { IngredientUnit, StoreSection } from './recipe';
import { BrandPreference } from './ordering';

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: IngredientUnit;
  category: StoreSection;
  estimatedCost: number;
  isChecked: boolean;
  /** Set when a pantry snapshot says we already have this. Separate from isChecked. */
  haveIt?: boolean;
  /** Set on items merged in from weekly staples or family requests. */
  source?: 'staple' | 'request';
  /** Display tags, e.g. ["Staple"] or the requester's name. */
  tags?: string[];
  /** Brand preference carried over from a staple. */
  brandPref?: BrandPreference;
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
