import { WeeklyMealPlan } from '../types/mealPlan';
import { GroceryList, GrocerySection, GroceryItem } from '../types/groceryList';
import { Ingredient, StoreSection } from '../types/recipe';

interface MergeGroup {
  ids: string[];
  name: string;
  quantity: number;
  unit: string;
}

export function applyConsolidation(list: GroceryList, groups: MergeGroup[]): GroceryList {
  const allItems = list.sections.flatMap((s) => s.items);
  const originalById = new Map(allItems.map((i) => [i.id, i]));

  // Build id → group index map so each id maps to one group
  const idToGroupIdx = new Map<string, number>();
  groups.forEach((g, idx) => g.ids.forEach((id) => idToGroupIdx.set(id, idx)));

  const processedGroups = new Set<number>();
  const newItems: GroceryItem[] = [];
  let idCounter = 1;

  // Process all groups in order
  for (let idx = 0; idx < groups.length; idx++) {
    if (processedGroups.has(idx)) continue;
    processedGroups.add(idx);

    const group = groups[idx];
    const originals = group.ids.map((id) => originalById.get(id)).filter(Boolean) as GroceryItem[];
    if (originals.length === 0) continue;

    const totalCost = originals.reduce((sum, i) => sum + i.estimatedCost, 0);
    const fromRecipeIds = [...new Set(originals.flatMap((i) => i.fromRecipeIds))];

    newItems.push({
      id: `gi-${idCounter++}`,
      name: group.name,
      quantity: Math.round(group.quantity * 100) / 100,
      unit: group.unit,
      category: originals[0].category,
      estimatedCost: Math.round(totalCost * 100) / 100,
      isChecked: false,
      fromRecipeIds,
    });
  }

  // Include any items Claude missed (not in any group)
  for (const item of allItems) {
    if (!idToGroupIdx.has(item.id)) {
      newItems.push({ ...item, id: `gi-${idCounter++}` });
    }
  }

  // Re-group by section
  const sectionMap = new Map<StoreSection, GroceryItem[]>();
  for (const item of newItems) {
    const items = sectionMap.get(item.category) ?? [];
    items.push(item);
    sectionMap.set(item.category, items);
  }

  const sectionOrder: StoreSection[] = [
    'produce', 'dairy', 'meat', 'seafood', 'deli', 'bakery',
    'pantry', 'spices', 'condiments', 'frozen', 'beverages', 'snacks', 'other',
  ];

  const sections: GrocerySection[] = [];
  for (const [category, items] of sectionMap.entries()) {
    items.sort((a, b) => a.name.localeCompare(b.name));
    sections.push({
      category,
      displayName: SECTION_DISPLAY_NAMES[category] ?? category,
      items,
      sectionTotal: Math.round(items.reduce((sum, i) => sum + i.estimatedCost, 0) * 100) / 100,
    });
  }
  sections.sort((a, b) => sectionOrder.indexOf(a.category) - sectionOrder.indexOf(b.category));

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const totalCost = Math.round(sections.reduce((sum, s) => sum + s.sectionTotal, 0) * 100) / 100;

  return { ...list, sections, totalItems, totalEstimatedCost: totalCost, checkedItems: 0 };
}

const SECTION_DISPLAY_NAMES: Record<StoreSection, string> = {
  produce: 'Produce',
  dairy: 'Dairy & Eggs',
  meat: 'Meat & Poultry',
  seafood: 'Seafood',
  bakery: 'Bakery & Bread',
  pantry: 'Pantry Staples',
  frozen: 'Frozen',
  spices: 'Spices & Seasonings',
  condiments: 'Condiments & Sauces',
  beverages: 'Beverages',
  snacks: 'Snacks',
  deli: 'Deli',
  other: 'Other',
};

export function generateGroceryList(plan: WeeklyMealPlan): GroceryList {
  const ingredientMap = new Map<string, { item: GroceryItem; recipeIds: Set<string> }>();

  for (const day of plan.days) {
    for (const meal of day.meals) {
      const scaleFactor = meal.servings / meal.recipe.servings;
      for (const ingredient of meal.recipe.ingredients) {
        const key = `${ingredient.name.toLowerCase()}-${ingredient.unit}`;
        const existing = ingredientMap.get(key);
        if (existing) {
          existing.item.quantity += ingredient.quantity * scaleFactor;
          existing.item.estimatedCost += ingredient.estimatedCostUSD * scaleFactor;
          existing.recipeIds.add(meal.recipe.id);
        } else {
          ingredientMap.set(key, {
            item: {
              id: `gi-${ingredientMap.size + 1}`,
              name: ingredient.name,
              quantity: Math.round(ingredient.quantity * scaleFactor * 100) / 100,
              unit: ingredient.unit,
              category: ingredient.category,
              estimatedCost: Math.round(ingredient.estimatedCostUSD * scaleFactor * 100) / 100,
              isChecked: false,
              fromRecipeIds: [meal.recipe.id],
            },
            recipeIds: new Set([meal.recipe.id]),
          });
        }
      }
    }
  }

  // Group by section
  const sectionMap = new Map<StoreSection, GroceryItem[]>();
  for (const { item, recipeIds } of ingredientMap.values()) {
    item.fromRecipeIds = Array.from(recipeIds);
    item.quantity = Math.round(item.quantity * 100) / 100;
    item.estimatedCost = Math.round(item.estimatedCost * 100) / 100;
    const items = sectionMap.get(item.category) ?? [];
    items.push(item);
    sectionMap.set(item.category, items);
  }

  const sections: GrocerySection[] = [];
  for (const [category, items] of sectionMap.entries()) {
    items.sort((a, b) => a.name.localeCompare(b.name));
    sections.push({
      category,
      displayName: SECTION_DISPLAY_NAMES[category],
      items,
      sectionTotal: Math.round(items.reduce((sum, i) => sum + i.estimatedCost, 0) * 100) / 100,
    });
  }

  // Sort sections by standard store order
  const sectionOrder: StoreSection[] = [
    'produce', 'dairy', 'meat', 'seafood', 'deli', 'bakery',
    'pantry', 'spices', 'condiments', 'frozen', 'beverages', 'snacks', 'other',
  ];
  sections.sort((a, b) => sectionOrder.indexOf(a.category) - sectionOrder.indexOf(b.category));

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const totalCost = Math.round(sections.reduce((sum, s) => sum + s.sectionTotal, 0) * 100) / 100;

  return {
    id: `gl-${Date.now()}`,
    mealPlanId: plan.id,
    sections,
    totalEstimatedCost: totalCost,
    totalItems,
    checkedItems: 0,
    createdAt: new Date().toISOString(),
  };
}
