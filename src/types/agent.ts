import { UserPreferences } from './user';
import { WeeklyMealPlan } from './mealPlan';
import { Recipe } from './recipe';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface QuickReply {
  label: string;
  message: string;
}

export interface AgentResponse {
  message: string;
  plan: WeeklyMealPlan | null;
  quickReplies: QuickReply[];
  extraRecipes?: Recipe[];
}

export interface AgentChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  context: AgentUserContext;
  customRecipes?: Recipe[];
}

export interface AgentUserContext {
  preferences: UserPreferences;
  favoriteRecipeTitles: string[];
  feedbackSummaries: { title: string; rating: number; timesMade: number }[];
  recentRejections: { title: string; mealType: string }[];
  currentDate: string;
  myRecipes?: Recipe[];
  myRecipeBlend?: number;
}
