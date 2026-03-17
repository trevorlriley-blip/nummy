import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  USER_PROFILE: '@mealplan_user_profile',
  ONBOARDING_COMPLETE: '@mealplan_onboarding_complete',
  MEAL_PLAN: '@mealplan_current_plan',
  MEAL_PLAN_HISTORY: '@mealplan_plan_history',
  GROCERY_LIST: '@mealplan_grocery_list',
  GROCERY_LISTS: '@mealplan_grocery_lists',
  FEEDBACK: '@mealplan_feedback',
  FAVORITES: '@mealplan_favorites',
  CALENDAR_SETTINGS: '@mealplan_calendar_settings',
  REJECTION_HISTORY: '@mealplan_rejection_history',
  THEME_PREFERENCE: '@mealplan_theme_preference',
  MY_RECIPES: '@mealplan_my_recipes',
} as const;

export async function saveToStorage<T>(key: string, value: T): Promise<void> {
  try {
    const json = JSON.stringify(value);
    await AsyncStorage.setItem(key, json);
  } catch (e) {
    console.error(`Error saving to storage [${key}]:`, e);
  }
}

export async function loadFromStorage<T>(key: string): Promise<T | null> {
  try {
    const json = await AsyncStorage.getItem(key);
    return json ? (JSON.parse(json) as T) : null;
  } catch (e) {
    console.error(`Error loading from storage [${key}]:`, e);
    return null;
  }
}

export async function removeFromStorage(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing from storage [${key}]:`, e);
  }
}
