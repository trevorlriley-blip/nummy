import { DietaryTag, MealType } from '../types/recipe';
import { HealthIssue, DietaryGoal, BudgetRange, CookingMethod, Allergy } from '../types/user';

interface OnboardingOption<T = string> {
  value: T;
  label: string;
  description?: string;
  icon?: string;
}

export const dietaryRestrictionOptions: OnboardingOption<DietaryTag>[] = [
  {
    value: 'vegetarian',
    label: 'Vegetarian',
    description: 'No meat or fish, but includes dairy and eggs',
    icon: 'leaf',
  },
  {
    value: 'vegan',
    label: 'Vegan',
    description: 'No animal products of any kind',
    icon: 'sprout',
  },
  {
    value: 'gluten-free',
    label: 'Gluten-Free',
    description: 'No wheat, barley, rye, or other gluten-containing grains',
    icon: 'bread-slice-outline',
  },
  {
    value: 'dairy-free',
    label: 'Dairy-Free',
    description: 'No milk, cheese, butter, or other dairy products',
    icon: 'cup-off-outline',
  },
  {
    value: 'keto',
    label: 'Keto',
    description: 'High fat, very low carbohydrate diet',
    icon: 'fire',
  },
  {
    value: 'paleo',
    label: 'Paleo',
    description: 'Whole foods based on what our ancestors might have eaten',
    icon: 'food-drumstick',
  },
];

export const allergyOptions: OnboardingOption<Allergy>[] = [
  {
    value: 'peanuts',
    label: 'Peanuts',
    description: 'Peanuts and peanut-derived products',
    icon: 'peanut-off-outline',
  },
  {
    value: 'tree-nuts',
    label: 'Tree Nuts',
    description: 'Almonds, cashews, walnuts, pecans, pistachios, etc.',
    icon: 'tree',
  },
  {
    value: 'milk',
    label: 'Milk / Dairy',
    description: 'Cow\'s milk and dairy-based products',
    icon: 'cup-off-outline',
  },
  {
    value: 'eggs',
    label: 'Eggs',
    description: 'Eggs and egg-derived ingredients',
    icon: 'egg-off-outline',
  },
  {
    value: 'wheat',
    label: 'Wheat',
    description: 'Wheat and wheat-based products',
    icon: 'bread-slice-outline',
  },
  {
    value: 'soy',
    label: 'Soy',
    description: 'Soybeans, tofu, soy sauce, and soy-derived ingredients',
    icon: 'soy-sauce-off',
  },
  {
    value: 'fish',
    label: 'Fish',
    description: 'All varieties of fin fish',
    icon: 'fish',
  },
  {
    value: 'shellfish',
    label: 'Shellfish',
    description: 'Shrimp, crab, lobster, mussels, and other shellfish',
    icon: 'fish',
  },
  {
    value: 'sesame',
    label: 'Sesame',
    description: 'Sesame seeds, tahini, and sesame oil',
    icon: 'seed-outline',
  },
  {
    value: 'corn',
    label: 'Corn',
    description: 'Corn and corn-derived ingredients like cornstarch',
    icon: 'corn',
  },
  {
    value: 'mustard',
    label: 'Mustard',
    description: 'Mustard seeds, powder, and prepared mustard',
    icon: 'bottle-soda-classic-outline',
  },
  {
    value: 'none',
    label: 'None',
    description: 'No food allergies',
    icon: 'check-circle-outline',
  },
];

export const healthIssueOptions: OnboardingOption<HealthIssue>[] = [
  {
    value: 'diabetes',
    label: 'Diabetes',
    description: 'Meals designed to help manage blood sugar levels',
    icon: 'diabetes',
  },
  {
    value: 'heart-disease',
    label: 'Heart Disease',
    description: 'Low sodium and saturated fat, heart-healthy meals',
    icon: 'heart-pulse',
  },
  {
    value: 'high-cholesterol',
    label: 'High Cholesterol',
    description: 'Meals that help lower and manage cholesterol',
    icon: 'chart-line-variant',
  },
  {
    value: 'high-blood-pressure',
    label: 'High Blood Pressure',
    description: 'Low sodium meals to help manage blood pressure',
    icon: 'blood-bag',
  },
  {
    value: 'celiac-disease',
    label: 'Celiac Disease',
    description: 'Strictly gluten-free meals for celiac management',
    icon: 'bread-slice-outline',
  },
  {
    value: 'ibs',
    label: 'IBS',
    description: 'Low-FODMAP and gut-friendly meal options',
    icon: 'stomach',
  },
  {
    value: 'kidney-disease',
    label: 'Kidney Friendly',
    description: 'Meals with controlled potassium, phosphorus, and sodium',
    icon: 'water-outline',
  },
  {
    value: 'none',
    label: 'None',
    description: 'No specific health issues to consider',
    icon: 'check-circle-outline',
  },
];

export const dietaryGoalOptions: OnboardingOption<DietaryGoal>[] = [
  {
    value: 'lose-weight',
    label: 'Weight Loss',
    description: 'Calorie-controlled meals to support healthy weight loss',
    icon: 'scale-bathroom',
  },
  {
    value: 'gain-muscle',
    label: 'Muscle Gain',
    description: 'High-protein meals to support muscle growth',
    icon: 'arm-flex',
  },
  {
    value: 'heart-health',
    label: 'Heart Health',
    description: 'Heart-healthy ingredients and cooking methods',
    icon: 'heart',
  },
  {
    value: 'eat-healthier',
    label: 'Balanced Nutrition',
    description: 'Well-rounded meals with balanced macronutrients',
    icon: 'food-apple-outline',
  },
  {
    value: 'increase-protein',
    label: 'Energy Boost',
    description: 'Nutrient-dense meals to keep your energy up all day',
    icon: 'lightning-bolt',
  },
  {
    value: 'increase-fiber',
    label: 'Gut Health',
    description: 'Fiber-rich meals to support a healthy digestive system',
    icon: 'stomach',
  },
  {
    value: 'reduce-sugar',
    label: 'Blood Sugar Management',
    description: 'Low glycemic meals to help stabilize blood sugar',
    icon: 'chart-timeline-variant',
  },
];

export const budgetOptions: OnboardingOption<BudgetRange>[] = [
  {
    value: 'budget-friendly',
    label: 'Budget Friendly',
    description: '$50 - $75 per week',
    icon: 'currency-usd',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: '$75 - $125 per week',
    icon: 'cash',
  },
  {
    value: 'comfortable',
    label: 'Comfortable',
    description: '$125 - $200 per week',
    icon: 'cash-multiple',
  },
  {
    value: 'premium',
    label: 'Premium',
    description: '$200+ per week',
    icon: 'diamond-stone',
  },
];

export const mealTypeOptions: OnboardingOption<MealType>[] = [
  {
    value: 'breakfast',
    label: 'Breakfast',
    description: 'Start your day with a nutritious morning meal',
    icon: 'coffee',
  },
  {
    value: 'lunch',
    label: 'Lunch',
    description: 'Midday meals to keep you fueled and focused',
    icon: 'food',
  },
  {
    value: 'dinner',
    label: 'Dinner',
    description: 'Satisfying evening meals for the whole family',
    icon: 'silverware-fork-knife',
  },
];

export const commonFoodAversions = [
  'Cilantro', 'Mushrooms', 'Olives', 'Onions', 'Tomatoes',
  'Seafood', 'Spicy food', 'Avocado', 'Eggplant', 'Beets',
  'Coconut', 'Tofu', 'Liver', 'Blue cheese', 'Anchovies',
];

export const cookingMethodOptions: OnboardingOption<CookingMethod>[] = [
  {
    value: 'stovetop',
    label: 'Stovetop',
    description: 'Pan-frying, sauteing, boiling, and simmering',
    icon: 'stove',
  },
  {
    value: 'oven',
    label: 'Oven',
    description: 'Baking, roasting, and broiling',
    icon: 'toaster-oven',
  },
  {
    value: 'air-fryer',
    label: 'Air Fryer',
    description: 'Crispy results with less oil',
    icon: 'fan',
  },
  {
    value: 'slow-cooker',
    label: 'Slow Cooker',
    description: 'Set it and forget it — perfect for stews and soups',
    icon: 'pot-steam',
  },
  {
    value: 'pressure-cooker',
    label: 'Pressure Cooker',
    description: 'Fast cooking with Instant Pot or similar',
    icon: 'gauge',
  },
  {
    value: 'grill',
    label: 'Grill',
    description: 'Outdoor or indoor grilling',
    icon: 'grill',
  },
  {
    value: 'smoker',
    label: 'Smoker',
    description: 'Low and slow smoking for rich flavor',
    icon: 'smoke',
  },
  {
    value: 'microwave',
    label: 'Microwave',
    description: 'Quick reheating and simple cooking',
    icon: 'microwave',
  },
  {
    value: 'no-cook',
    label: 'No-Cook',
    description: 'Salads, wraps, smoothies, and cold dishes',
    icon: 'snowflake',
  },
];
