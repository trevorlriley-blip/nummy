import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useOnboarding } from '../../src/contexts/OnboardingContext';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { budgetOptions } from '../../src/data/onboardingOptions';
import { BudgetRange } from '../../src/types/user';

const BUDGET_RANGES: Record<BudgetRange, { min: number; max: number }> = {
  'budget-friendly': { min: 50, max: 75 },
  moderate: { min: 75, max: 125 },
  comfortable: { min: 125, max: 200 },
  premium: { min: 200, max: 400 },
};

export default function BudgetScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { state, updatePartialPreferences, goToNextStep, goToPreviousStep } = useOnboarding();
  const [selectedBudget, setSelectedBudget] = useState<BudgetRange | null>(
    state.partialPreferences.budget?.range ?? null
  );

  const handleNext = () => {
    if (!selectedBudget) return;
    const range = BUDGET_RANGES[selectedBudget];
    updatePartialPreferences({
      budget: {
        range: selectedBudget,
        weeklyMinUSD: range.min,
        weeklyMaxUSD: range.max,
      },
    });
    goToNextStep();
    router.push('/onboarding/meal-selection');
  };

  const handleBack = () => {
    goToPreviousStep();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StepIndicator currentStep={state.stepIndex} totalSteps={state.totalSteps} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          What's your weekly grocery budget?
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Per person per week. We'll find recipes that fit.
        </Text>

        <View style={styles.optionsList}>
          {budgetOptions.map((option) => {
            const isSelected = selectedBudget === option.value;
            return (
              <Pressable key={option.value} onPress={() => setSelectedBudget(option.value)}>
                <Surface
                  style={[
                    styles.optionCard,
                    {
                      borderColor: isSelected ? theme.colors.primary : theme.colors.outlineVariant,
                      borderWidth: isSelected ? 2 : 1,
                      backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surface,
                    },
                  ]}
                  elevation={isSelected ? 2 : 0}
                >
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={28}
                    color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  />
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text
                      variant="titleMedium"
                      style={{
                        fontWeight: '600',
                        color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
                      }}
                    >
                      {option.label}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{
                        color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
                      }}
                    >
                      {option.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
                  )}
                </Surface>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button mode="outlined" onPress={handleBack} style={styles.footerButton} labelStyle={{ fontWeight: '600' }}>
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={!selectedBudget}
          style={[styles.footerButton, { backgroundColor: selectedBudget ? theme.colors.primary : undefined }]}
          labelStyle={{ fontWeight: '600' }}
        >
          Next
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16 },
  title: { fontWeight: '700', marginBottom: 8 },
  subtitle: { marginBottom: 24 },
  optionsList: { gap: 12 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 12,
  },
  footerButton: { flex: 1, borderRadius: 12 },
});
