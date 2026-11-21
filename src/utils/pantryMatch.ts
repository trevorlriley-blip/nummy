import type { GroceryList } from '../types/groceryList';

/**
 * Name matching between pantry items, grocery items and recipe ingredients.
 * Case-insensitive, singular/plural tolerant, with a small synonym map.
 */

const SYNONYMS: Record<string, string> = {
  scallion: 'green onion',
  'spring onion': 'green onion',
  cilantro: 'coriander',
  'garbanzo bean': 'chickpea',
  capsicum: 'bell pepper',
  aubergine: 'eggplant',
  courgette: 'zucchini',
  rocket: 'arugula',
  'confectioners sugar': 'powdered sugar',
  'icing sugar': 'powdered sugar',
  'caster sugar': 'sugar',
  'granulated sugar': 'sugar',
  'plain flour': 'flour',
  'all-purpose flour': 'flour',
  'all purpose flour': 'flour',
  'double cream': 'heavy cream',
  'heavy whipping cream': 'heavy cream',
  'whipping cream': 'heavy cream',
  'extra virgin olive oil': 'olive oil',
  'beef mince': 'ground beef',
  'minced beef': 'ground beef',
  'russet potato': 'potato',
  'yukon gold potato': 'potato',
};

const DESCRIPTORS = new Set(['fresh', 'organic', 'ripe', 'large', 'small', 'medium', 'raw']);
const KEEP_S = new Set(['hummus', 'asparagus', 'couscous', 'molasses', 'lemongrass', 'swiss', 'citrus', 'bass', 'grits', 'oats']);

function singularizeWord(w: string): string {
  if (w.length <= 3 || KEEP_S.has(w)) return w;
  if (w.endsWith('ies') && w.length > 4) return `${w.slice(0, -3)}y`;
  if (/(oes)$/.test(w)) return w.slice(0, -2);
  if (/(ches|shes|xes|sses)$/.test(w)) return w.slice(0, -2);
  if (w.endsWith('ss') || w.endsWith('us')) return w;
  if (w.endsWith('s')) return w.slice(0, -1);
  return w;
}

/** Lowercase, drop punctuation/descriptors, singularize each word, apply synonyms. */
export function normalizeName(raw: string): string {
  const words = raw
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !DESCRIPTORS.has(w))
    .map(singularizeWord);
  const name = words.join(' ').trim();
  return SYNONYMS[name] ?? name;
}

/** True when two names refer to the same ingredient. */
export function namesMatch(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  return na.length > 0 && na === nb;
}

/** Looser check for recipes: does the ingredient name contain the item as whole words? */
export function ingredientContains(ingredientName: string, itemName: string): boolean {
  const ing = ` ${normalizeName(ingredientName)} `;
  const item = normalizeName(itemName);
  return item.length > 0 && ing.includes(` ${item} `);
}

/** Marks every list item whose name matches a pantry name as haveIt (clearing stale flags). */
export function markHaveIt(
  list: GroceryList,
  pantryNames: string[]
): { list: GroceryList; count: number } {
  let count = 0;
  const sections = list.sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      const haveIt = pantryNames.some((n) => namesMatch(n, item.name));
      if (haveIt) count++;
      return { ...item, haveIt };
    }),
  }));
  return { list: { ...list, sections }, count };
}

export const SNAPSHOT_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
