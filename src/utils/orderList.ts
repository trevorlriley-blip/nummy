import { GroceryItem, GroceryList, GrocerySection } from '../types/groceryList';
import { BrandPreference, BRAND_LABELS, GroceryRequest, Staple } from '../types/ordering';
import { StoreSection } from '../types/recipe';
import { SECTION_DISPLAY_NAMES } from './groceryListGenerator';
import { markHaveIt, namesMatch, normalizeName } from './pantryMatch';

const SECTION_ORDER: StoreSection[] = [
  'produce', 'dairy', 'meat', 'seafood', 'deli', 'bakery',
  'pantry', 'spices', 'condiments', 'frozen', 'beverages', 'snacks', 'other',
];

export const STORE_SECTIONS = SECTION_ORDER;
export { SECTION_DISPLAY_NAMES };

/** "1 gallon" -> { quantity: 1, unit: "gallon" }; "eggs"-style text falls back to 1. */
export function parseQuantity(text: string): { quantity: number; unit: string } {
  const match = text.trim().match(/^([\d./]+)\s*(.*)/);
  if (match) return { quantity: parseFloat(match[1]) || 1, unit: match[2].trim() };
  return { quantity: 1, unit: text.trim() };
}

/** Per-item override > the staple's own setting > the global default. */
export function resolveBrandPref(
  item: Pick<GroceryItem, 'name' | 'brandPref'>,
  overrides: Record<string, BrandPreference>,
  defaultBrand: BrandPreference
): BrandPreference {
  return overrides[normalizeName(item.name)] ?? item.brandPref ?? defaultBrand;
}

export function smithsSearchUrl(itemName: string, pref: BrandPreference): string {
  const query = pref === 'store' ? `Kroger ${itemName}` : itemName;
  return `https://www.smithsfoodanddrug.com/search?query=${encodeURIComponent(query)}`;
}

function withTotals(list: GroceryList, sections: GrocerySection[]): GroceryList {
  const nonEmpty = sections.filter((s) => s.items.length > 0);
  const items = nonEmpty.flatMap((s) => s.items);
  return {
    ...list,
    sections: nonEmpty.map((s) => ({
      ...s,
      sectionTotal: Math.round(s.items.reduce((sum, i) => sum + i.estimatedCost, 0) * 100) / 100,
    })),
    totalItems: items.length,
    checkedItems: items.filter((i) => i.isChecked).length,
    totalEstimatedCost: Math.round(items.reduce((sum, i) => sum + i.estimatedCost, 0) * 100) / 100,
  };
}

/**
 * Idempotently merges weekly staples and family requests into a list:
 * - adds missing ones (staples are skipped when the list already has the item by normalized name)
 * - removes staple/request items whose staple/request no longer exists
 * - runs the pantry matcher on newly added items only (pantryNames = null skips matching)
 * Returns the same list object when nothing changed.
 */
export function addExtras(
  list: GroceryList,
  staples: Staple[],
  requests: GroceryRequest[],
  pantryNames: string[] | null
): { list: GroceryList; matched: number } {
  const wantedIds = new Set([...staples.map((s) => `staple-${s.id}`), ...requests.map((r) => `req-${r.id}`)]);

  let changed = false;
  let sections: GrocerySection[] = list.sections.map((section) => {
    const items = section.items.filter((i) => !i.source || wantedIds.has(i.id));
    if (items.length !== section.items.length) changed = true;
    return items.length === section.items.length ? section : { ...section, items };
  });

  const existing = sections.flatMap((s) => s.items);
  const existingIds = new Set(existing.map((i) => i.id));
  const additions: GroceryItem[] = [];

  for (const s of staples) {
    const id = `staple-${s.id}`;
    if (existingIds.has(id)) continue;
    if (existing.some((i) => namesMatch(i.name, s.name))) continue;
    const { quantity, unit } = parseQuantity(s.quantity);
    additions.push({
      id, name: s.name, quantity, unit, category: s.category, estimatedCost: 0,
      isChecked: false, fromRecipeIds: [], source: 'staple', tags: ['Staple'], brandPref: s.brandPreference,
    });
  }
  for (const r of requests) {
    const id = `req-${r.id}`;
    if (existingIds.has(id)) continue;
    additions.push({
      id, name: r.item, quantity: 1, unit: '', category: 'snacks', estimatedCost: 0,
      isChecked: false, fromRecipeIds: [], source: 'request', tags: [r.requester],
    });
  }

  if (additions.length > 0) {
    changed = true;
    const byCategory = new Map<StoreSection, GroceryItem[]>();
    for (const item of additions) byCategory.set(item.category, [...(byCategory.get(item.category) ?? []), item]);
    sections = sections.map((s) => {
      const extra = byCategory.get(s.category);
      if (!extra) return s;
      byCategory.delete(s.category);
      return { ...s, items: [...s.items, ...extra] };
    });
    for (const [category, items] of byCategory) {
      sections.push({ category, displayName: SECTION_DISPLAY_NAMES[category] ?? category, items, sectionTotal: 0 });
    }
    sections.sort((a, b) => SECTION_ORDER.indexOf(a.category) - SECTION_ORDER.indexOf(b.category));
  }

  if (!changed) return { list, matched: 0 };

  let next = withTotals(list, sections);
  let matched = 0;
  if (pantryNames && additions.length > 0) {
    const result = markHaveIt(next, pantryNames, new Set(additions.map((a) => a.id)));
    next = result.list;
    matched = result.count;
  }
  return { list: next, matched };
}

/** Plain-text order for sharing, grouped by section, leaving out items marked haveIt. */
export function formatOrderText(
  list: GroceryList,
  brandFor: (item: GroceryItem) => BrandPreference
): string {
  const lines: string[] = ["Smith's order"];
  for (const section of list.sections) {
    const items = section.items.filter((i) => !i.haveIt);
    if (items.length === 0) continue;
    lines.push('', section.displayName.toUpperCase());
    for (const item of items) {
      const qty = `${item.quantity}${item.unit ? ` ${item.unit}` : ''}`;
      const tags = item.tags?.length ? ` [${item.tags.join(', ')}]` : '';
      lines.push(`- ${qty} ${item.name} (${BRAND_LABELS[brandFor(item)].toLowerCase()})${tags}`);
    }
  }
  return lines.join('\n');
}
