import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserPreferences } from '../types/user';
import { useUser } from './UserContext';

export type OnboardingStep =
  | 'welcome'
  | 'family-size'
  | 'dietary-restrictions'
  | 'allergies'
  | 'health-issues'
  | 'dietary-goals'
  | 'food-aversions'
  | 'cooking-methods'
  | 'budget'
  | 'meal-selection'
  | 'calendar-sync'
  | 'complete';

const STEPS: OnboardingStep[] = [
  'welcome',
  'family-size',
  'dietary-restrictions',
  'allergies',
  'health-issues',
  'dietary-goals',
  'food-aversions',
  'cooking-methods',
  'budget',
  'meal-selection',
  'calendar-sync',
  'complete',
];

interface OnboardingState {
  currentStep: OnboardingStep;
  stepIndex: number;
  totalSteps: number;
  partialPreferences: Partial<UserPreferences>;
}

interface OnboardingContextValue {
  state: OnboardingState;
  updatePartialPreferences: (partial: Partial<UserPreferences>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { updatePreferences, setOnboardingComplete } = useUser();
  const [stepIndex, setStepIndex] = useState(0);
  const [partialPreferences, setPartialPreferences] = useState<Partial<UserPreferences>>({});

  const state: OnboardingState = {
    currentStep: STEPS[stepIndex],
    stepIndex,
    totalSteps: STEPS.length,
    partialPreferences,
  };

  const updatePartialPreferences = useCallback((partial: Partial<UserPreferences>) => {
    setPartialPreferences((prev) => ({ ...prev, ...partial }));
  }, []);

  const goToNextStep = useCallback(() => {
    setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const completeOnboarding = useCallback(() => {
    updatePreferences(partialPreferences as UserPreferences);
    setOnboardingComplete(true);
  }, [partialPreferences, updatePreferences, setOnboardingComplete]);

  const resetOnboarding = useCallback(() => {
    setStepIndex(0);
    setPartialPreferences({});
    setOnboardingComplete(false);
  }, [setOnboardingComplete]);

  return (
    <OnboardingContext.Provider
      value={{ state, updatePartialPreferences, goToNextStep, goToPreviousStep, completeOnboarding, resetOnboarding }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
}
