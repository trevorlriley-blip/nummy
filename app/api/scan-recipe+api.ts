import Anthropic from '@anthropic-ai/sdk';
import type { Recipe, MealType, CuisineType } from '../../src/types/recipe';

const SCAN_PROMPT = `You are a recipe extraction assistant. The user has photographed a recipe (from a cookbook, handwritten note, website screenshot, or similar). Extract it into structured JSON.

Return ONLY a JSON object — no markdown, no explanation, no code fences. Use this exact shape:
{
  "title": "Recipe Name",
  "description": "A brief 1-2 sentence description of the dish.",
  "mealTypes": ["dinner"],
  "cuisineType": "italian",
  "difficulty": "medium",
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 30,
  "servings": 4,
  "ingredients": [
    { "name": "all-purpose flour", "quantity": "2 cups" },
    { "name": "kosher salt", "quantity": "1 tsp" }
  ],
  "instructions": [
    "Preheat oven to 375°F.",
    "Mix flour and salt in a bowl."
  ]
}

Rules:
- mealTypes: array containing one or more of: "breakfast", "lunch", "dinner", "snack", "dessert"
- cuisineType: one of: "american", "italian", "mexican", "asian", "indian", "mediterranean", "middle-eastern", "french", "thai", "japanese", "chinese", "korean", "greek", "other"
- difficulty: "easy", "medium", or "hard"
- If any field is unclear from the image, use a sensible default (servings: 4, difficulty: "medium", cuisineType: "other")
- Keep instructions as plain strings (no numbering needed, we add that)
- quantity can be a free-form string like "2 cups", "1 lb", "a handful"
- If you cannot identify a recipe in the image, return: { "error": "No recipe found in image" }`;

interface ScanRecipeRequest {
  imageBase64: string;
  mimeType: string;
}

interface ScannedIngredient {
  name: string;
  quantity: string;
}

interface ScannedRecipe {
  title: string;
  description: string;
  mealTypes: MealType[];
  cuisineType: CuisineType;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: ScannedIngredient[];
  instructions: string[];
  error?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'API not configured' }, { status: 500 });
    }

    const body = (await request.json()) as ScanRecipeRequest;
    if (!body.imageBase64) {
      return Response.json({ error: 'Missing imageBase64' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: body.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: body.imageBase64,
              },
            },
            {
              type: 'text',
              text: SCAN_PROMPT,
            },
          ],
        },
      ],
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';

    let scanned: ScannedRecipe;
    try {
      scanned = JSON.parse(rawText);
    } catch {
      return Response.json({ error: 'Could not parse recipe from image' }, { status: 422 });
    }

    if (scanned.error) {
      return Response.json({ error: scanned.error }, { status: 422 });
    }

    // Transform into the app's Recipe shape (partial — client fills in id/createdAt)
    const partialRecipe: Omit<Recipe, 'id' | 'createdAt'> = {
      title: scanned.title || 'Untitled Recipe',
      description: scanned.description || '',
      imageUri: '',
      mealTypes: scanned.mealTypes?.length ? scanned.mealTypes : ['dinner'],
      cuisineType: scanned.cuisineType || 'other',
      difficulty: scanned.difficulty || 'medium',
      prepTimeMinutes: scanned.prepTimeMinutes || 0,
      cookTimeMinutes: scanned.cookTimeMinutes || 0,
      totalTimeMinutes: (scanned.prepTimeMinutes || 0) + (scanned.cookTimeMinutes || 0),
      servings: scanned.servings || 4,
      dietaryTags: [],
      ingredients: (scanned.ingredients || []).map((ing, i) => ({
        id: `ing-scan-${i}`,
        name: ing.name,
        quantity: parseFloat(ing.quantity) || 1,
        unit: ing.quantity.replace(/^[\d.]+\s*/, '') as Recipe['ingredients'][0]['unit'],
        category: 'other' as const,
        estimatedCostUSD: 0,
      })),
      instructions: (scanned.instructions || []).map((text, i) => ({
        stepNumber: i + 1,
        instruction: text,
      })),
      nutrition: {
        calories: 0, protein: 0, carbohydrates: 0, fat: 0,
        fiber: 0, sugar: 0, sodium: 0, cholesterol: 0,
      },
      estimatedCostPerServing: 0,
      allergens: [],
    };

    return Response.json({ recipe: partialRecipe });
  } catch (error) {
    console.error('Scan recipe error:', error);
    return Response.json({ error: 'Failed to scan recipe' }, { status: 500 });
  }
}
