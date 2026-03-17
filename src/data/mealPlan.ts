import { WeeklyMealPlan } from '../types/mealPlan';
import { sampleRecipes } from './recipes';

/**
 * Sample weekly meal plan for Feb 9-15, 2026.
 * Monday and Tuesday meals are marked as completed.
 * Uses recipes from sampleRecipes by index.
 */
export const sampleWeeklyPlan: WeeklyMealPlan = {
  id: 'plan-week-2026-02-09',
  weekStartDate: '2026-02-09',
  weekEndDate: '2026-02-15',
  days: [
    // Monday Feb 9 — completed
    {
      date: '2026-02-09',
      dayOfWeek: 'Monday',
      meals: [
        {
          id: 'pm-mon-breakfast',
          mealType: 'breakfast',
          recipe: sampleRecipes[1], // Overnight Oats with Berries
          servings: 4,
          date: '2026-02-09',
          isCompleted: true,
        },
        {
          id: 'pm-mon-lunch',
          mealType: 'lunch',
          recipe: sampleRecipes[0], // Mediterranean Chicken Bowl
          servings: 4,
          date: '2026-02-09',
          isCompleted: true,
        },
        {
          id: 'pm-mon-dinner',
          mealType: 'dinner',
          recipe: sampleRecipes[6], // Chicken Tikka Masala
          servings: 4,
          date: '2026-02-09',
          isCompleted: true,
        },
        {
          id: 'pm-mon-snack',
          mealType: 'snack',
          recipe: sampleRecipes[14], // Hummus & Veggie Snack Plate
          servings: 4,
          date: '2026-02-09',
          isCompleted: true,
        },
      ],
    },
    // Tuesday Feb 10 — completed
    {
      date: '2026-02-10',
      dayOfWeek: 'Tuesday',
      meals: [
        {
          id: 'pm-tue-breakfast',
          mealType: 'breakfast',
          recipe: sampleRecipes[5], // Spinach & Feta Egg Muffins
          servings: 4,
          date: '2026-02-10',
          isCompleted: true,
        },
        {
          id: 'pm-tue-lunch',
          mealType: 'lunch',
          recipe: sampleRecipes[7], // Greek Salad with Grilled Shrimp
          servings: 4,
          date: '2026-02-10',
          isCompleted: true,
        },
        {
          id: 'pm-tue-dinner',
          mealType: 'dinner',
          recipe: sampleRecipes[3], // Grilled Salmon with Asparagus
          servings: 4,
          date: '2026-02-10',
          isCompleted: true,
        },
        {
          id: 'pm-tue-snack',
          mealType: 'snack',
          recipe: sampleRecipes[17], // Granola Energy Bites
          servings: 4,
          date: '2026-02-10',
          isCompleted: true,
        },
      ],
    },
    // Wednesday Feb 11
    {
      date: '2026-02-11',
      dayOfWeek: 'Wednesday',
      meals: [
        {
          id: 'pm-wed-breakfast',
          mealType: 'breakfast',
          recipe: sampleRecipes[8], // Banana Protein Pancakes
          servings: 4,
          date: '2026-02-11',
          isCompleted: false,
        },
        {
          id: 'pm-wed-lunch',
          mealType: 'lunch',
          recipe: sampleRecipes[2], // Vegan Black Bean Tacos
          servings: 4,
          date: '2026-02-11',
          isCompleted: false,
        },
        {
          id: 'pm-wed-dinner',
          mealType: 'dinner',
          recipe: sampleRecipes[13], // Caprese Stuffed Chicken
          servings: 4,
          date: '2026-02-11',
          isCompleted: false,
        },
        {
          id: 'pm-wed-snack',
          mealType: 'snack',
          recipe: sampleRecipes[12], // Acai Smoothie Bowl
          servings: 4,
          date: '2026-02-11',
          isCompleted: false,
        },
      ],
    },
    // Thursday Feb 12
    {
      date: '2026-02-12',
      dayOfWeek: 'Thursday',
      meals: [
        {
          id: 'pm-thu-breakfast',
          mealType: 'breakfast',
          recipe: sampleRecipes[18], // Shakshuka
          servings: 4,
          date: '2026-02-12',
          isCompleted: false,
        },
        {
          id: 'pm-thu-lunch',
          mealType: 'lunch',
          recipe: sampleRecipes[9], // Turkey & Veggie Lettuce Wraps
          servings: 4,
          date: '2026-02-12',
          isCompleted: false,
        },
        {
          id: 'pm-thu-dinner',
          mealType: 'dinner',
          recipe: sampleRecipes[4], // Thai Peanut Noodle Stir-Fry
          servings: 4,
          date: '2026-02-12',
          isCompleted: false,
        },
        {
          id: 'pm-thu-snack',
          mealType: 'snack',
          recipe: sampleRecipes[14], // Hummus & Veggie Snack Plate
          servings: 4,
          date: '2026-02-12',
          isCompleted: false,
        },
      ],
    },
    // Friday Feb 13
    {
      date: '2026-02-13',
      dayOfWeek: 'Friday',
      meals: [
        {
          id: 'pm-fri-breakfast',
          mealType: 'breakfast',
          recipe: sampleRecipes[1], // Overnight Oats with Berries
          servings: 4,
          date: '2026-02-13',
          isCompleted: false,
        },
        {
          id: 'pm-fri-lunch',
          mealType: 'lunch',
          recipe: sampleRecipes[10], // Lentil Soup
          servings: 4,
          date: '2026-02-13',
          isCompleted: false,
        },
        {
          id: 'pm-fri-dinner',
          mealType: 'dinner',
          recipe: sampleRecipes[11], // Baked Cod with Roasted Vegetables
          servings: 4,
          date: '2026-02-13',
          isCompleted: false,
        },
        {
          id: 'pm-fri-snack',
          mealType: 'snack',
          recipe: sampleRecipes[17], // Granola Energy Bites
          servings: 4,
          date: '2026-02-13',
          isCompleted: false,
        },
      ],
    },
    // Saturday Feb 14
    {
      date: '2026-02-14',
      dayOfWeek: 'Saturday',
      meals: [
        {
          id: 'pm-sat-breakfast',
          mealType: 'breakfast',
          recipe: sampleRecipes[5], // Spinach & Feta Egg Muffins
          servings: 4,
          date: '2026-02-14',
          isCompleted: false,
        },
        {
          id: 'pm-sat-lunch',
          mealType: 'lunch',
          recipe: sampleRecipes[19], // Berry Chia Pudding
          servings: 4,
          date: '2026-02-14',
          isCompleted: false,
        },
        {
          id: 'pm-sat-dinner',
          mealType: 'dinner',
          recipe: sampleRecipes[16], // Korean Bibimbap
          servings: 4,
          date: '2026-02-14',
          isCompleted: false,
        },
        {
          id: 'pm-sat-snack',
          mealType: 'snack',
          recipe: sampleRecipes[15], // Dark Chocolate Avocado Mousse
          servings: 4,
          date: '2026-02-14',
          isCompleted: false,
        },
      ],
    },
    // Sunday Feb 15
    {
      date: '2026-02-15',
      dayOfWeek: 'Sunday',
      meals: [
        {
          id: 'pm-sun-breakfast',
          mealType: 'breakfast',
          recipe: sampleRecipes[8], // Banana Protein Pancakes
          servings: 4,
          date: '2026-02-15',
          isCompleted: false,
        },
        {
          id: 'pm-sun-lunch',
          mealType: 'lunch',
          recipe: sampleRecipes[0], // Mediterranean Chicken Bowl
          servings: 4,
          date: '2026-02-15',
          isCompleted: false,
        },
        {
          id: 'pm-sun-dinner',
          mealType: 'dinner',
          recipe: sampleRecipes[3], // Grilled Salmon with Asparagus
          servings: 4,
          date: '2026-02-15',
          isCompleted: false,
        },
        {
          id: 'pm-sun-snack',
          mealType: 'snack',
          recipe: sampleRecipes[14], // Hummus & Veggie Snack Plate
          servings: 4,
          date: '2026-02-15',
          isCompleted: false,
        },
      ],
    },
  ],
  totalEstimatedCost: 95.20,
  totalCalories: 9520,
  generatedAt: '2026-02-08T18:00:00Z',
};
