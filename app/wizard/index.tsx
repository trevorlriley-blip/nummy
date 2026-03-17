import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Button, IconButton, Dialog, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, addDays, startOfWeek, addWeeks } from 'date-fns';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useAgent } from '../../src/contexts/AgentContext';
import { useMealPlan } from '../../src/contexts/MealPlanContext';
import { useUser } from '../../src/contexts/UserContext';
import { useMyRecipes } from '../../src/contexts/MyRecipesContext';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { DaySelectionStep } from '../../src/components/wizard/DaySelectionStep';
import { SpecialRequestsStep } from '../../src/components/wizard/SpecialRequestsStep';
import { RecipeBlendStep } from '../../src/components/wizard/RecipeBlendStep';
import { GeneratingAnimation } from '../../src/components/wizard/GeneratingAnimation';
import { ALL_DAYS } from '../../src/data/wizardOptions';
import { spacing } from '../../src/theme/spacing';

function getWeekOptions() {
  const today = new Date();
  const thisMonday = startOfWeek(today, { weekStartsOn: 1 });
  return Array.from({ length: 5 }, (_, i) => {
    const monday = addWeeks(thisMonday, i);
    const sunday = addDays(monday, 6);
    const label = i === 0 ? 'This week' : i === 1 ? 'Next week' : `In ${i} weeks`;
    return {
      weekStartDate: format(monday, 'yyyy-MM-dd'),
      label,
      range: `${format(monday, 'MMM d')} – ${format(sunday, 'MMM d')}`,
    };
  });
}

const WEEK_OPTIONS = getWeekOptions();

export default function WizardScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { generateFromWizard, isGenerating, generationError } = useAgent();
  const { plans } = useMealPlan();
  const { user } = useUser();
  const { myRecipes } = useMyRecipes();

  const hasBlendStep = myRecipes.length > 0 || user.favoriteRecipeIds.length > 0;
  const TOTAL_STEPS = hasBlendStep ? 4 : 3;

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWeekStart, setSelectedWeekStart] = useState(WEEK_OPTIONS[0].weekStartDate);
  const [selectedDays, setSelectedDays] = useState<string[]>([...ALL_DAYS]);
  const [blend, setBlend] = useState(50);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showConflictDialog, setShowConflictDialog] = useState(false);

  const existingPlanForWeek = plans.some((p) => p.weekStartDate === selectedWeekStart);

  const handleToggleDay = useCallback((day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }, []);

  const handleSetAll = useCallback((days: string[]) => setSelectedDays(days), []);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const doGenerate = useCallback(async () => {
    await generateFromWizard(selectedDays, selectedTags, customPrompt, selectedWeekStart, blend);
  }, [generateFromWizard, selectedDays, selectedTags, customPrompt, selectedWeekStart, blend]);

  const goNext = useCallback((from: number) => {
    if (from === 1 && !hasBlendStep) {
      setCurrentStep(3); // skip blend step
    } else {
      setCurrentStep(from + 1);
    }
  }, [hasBlendStep]);

  const goBack = useCallback((from: number) => {
    if (from === 3 && !hasBlendStep) {
      setCurrentStep(1); // skip blend step going back
    } else {
      setCurrentStep(from - 1);
    }
  }, [hasBlendStep]);

  // Map logical step to visual position for StepIndicator
  const displayStep = !hasBlendStep && currentStep === 3 ? 2 : currentStep;

  const handleGenerate = useCallback(() => {
    if (existingPlanForWeek) {
      setShowConflictDialog(true);
    } else {
      doGenerate();
    }
  }, [existingPlanForWeek, doGenerate]);

  const handleRetry = useCallback(() => doGenerate(), [doGenerate]);
  const handleClose = useCallback(() => router.back(), [router]);

  if (isGenerating) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <GeneratingAnimation />
      </SafeAreaView>
    );
  }

  if (generationError) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <IconButton icon="close" onPress={handleClose} />
          <Text variant="titleMedium" style={{ fontWeight: '600' }}>New Plan</Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={56} color={theme.colors.error} />
          <Text variant="bodyLarge" style={[styles.errorText, { color: theme.colors.onSurfaceVariant }]}>
            {generationError}
          </Text>
          <Button mode="contained" onPress={handleRetry} style={styles.retryButton}>Try Again</Button>
          <Button mode="text" onPress={handleClose}>Go Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Portal>
        <Dialog visible={showConflictDialog} onDismiss={() => setShowConflictDialog(false)}>
          <Dialog.Title>Replace existing plan?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              You already have a meal plan for this week. Generating a new one will replace it.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConflictDialog(false)}>Cancel</Button>
            <Button onPress={() => { setShowConflictDialog(false); doGenerate(); }}>Replace</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="close" onPress={handleClose} />
        <Text variant="titleMedium" style={{ fontWeight: '600' }}>New Plan</Text>
        <View style={{ width: 48 }} />
      </View>

      <StepIndicator currentStep={displayStep} totalSteps={TOTAL_STEPS} />

      {/* Step content */}
      <View style={styles.content}>
        {currentStep === 0 ? (
          <ScrollView contentContainerStyle={styles.weekPickerContent} showsVerticalScrollIndicator={false}>
            <Text variant="titleMedium" style={[styles.stepTitle, { color: theme.colors.onBackground }]}>
              Which week?
            </Text>
            {WEEK_OPTIONS.map((opt) => {
              const selected = opt.weekStartDate === selectedWeekStart;
              const hasConflict = plans.some((p) => p.weekStartDate === opt.weekStartDate);
              return (
                <Pressable
                  key={opt.weekStartDate}
                  onPress={() => setSelectedWeekStart(opt.weekStartDate)}
                  style={[
                    styles.weekOption,
                    {
                      backgroundColor: selected ? theme.colors.primaryContainer : theme.colors.surface,
                      borderColor: selected ? theme.colors.primary : theme.colors.outlineVariant,
                    },
                  ]}
                >
                  <View style={styles.weekOptionLeft}>
                    <Text
                      variant="titleSmall"
                      style={{ color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurface, fontWeight: '600' }}
                    >
                      {opt.label}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{ color: selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant, marginTop: 2 }}
                    >
                      {opt.range}
                    </Text>
                  </View>
                  <View style={styles.weekOptionRight}>
                    {hasConflict && (
                      <Text variant="labelSmall" style={{ color: theme.colors.error, marginRight: spacing.sm }}>
                        Has plan
                      </Text>
                    )}
                    {selected && (
                      <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : currentStep === 1 ? (
          <DaySelectionStep
            selectedDays={selectedDays}
            onToggle={handleToggleDay}
            onSetAll={handleSetAll}
          />
        ) : currentStep === 2 && hasBlendStep ? (
          <RecipeBlendStep blend={blend} onChange={setBlend} />
        ) : (
          <SpecialRequestsStep
            selectedTags={selectedTags}
            onToggleTag={handleToggleTag}
            customPrompt={customPrompt}
            onCustomPromptChange={setCustomPrompt}
          />
        )}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.colors.outlineVariant }]}>
        {currentStep === 0 ? (
          <>
            <View style={{ flex: 1 }} />
            <Button mode="contained" onPress={() => setCurrentStep(1)} contentStyle={styles.buttonContent}>
              Next
            </Button>
          </>
        ) : currentStep === 3 ? (
          <>
            <Button mode="text" onPress={() => goBack(3)} contentStyle={styles.buttonContent}>Back</Button>
            <Button
              mode="contained"
              onPress={handleGenerate}
              icon={({ size, color }) => (
                <MaterialCommunityIcons name="creation" size={size} color={color} />
              )}
              contentStyle={styles.buttonContent}
            >
              Generate
            </Button>
          </>
        ) : (
          <>
            <Button mode="text" onPress={() => goBack(currentStep)} contentStyle={styles.buttonContent}>Back</Button>
            <Button
              mode="contained"
              onPress={() => goNext(currentStep)}
              disabled={currentStep === 1 && selectedDays.length === 0}
              contentStyle={styles.buttonContent}
            >
              Next
            </Button>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.sm,
  },
  content: { flex: 1 },
  weekPickerContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  stepTitle: {
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  weekOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
  },
  weekOptionLeft: { flex: 1 },
  weekOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  buttonContent: {
    paddingHorizontal: spacing.md,
    height: 48,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  retryButton: { marginBottom: spacing.sm },
});
