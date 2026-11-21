import { StoreSection } from './recipe';

export type PantryFreshness = 'fresh' | 'use-soon' | 'past';

export interface PantryItem {
  id: string;
  name: string;
  category: StoreSection;
  quantityEstimate: string;
  freshness: PantryFreshness;
  confidence: number;
}

/** Only the analysed item list is kept — never the photos. */
export interface PantrySnapshot {
  id: string;
  takenAt: string;
  items: PantryItem[];
  useFirst: string[];
}
