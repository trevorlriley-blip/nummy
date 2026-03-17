import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ChatMessage, QuickReply, AgentChatRequest, AgentResponse, AgentUserContext } from '../types/agent';
import { useUser } from './UserContext';
import { useMealPlan } from './MealPlanContext';
import { useFeedback } from './FeedbackContext';
import { useRecipes } from './RecipeContext';
import { useMyRecipes } from './MyRecipesContext';
import { buildWizardPrompt } from '../utils/wizardPromptBuilder';
import { format } from 'date-fns';

interface AgentContextValue {
  messages: ChatMessage[];
  isLoading: boolean;
  quickReplies: QuickReply[];
  sendMessage: (text: string) => Promise<void>;
  resetChat: () => void;
  isGenerating: boolean;
  generationError: string | null;
  generateFromWizard: (days: string[], tags: string[], customPrompt: string, weekStartDate: string, blend: number) => Promise<void>;
}

const AgentContext = createContext<AgentContextValue | undefined>(undefined);

const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  { label: 'Plan all 7 days', message: 'Plan meals for every day this week' },
  { label: 'Italian', message: "I'm craving Italian food this week" },
  { label: 'Extra healthy', message: 'I want to eat extra healthy this week' },
  { label: 'Quick meals', message: 'I need quick meals under 30 minutes this week' },
  { label: 'More favorites', message: 'Lean heavily into my favorite recipes this week' },
  { label: 'Surprise me', message: 'Surprise me with something new and exciting!' },
];

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(DEFAULT_QUICK_REPLIES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const router = useRouter();
  const { user } = useUser();
  const { setDraftPlan, draftRejections } = useMealPlan();
  const { getFeedbackSummaries } = useFeedback();
  const { getRecipeById, addRecipes } = useRecipes();
  const { myRecipes } = useMyRecipes();

  const buildUserContext = useCallback((): AgentUserContext => {
    const feedbackSummaries = getFeedbackSummaries();

    const favoriteRecipeTitles = user.favoriteRecipeIds
      .map((id) => {
        const recipe = getRecipeById(id);
        return recipe?.title ?? '';
      })
      .filter(Boolean);

    const recentRejections = draftRejections.map((r) => {
      const recipe = getRecipeById(r.recipeId);
      return {
        title: recipe?.title ?? r.recipeId,
        mealType: r.mealType,
      };
    });

    return {
      preferences: user.preferences,
      favoriteRecipeTitles,
      feedbackSummaries: feedbackSummaries.map((s) => ({
        title: s.recipeTitle,
        rating: s.averageRating,
        timesMade: s.timesMade,
      })),
      recentRejections,
      currentDate: format(new Date(), 'yyyy-MM-dd'),
      myRecipes,
    };
  }, [user, draftRejections, getFeedbackSummaries, getRecipeById, myRecipes]);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setQuickReplies([]);

      try {
        const allMessages = [...messages, userMessage];
        const chatRequest: AgentChatRequest = {
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          context: buildUserContext(),
          customRecipes: myRecipes.length > 0 ? myRecipes : undefined,
        };

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL ?? ''}/api/agent/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chatRequest),
        });

        const data = (await response.json()) as AgentResponse;

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setQuickReplies(data.quickReplies);

        // Register extra searched recipes as swap alternatives
        if (data.extraRecipes?.length) {
          addRecipes(data.extraRecipes);
        }

        // If the agent created a plan, register its recipes and navigate to preview
        if (data.plan) {
          const planRecipes = data.plan.days.flatMap((d) => d.meals.map((m) => m.recipe));
          addRecipes(planRecipes);
          setDraftPlan(data.plan);
          // Small delay to let state settle before navigation
          setTimeout(() => {
            router.push('/preview');
          }, 300);
        }
      } catch (error) {
        console.error('Agent chat error:', error);
        const errorMessage: ChatMessage = {
          id: `msg-${Date.now()}-error`,
          role: 'assistant',
          content: 'Sorry, I had trouble connecting. Please check your connection and try again.',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setQuickReplies([{ label: 'Try again', message: text }]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, buildUserContext, addRecipes, setDraftPlan, router]
  );

  const generateFromWizard = useCallback(
    async (days: string[], tags: string[], customPromptText: string, weekStartDate: string, blend: number) => {
      setIsGenerating(true);
      setGenerationError(null);

      try {
        const prompt = buildWizardPrompt(days, tags, customPromptText, weekStartDate);
        const chatRequest: AgentChatRequest = {
          messages: [{ role: 'user', content: prompt }],
          context: { ...buildUserContext(), myRecipeBlend: blend },
          customRecipes: myRecipes.length > 0 ? myRecipes : undefined,
        };

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL ?? ''}/api/agent/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chatRequest),
        });

        const data = (await response.json()) as AgentResponse;

        // Register extra searched recipes as swap alternatives
        if (data.extraRecipes?.length) {
          addRecipes(data.extraRecipes);
        }

        if (data.plan) {
          const planRecipes = data.plan.days.flatMap((d) => d.meals.map((m) => m.recipe));
          addRecipes(planRecipes);
          setDraftPlan(data.plan);
          setTimeout(() => {
            router.push('/preview');
          }, 300);
        } else {
          setGenerationError(
            data.message || 'Failed to generate a plan. Please try again.'
          );
        }
      } catch (error) {
        console.error('Wizard generation error:', error);
        const msg = error instanceof Error ? error.message : String(error);
        setGenerationError(`Connection error: ${msg}`);
      } finally {
        setIsGenerating(false);
      }
    },
    [buildUserContext, addRecipes, setDraftPlan, router]
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setQuickReplies(DEFAULT_QUICK_REPLIES);
    setIsLoading(false);
  }, []);

  return (
    <AgentContext.Provider
      value={{
        messages,
        isLoading,
        quickReplies,
        sendMessage,
        resetChat,
        isGenerating,
        generationError,
        generateFromWizard,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) throw new Error('useAgent must be used within AgentProvider');
  return context;
}
