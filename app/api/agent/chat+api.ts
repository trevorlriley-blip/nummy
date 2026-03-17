import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from '../../../src/utils/agentPrompt';
import { agentTools } from '../../../src/utils/agentTools';
import {
  mapSpoonacularRecipe,
  type SpoonacularRecipe,
} from '../../../src/utils/spoonacularMapper';
import type { AgentChatRequest, AgentResponse } from '../../../src/types/agent';
import type { Recipe, MealType } from '../../../src/types/recipe';
import type { WeeklyMealPlan, PlannedMeal, DayPlan } from '../../../src/types/mealPlan';

// ---------------------------------------------------------------------------
// Spoonacular API helpers
// ---------------------------------------------------------------------------

const SPOONACULAR_BASE = 'https://api.spoonacular.com/recipes';

async function searchSpoonacular(params: Record<string, string | number>): Promise<SpoonacularRecipe[]> {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) return [];

  const url = new URL(`${SPOONACULAR_BASE}/complexSearch`);
  url.searchParams.set('apiKey', apiKey);
  url.searchParams.set('addRecipeInformation', 'true');
  url.searchParams.set('addRecipeNutrition', 'true');
  url.searchParams.set('fillIngredients', 'true');
  url.searchParams.set('instructionsRequired', 'true');

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error('Spoonacular error:', res.status, await res.text());
    return [];
  }

  const data = await res.json();
  return data.results ?? [];
}

// ---------------------------------------------------------------------------
// Recipe store — holds recipes found/generated during this request
// ---------------------------------------------------------------------------

class RecipeStore {
  private recipes = new Map<string, Recipe>();

  add(recipe: Recipe) {
    this.recipes.set(recipe.id, recipe);
  }

  get(id: string): Recipe | undefined {
    return this.recipes.get(id);
  }

  getAll(): Recipe[] {
    return Array.from(this.recipes.values());
  }
}

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

async function handleSearchRecipes(
  input: Record<string, unknown>,
  store: RecipeStore
): Promise<string> {
  const params: Record<string, string | number> = {};
  if (input.query) params.query = String(input.query);
  if (input.cuisine) params.cuisine = String(input.cuisine);
  if (input.diet) params.diet = String(input.diet);
  if (input.type) params.type = String(input.type);
  if (input.maxReadyTime) params.maxReadyTime = Number(input.maxReadyTime);
  if (input.intolerances) params.intolerances = String(input.intolerances);
  if (input.excludeIngredients) params.excludeIngredients = String(input.excludeIngredients);
  params.number = Math.min(Number(input.number) || 8, 10);

  const raw = await searchSpoonacular(params);
  if (raw.length === 0) {
    return JSON.stringify({ results: [], message: 'No recipes found. Try a different query or use generate_recipe to create a custom recipe.' });
  }

  const recipes = raw.map(mapSpoonacularRecipe);
  recipes.forEach((r) => store.add(r));

  return JSON.stringify({
    results: recipes.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description.slice(0, 150),
      cuisineType: r.cuisineType,
      mealTypes: r.mealTypes,
      dietaryTags: r.dietaryTags,
      totalTimeMinutes: r.totalTimeMinutes,
      estimatedCostPerServing: r.estimatedCostPerServing,
      calories: r.nutrition.calories,
      imageUri: r.imageUri,
    })),
  });
}

function handleGenerateRecipe(
  input: Record<string, unknown>,
  store: RecipeStore
): string {
  const id = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const mealType = String(input.mealType ?? 'dinner') as MealType;
  const title = String(input.title ?? 'Custom Recipe');
  const cuisineType = String(input.cuisineType ?? 'other');
  const description = String(input.description ?? '');
  const servings = Number(input.servings) || 4;
  const maxTime = Number(input.maxTimeMinutes) || 45;
  const dietaryReqs = (input.dietaryRequirements as string[]) ?? [];

  // Map ingredients from Claude's input
  const rawIngredients = (input.ingredients as Array<{
    name: string; quantity: number; unit: string; estimatedCostUSD?: number;
  }>) ?? [];
  const ingredients = rawIngredients.map((ing, i) => ({
    id: `ing-gen-${id}-${i}`,
    name: ing.name,
    quantity: ing.quantity,
    unit: (ing.unit && !['piece', 'pieces', 'whole', 'large', 'medium', 'small'].includes(ing.unit.toLowerCase()) ? ing.unit.toLowerCase() : '') as Recipe['ingredients'][0]['unit'],
    category: 'other' as const,
    estimatedCostUSD: ing.estimatedCostUSD ?? 0.5,
  }));

  // Map instructions from Claude's input
  const rawInstructions = (input.instructions as Array<{
    stepNumber: number; instruction: string; durationMinutes?: number;
  }>) ?? [];
  const instructions = rawInstructions.map((step) => ({
    stepNumber: step.stepNumber,
    instruction: step.instruction,
    durationMinutes: step.durationMinutes,
  }));

  const totalIngredientCost = ingredients.reduce((sum, ing) => sum + ing.estimatedCostUSD, 0);

  const recipe: Recipe = {
    id,
    title,
    description,
    imageUri: '',
    cuisineType: cuisineType as Recipe['cuisineType'],
    mealTypes: [mealType],
    dietaryTags: dietaryReqs as Recipe['dietaryTags'],
    prepTimeMinutes: Math.round(maxTime * 0.4),
    cookTimeMinutes: Math.round(maxTime * 0.6),
    totalTimeMinutes: maxTime,
    servings,
    difficulty: maxTime <= 20 ? 'easy' : maxTime >= 60 ? 'hard' : 'medium',
    ingredients,
    instructions,
    nutrition: {
      calories: Number(input.calories) || 0,
      protein: Number(input.protein) || 0,
      carbohydrates: Number(input.carbohydrates) || 0,
      fat: Number(input.fat) || 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      cholesterol: 0,
    },
    estimatedCostPerServing: Number(input.estimatedCostPerServing) || Math.round((totalIngredientCost / servings) * 100) / 100,
    allergens: [],
    createdAt: new Date().toISOString(),
  };

  store.add(recipe);

  return JSON.stringify({
    recipeId: id,
    message: `Custom recipe "${title}" created with ID ${id}. You can include this in the meal plan.`,
  });
}

function handleCreateMealPlan(
  input: Record<string, unknown>,
  store: RecipeStore
): WeeklyMealPlan | null {
  const daysInput = input.days as Array<{
    date: string;
    dayOfWeek: string;
    meals: Array<{ mealType: string; recipeId: string }>;
  }>;

  if (!daysInput || daysInput.length === 0) return null;

  let totalCost = 0;
  let totalCalories = 0;
  let mealCounter = 0;
  const days: DayPlan[] = [];

  for (const dayInput of daysInput) {
    const meals: PlannedMeal[] = [];

    for (const mealInput of dayInput.meals) {
      const recipe = store.get(mealInput.recipeId);
      if (!recipe) continue;

      mealCounter++;
      const servings = recipe.servings;
      totalCost += recipe.estimatedCostPerServing * servings;
      totalCalories += recipe.nutrition.calories * servings;

      meals.push({
        id: `pm-${String(mealCounter).padStart(3, '0')}`,
        mealType: mealInput.mealType as MealType,
        recipe,
        servings,
        date: dayInput.date,
        isCompleted: false,
      });
    }

    days.push({
      date: dayInput.date,
      dayOfWeek: dayInput.dayOfWeek,
      meals,
    });
  }

  const sortedDates = days.map((d) => d.date).sort();

  return {
    id: `plan-${Date.now()}`,
    weekStartDate: sortedDates[0],
    weekEndDate: sortedDates[sortedDates.length - 1],
    days,
    totalEstimatedCost: Math.round(totalCost * 100) / 100,
    totalCalories: Math.round(totalCalories),
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Main POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
      return Response.json(
        { error: 'ANTHROPIC_API_KEY not configured. Add it to your .env file.' },
        { status: 500 }
      );
    }

    const body = (await request.json()) as AgentChatRequest;
    const systemPrompt = buildSystemPrompt(body.context);
    const store = new RecipeStore();

    // Pre-populate the store with custom recipes so the agent can reference them by ID
    if (body.customRecipes?.length) {
      body.customRecipes.forEach((r) => store.add(r));
    }

    const client = new Anthropic({ apiKey, maxRetries: 0 });

    // Convert messages to Anthropic format
    let messages: Anthropic.MessageParam[] = body.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    let plan: WeeklyMealPlan | null = null;
    let finalText = '';
    const maxToolRounds = 4;
    // EAS Hosting (Cloudflare Workers) has a strict subrequest limit.
    // With maxRetries:0, each Anthropic call = 1 subrequest. Budget: 4 + 4 = 8 total.
    let spoonacularCallCount = 0;
    const maxSpoonacularCalls = 4;

    for (let round = 0; round < maxToolRounds; round++) {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        tools: agentTools,
        messages,
      });

      // Collect text and tool_use blocks
      const textParts: string[] = [];
      const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use') as Anthropic.ToolUseBlock[];
      for (const block of response.content) {
        if (block.type === 'text') textParts.push(block.text);
      }

      // Execute all tool calls in parallel to minimise wall-clock time
      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (block) => {
          let result: string;

          if (block.name === 'search_recipes') {
            if (spoonacularCallCount >= maxSpoonacularCalls) {
              result = JSON.stringify({ results: [], message: 'Search limit reached. Use generate_recipe to create any remaining meals.' });
            } else {
              spoonacularCallCount++;
              result = await handleSearchRecipes(block.input as Record<string, unknown>, store);
            }
          } else if (block.name === 'generate_recipe') {
            result = handleGenerateRecipe(block.input as Record<string, unknown>, store);
          } else if (block.name === 'create_meal_plan') {
            plan = handleCreateMealPlan(block.input as Record<string, unknown>, store);
            result = plan
              ? JSON.stringify({ success: true, mealCount: plan.days.reduce((s, d) => s + d.meals.length, 0) })
              : JSON.stringify({ success: false, error: 'Failed to create plan — some recipe IDs were not found.' });
          } else {
            result = JSON.stringify({ error: `Unknown tool: ${block.name}` });
          }

          return {
            type: 'tool_result' as const,
            tool_use_id: block.id,
            content: result,
          };
        })
      );

      finalText = textParts.join('\n');

      // If no tools were called, we're done
      if (toolResults.length === 0) {
        break;
      }

      // Stop as soon as we have a plan — no extra summary round needed
      if (plan) break;

      // Feed tool results back for next round
      messages = [
        ...messages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ];
    }

    // Cast to break any 'never' narrowing TypeScript applies after the for-loop break checks
    const finalPlan = plan as WeeklyMealPlan | null;

    // Build suggested quick replies based on conversation state
    const quickReplies = finalPlan
      ? []
      : buildQuickReplies(messages.length);

    // Include all searched/generated recipes not already in the plan as swap alternatives
    const planRecipeIds = new Set<string>(
      finalPlan ? finalPlan.days.flatMap((d) => d.meals.map((m) => m.recipe.id)) : []
    );
    const extraRecipes = store.getAll().filter((r) => !planRecipeIds.has(r.id));

    const agentResponse: AgentResponse = {
      message: finalText,
      plan: finalPlan,
      quickReplies,
      ...(extraRecipes.length > 0 ? { extraRecipes } : {}),
    };

    return Response.json(agentResponse);
  } catch (error) {
    console.error('Agent chat error:', error);

    let userMessage = 'Sorry, I ran into an issue. Please try again.';

    if (error instanceof Anthropic.APIError) {
      if (error.status === 400 && error.message?.includes('credit balance')) {
        userMessage =
          'Your Anthropic API credit balance is too low. Please visit console.anthropic.com to add credits, then try again.';
      } else if (error.status === 401) {
        userMessage =
          'Your Anthropic API key is invalid. Please check the key in your .env file.';
      } else if (error.status === 429) {
        userMessage =
          'Too many requests — the API is rate-limited. Please wait a moment and try again.';
      }
    }

    return Response.json(
      {
        message: userMessage,
        plan: null,
        quickReplies: [{ label: 'Try again', message: 'Let\'s try that again' }],
      } satisfies AgentResponse,
      { status: 200 } // Return 200 so client can show the error message
    );
  }
}

function buildQuickReplies(messageCount: number): AgentResponse['quickReplies'] {
  if (messageCount <= 2) {
    // Early conversation — offer broad suggestions
    return [
      { label: 'Plan all 7 days', message: 'Plan meals for every day this week' },
      { label: 'Italian', message: "I'm craving Italian food this week" },
      { label: 'Extra healthy', message: 'I want to eat extra healthy this week' },
      { label: 'Quick meals', message: 'I need quick meals under 30 minutes this week' },
      { label: 'Surprise me', message: 'Surprise me with something new and exciting!' },
    ];
  }

  // Later in conversation — offer action-oriented suggestions
  return [
    { label: 'Looks good!', message: "That sounds great, let's go with that!" },
    { label: 'More variety', message: 'Can you add more variety to the cuisines?' },
    { label: 'Simpler meals', message: 'Can you make the meals simpler and quicker?' },
  ];
}
