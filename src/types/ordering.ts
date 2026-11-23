import { StoreSection } from './recipe';

export type BrandPreference = 'store' | 'name' | 'ask';

export const BRAND_LABELS: Record<BrandPreference, string> = {
  store: 'Store brand',
  name: 'Name brand',
  ask: 'Ask me',
};

export interface Staple {
  id: string;
  name: string;
  /** Free text such as "1 gallon" or "2". */
  quantity: string;
  category: StoreSection;
  /** Falls back to the default brand preference when unset. */
  brandPreference?: BrandPreference;
}

export interface GroceryRequest {
  id: string;
  requester: string;
  item: string;
  createdAt: string;
}
