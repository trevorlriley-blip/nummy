import {
  Recipe,
  Ingredient,
  InstructionStep,
  NutritionInfo,
  CuisineType,
  MealType,
  DietaryTag,
  IngredientUnit,
  StoreSection,
} from '../types/recipe';

// ---------------------------------------------------------------------------
// Spoonacular response types (subset of fields we use)
// ---------------------------------------------------------------------------

export interface SpoonacularRecipe {
  id: number;
  title: string;
  summary?: string;
  image?: string;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  preparationMinutes?: number;
  cookingMinutes?: number;
  readyInMinutes?: number;
  servings?: number;
  pricePerServing?: number;
  extendedIngredients?: SpoonacularIngredient[];
  analyzedInstructions?: { steps: SpoonacularStep[] }[];
  nutrition?: { nutrients: SpoonacularNutrient[] };
}

interface SpoonacularIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  aisle?: string;
  estimatedCost?: { value: number };
}

interface SpoonacularStep {
  number: number;
  step: string;
  length?: { number: number; unit: string };
}

interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
}

// ---------------------------------------------------------------------------
// Clean 3-sentence summary builder
// ---------------------------------------------------------------------------

function extractSpoonacularScore(rawSummary?: string): number | null {
  if (!rawSummary) return null;
  const match = rawSummary.match(/spoonacular score of (\d+)%/i);
  return match ? parseInt(match[1], 10) : null;
}

function buildRecipeSummary(
  title: string,
  mealTypes: MealType[],
  cuisineType: CuisineType | undefined,
  dietaryTags: DietaryTag[],
  totalTimeMinutes: number,
  difficulty: 'easy' | 'medium' | 'hard',
  rawSummary?: string,
): string {
  // Sentence 1 — what is it
  const mealLabel = mealTypes[0] === 'dinner' ? 'dinner' : mealTypes[0] === 'breakfast' ? 'breakfast' : mealTypes[0] === 'lunch' ? 'lunch' : mealTypes[0] ?? 'dish';
  const cuisineLabel = cuisineType && cuisineType !== 'other' ? `${cuisineType} ` : '';
  const timeLabel = totalTimeMinutes > 0 ? ` ready in about ${totalTimeMinutes} minutes` : '';
  const s1 = `${title} is a ${cuisineLabel}${mealLabel}${timeLabel}.`;

  // Sentence 2 — why you'd like it
  const highlights: string[] = [];
  if (difficulty === 'easy') highlights.push('easy to make');
  if (dietaryTags.includes('gluten-free')) highlights.push('gluten-free');
  if (dietaryTags.includes('dairy-free')) highlights.push('dairy-free');
  if (dietaryTags.includes('vegan')) highlights.push('vegan');
  else if (dietaryTags.includes('vegetarian')) highlights.push('vegetarian');
  if (dietaryTags.includes('keto')) highlights.push('keto-friendly');
  if (dietaryTags.includes('paleo')) highlights.push('paleo-friendly');
  if (dietaryTags.includes('high-protein')) highlights.push('high in protein');
  const s2 = highlights.length > 0
    ? `It's ${highlights.join(', ')} and a great choice for a satisfying meal.`
    : 'It makes a satisfying and flavorful meal the whole family can enjoy.';

  // Sentence 3 — score (if available)
  const score = extractSpoonacularScore(rawSummary);
  let s3 = '';
  if (score !== null) {
    const rating = score >= 80 ? 'excellent' : score >= 60 ? 'solid' : 'decent';
    s3 = ` Spoonacular rates it ${score}%, a ${rating} score.`;
  }

  return s1 + ' ' + s2 + s3;
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const CUISINE_MAP: Record<string, CuisineType> = {
  american: 'american',
  italian: 'italian',
  mexican: 'mexican',
  asian: 'asian',
  indian: 'indian',
  mediterranean: 'mediterranean',
  'middle eastern': 'middle-eastern',
  french: 'french',
  thai: 'thai',
  japanese: 'japanese',
  chinese: 'chinese',
  korean: 'korean',
  greek: 'greek',
};

const MEAL_TYPE_MAP: Record<string, MealType> = {
  breakfast: 'breakfast',
  'morning meal': 'breakfast',
  brunch: 'breakfast',
  lunch: 'lunch',
  'main course': 'dinner',
  'main dish': 'dinner',
  dinner: 'dinner',
  snack: 'snack',
  appetizer: 'snack',
  'side dish': 'snack',
  dessert: 'dessert',
};

const DIET_MAP: Record<string, DietaryTag> = {
  vegetarian: 'vegetarian',
  'lacto vegetarian': 'vegetarian',
  'ovo vegetarian': 'vegetarian',
  'lacto ovo vegetarian': 'vegetarian',
  vegan: 'vegan',
  'gluten free': 'gluten-free',
  'dairy free': 'dairy-free',
  ketogenic: 'keto',
  paleolithic: 'paleo',
  paleo: 'paleo',
};

const UNIT_MAP: Record<string, IngredientUnit> = {
  cup: 'cups', cups: 'cups',
  tablespoon: 'tbsp', tablespoons: 'tbsp', tbsp: 'tbsp', tbsps: 'tbsp', Tbsp: 'tbsp',
  teaspoon: 'tsp', teaspoons: 'tsp', tsp: 'tsp', tsps: 'tsp',
  ounce: 'oz', ounces: 'oz', oz: 'oz',
  pound: 'lbs', pounds: 'lbs', lb: 'lbs', lbs: 'lbs',
  gram: 'g', grams: 'g', g: 'g',
  kilogram: 'kg', kilograms: 'kg', kg: 'kg',
  milliliter: 'ml', milliliters: 'ml', ml: 'ml',
  liter: 'liters', liters: 'liters', l: 'liters',
  piece: '', pieces: '', whole: '',
  large: '', medium: '', small: '',
  clove: 'cloves', cloves: 'cloves',
  slice: 'slices', slices: 'slices',
  bunch: 'bunch',
  can: 'can', cans: 'can',
  package: 'package', packages: 'package',
};

const AISLE_TO_SECTION: Record<string, StoreSection> = {
  produce: 'produce',
  'fresh vegetables': 'produce',
  'fresh fruits': 'produce',
  'milk, eggs, other dairy': 'dairy',
  'cheese': 'dairy',
  dairy: 'dairy',
  'meat': 'meat',
  'poultry': 'meat',
  seafood: 'seafood',
  'baking': 'pantry',
  'pasta and rice': 'pantry',
  'canned and jarred': 'pantry',
  'oil, vinegar, salad dressing': 'pantry',
  'cereal': 'pantry',
  'nuts': 'pantry',
  bakery: 'bakery',
  'bread': 'bakery',
  'frozen': 'frozen',
  'spices and seasonings': 'spices',
  'condiments': 'condiments',
  beverages: 'beverages',
  snacks: 'snacks',
};

function mapAisleToSection(aisle?: string): StoreSection {
  if (!aisle) return 'other';
  const lower = aisle.toLowerCase();
  for (const [key, section] of Object.entries(AISLE_TO_SECTION)) {
    if (lower.includes(key)) return section;
  }
  return 'other';
}

function mapUnit(unit: string): IngredientUnit {
  if (!unit || unit.trim() === '') return '';
  const key = unit.toLowerCase();
  if (key in UNIT_MAP) return UNIT_MAP[key];
  return key;
}


function findNutrient(nutrients: SpoonacularNutrient[], name: string): number {
  return nutrients.find((n) => n.name.toLowerCase() === name.toLowerCase())?.amount ?? 0;
}

// ---------------------------------------------------------------------------
// Main mapper
// ---------------------------------------------------------------------------

export function mapSpoonacularRecipe(raw: SpoonacularRecipe): Recipe {
  const cuisines = (raw.cuisines ?? []).map((c) => c.toLowerCase());
  const cuisineType: CuisineType = cuisines
    .map((c) => CUISINE_MAP[c])
    .find((c) => c !== undefined) ?? 'other';

  const dishTypes = (raw.dishTypes ?? []).map((d) => d.toLowerCase());
  const mealTypes: MealType[] = [
    ...new Set(dishTypes.map((d) => MEAL_TYPE_MAP[d]).filter((m): m is MealType => !!m)),
  ];
  if (mealTypes.length === 0) mealTypes.push('dinner');

  const diets = (raw.diets ?? []).map((d) => d.toLowerCase());
  const dietaryTags: DietaryTag[] = [
    ...new Set(diets.map((d) => DIET_MAP[d]).filter((t): t is DietaryTag => !!t)),
  ];

  const ingredients: Ingredient[] = (raw.extendedIngredients ?? []).map((ing, i) => ({
    id: `ing-spoon-${raw.id}-${i}`,
    name: ing.name,
    quantity: Math.round(ing.amount * 100) / 100,
    unit: mapUnit(ing.unit),
    category: mapAisleToSection(ing.aisle),
    estimatedCostUSD: ing.estimatedCost ? ing.estimatedCost.value / 100 : 0.5,
  }));

  const instructions: InstructionStep[] = (raw.analyzedInstructions?.[0]?.steps ?? []).map(
    (step) => ({
      stepNumber: step.number,
      instruction: step.step,
      durationMinutes: step.length?.unit === 'minutes' ? step.length.number : undefined,
    })
  );

  const nutrients = raw.nutrition?.nutrients ?? [];
  const nutrition: NutritionInfo = {
    calories: Math.round(findNutrient(nutrients, 'Calories')),
    protein: Math.round(findNutrient(nutrients, 'Protein')),
    carbohydrates: Math.round(findNutrient(nutrients, 'Carbohydrates')),
    fat: Math.round(findNutrient(nutrients, 'Fat')),
    fiber: Math.round(findNutrient(nutrients, 'Fiber') * 10) / 10,
    sugar: Math.round(findNutrient(nutrients, 'Sugar') * 10) / 10,
    sodium: Math.round(findNutrient(nutrients, 'Sodium')),
    cholesterol: Math.round(findNutrient(nutrients, 'Cholesterol')),
  };

  const prepTime = raw.preparationMinutes ?? Math.round((raw.readyInMinutes ?? 30) * 0.4);
  const cookTime = raw.cookingMinutes ?? Math.round((raw.readyInMinutes ?? 30) * 0.6);
  const totalTime = raw.readyInMinutes ?? prepTime + cookTime;

  const totalIngredientCost = ingredients.reduce((sum, ing) => sum + ing.estimatedCostUSD, 0);
  const servings = raw.servings ?? 4;
  const costPerServing =
    raw.pricePerServing != null
      ? Math.round(raw.pricePerServing) / 100
      : Math.round((totalIngredientCost / servings) * 100) / 100;

  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (totalTime <= 20 && ingredients.length <= 6) difficulty = 'easy';
  else if (totalTime >= 60 || ingredients.length >= 15) difficulty = 'hard';

  return {
    id: `spoon-${raw.id}`,
    title: raw.title,
    description: buildRecipeSummary(raw.title, mealTypes, cuisineType, dietaryTags, totalTime, difficulty, raw.summary),
    imageUri: raw.image ?? '',
    cuisineType,
    mealTypes,
    dietaryTags,
    prepTimeMinutes: prepTime,
    cookTimeMinutes: cookTime,
    totalTimeMinutes: totalTime,
    servings,
    difficulty,
    ingredients,
    instructions,
    nutrition,
    estimatedCostPerServing: costPerServing,
    allergens: [],
    createdAt: new Date().toISOString(),
  };
}
