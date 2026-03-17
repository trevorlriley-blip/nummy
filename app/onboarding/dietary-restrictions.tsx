import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useOnboarding } from '../../src/contexts/OnboardingContext';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { ChipSelector } from '../../src/components/common/ChipSelector';
import { dietaryRestrictionOptions } from '../../src/data/onboardingOptions';
import { DietaryTag } from '../../src/types/recipe';

export default function DietaryRestrictionsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { state, updatePartialPreferences, goToNextStep, goToPreviousStep } = useOnboarding();
  const [selected, setSelected] = useState<DietaryTag[]>(
    (state.partialPreferences.dietaryRestrictions as DietaryTag[]) ?? []
  );

  const handleToggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value as DietaryTag)
        ? prev.filter((v) => v !== value)
        : [...prev, value as DietaryTag]
    );
  };

  const handleNext = () => {
    updatePartialPreferences({ dietaryRestrictions: selected });
    goToNextStep();
    router.push('/onboarding/allergies');
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
          Any dietary restrictions?
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Select all that apply. We'll only show recipes that match.
        </Text>

        <ChipSelector
          options={dietaryRestrictionOptions.map((o) => ({ value: o.value, label: o.label, icon: o.icon }))}
          selected={selected}
          onToggle={handleToggle}
        />

        {selected.length === 0 && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16, textAlign: 'center' }}>
            No restrictions? That's fine — just tap Next!
          </Text>
        )}
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
