import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useOnboarding } from '../../src/contexts/OnboardingContext';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { ChipSelector } from '../../src/components/common/ChipSelector';
import { dietaryGoalOptions } from '../../src/data/onboardingOptions';
import { DietaryGoal } from '../../src/types/user';

export default function DietaryGoalsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { state, updatePartialPreferences, goToNextStep, goToPreviousStep } = useOnboarding();
  const [selected, setSelected] = useState<DietaryGoal[]>(
    (state.partialPreferences.dietaryGoals as DietaryGoal[]) ?? []
  );

  const handleToggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value as DietaryGoal)
        ? prev.filter((v) => v !== value)
        : [...prev, value as DietaryGoal]
    );
  };

  const handleNext = () => {
    updatePartialPreferences({ dietaryGoals: selected });
    goToNextStep();
    router.push('/onboarding/food-aversions');
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
          What are your dietary goals?
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Select any goals you're working toward. We'll curate recipes to match.
        </Text>

        <ChipSelector
          options={dietaryGoalOptions.map((o) => ({ value: o.value, label: o.label, icon: o.icon }))}
          selected={selected}
          onToggle={handleToggle}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button mode="outlined" onPress={handleBack} style={styles.footerButton} labelStyle={{ fontWeight: '600' }}>
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          style={[styles.footerButton, { backgroundColor: theme.colors.primary }]}
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
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 12,
  },
  footerButton: { flex: 1, borderRadius: 12 },
});
