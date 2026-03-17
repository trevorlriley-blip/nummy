import { UserProfile } from '../types/user';

export const sampleUser: UserProfile = {
  id: '',
  displayName: '',
  email: '',
  avatarUri: undefined,
  preferences: {
    familySize: 2,
    dietaryRestrictions: [],
    allergies: [],
    healthIssues: [],
    dietaryGoals: [],
    foodAversions: [],
    cookingMethods: [],
    budget: { range: 'moderate', weeklyMinUSD: 75, weeklyMaxUSD: 125 },
    mealsToInclude: ['breakfast', 'lunch', 'dinner'],
    includeSnacks: false,
    includeDesserts: false,
  },
  favoriteRecipeIds: [],
  onboardingComplete: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
