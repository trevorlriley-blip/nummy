import type Anthropic from '@anthropic-ai/sdk';

export const agentTools: Anthropic.Tool[] = [
  {
    name: 'search_recipes',
    description:
      'Search for real recipes from a database of 365,000+ recipes. Returns recipe summaries with IDs. Use this to find recipes matching user preferences.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Natural language search query (e.g., "healthy chicken stir fry")',
        },
        cuisine: {
          type: 'string',
          description:
            'Cuisine type filter (e.g., italian, mexican, asian, indian, mediterranean, thai, japanese, chinese, korean, greek, french, american)',
        },
        diet: {
          type: 'string',
          description:
            'Diet filter (e.g., vegetarian, vegan, gluten free, dairy free, ketogenic, paleo)',
        },
        type: {
          type: 'string',
          description:
            'Meal type filter (e.g., breakfast, main course, side dish, dessert, snack, appetizer)',
        },
        maxReadyTime: {
          type: 'number',
          description: 'Maximum total time in minutes to prepare and cook',
        },
        intolerances: {
          type: 'string',
          description:
            'Comma-separated allergens to exclude (e.g., "dairy, gluten, peanut, shellfish")',
        },
        excludeIngredients: {
          type: 'string',
          description: 'Comma-separated ingredients to exclude',
        },
        number: {
          type: 'number',
          description: 'Number of results to return (1-10, default 5)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'generate_recipe',
    description:
      'Generate a custom recipe when the search database does not have a good match. You MUST provide full ingredients and instructions — never leave them empty. Only use this as a fallback when search_recipes does not return suitable results.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: {
          type: 'string',
          description: 'Recipe title',
        },
        cuisineType: {
          type: 'string',
          description: 'Cuisine type',
        },
        mealType: {
          type: 'string',
          description: 'Meal type: breakfast, lunch, dinner, snack, or dessert',
        },
        description: {
          type: 'string',
          description: 'Detailed description of what the recipe should be like',
        },
        maxTimeMinutes: {
          type: 'number',
          description: 'Maximum total preparation time in minutes',
        },
        servings: {
          type: 'number',
          description: 'Number of servings',
        },
        dietaryRequirements: {
          type: 'array',
          items: { type: 'string' },
          description: 'Dietary requirements to satisfy (e.g., ["gluten-free", "dairy-free"])',
        },
        ingredients: {
          type: 'array',
          description: 'Full list of ingredients with quantities. REQUIRED.',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Ingredient name' },
              quantity: { type: 'number', description: 'Amount needed' },
              unit: { type: 'string', description: 'Unit of measurement (cups, tbsp, tsp, oz, lbs, g, pieces, etc.)' },
              estimatedCostUSD: { type: 'number', description: 'Estimated cost in USD' },
            },
            required: ['name', 'quantity', 'unit'],
          },
        },
        instructions: {
          type: 'array',
          description: 'Step-by-step cooking instructions. REQUIRED.',
          items: {
            type: 'object',
            properties: {
              stepNumber: { type: 'number', description: 'Step number' },
              instruction: { type: 'string', description: 'What to do in this step' },
              durationMinutes: { type: 'number', description: 'Approximate time for this step' },
            },
            required: ['stepNumber', 'instruction'],
          },
        },
        calories: {
          type: 'number',
          description: 'Estimated calories per serving',
        },
        protein: {
          type: 'number',
          description: 'Estimated protein in grams per serving',
        },
        carbohydrates: {
          type: 'number',
          description: 'Estimated carbs in grams per serving',
        },
        fat: {
          type: 'number',
          description: 'Estimated fat in grams per serving',
        },
        estimatedCostPerServing: {
          type: 'number',
          description: 'Estimated cost per serving in USD',
        },
      },
      required: ['title', 'mealType', 'description', 'ingredients', 'instructions'],
    },
  },
  {
    name: 'create_meal_plan',
    description:
      'Create the final weekly meal plan. Only include days the user wants meals planned for — skip days they are eating out, traveling, or otherwise unavailable. Call this when you have selected recipes for all requested days.',
    input_schema: {
      type: 'object' as const,
      properties: {
        days: {
          type: 'array',
          description:
            'Array of days to include in the plan. May be fewer than 7 if the user is skipping certain days.',
          items: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                description: 'Date in YYYY-MM-DD format',
              },
              dayOfWeek: {
                type: 'string',
                description: 'Day name (e.g., "Monday")',
              },
              meals: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    mealType: {
                      type: 'string',
                      description: 'breakfast, lunch, dinner, snack, or dessert',
                    },
                    recipeId: {
                      type: 'string',
                      description:
                        'The recipe ID from search results (spoon-XXXX) or generated recipes (gen-XXXX)',
                    },
                  },
                  required: ['mealType', 'recipeId'],
                },
              },
            },
            required: ['date', 'dayOfWeek', 'meals'],
          },
        },
      },
      required: ['days'],
    },
  },
];
