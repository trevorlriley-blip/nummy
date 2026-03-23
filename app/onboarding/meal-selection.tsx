import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text, Button, Surface, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useOnboarding } from '../../src/contexts/OnboardingContext';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { mealTypeOptions } from '../../src/data/onboardingOptions';
import { MealType } from '../../src/types/recipe';

export default function MealSelectionScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { state, updatePartialPreferences, goToNextStep, goToPreviousStep } = useOnboarding();
  const [selectedMeals, setSelectedMeals] = useState<MealType[]>(
    state.partialPreferences.mealsToInclude ?? ['breakfast', 'lunch', 'dinner']
  );
  const [includeSnacks, setIncludeSnacks] = useState(state.partialPreferences.includeSnacks ?? false);
  const [includeDesserts, setIncludeDesserts] = useState(state.partialPreferences.includeDesserts ?? false);

  const toggleMeal = (meal: MealType) => {
    setSelectedMeals((prev) =>
      prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]
    );
  };

  const handleNext = () => {
    if (selectedMeals.length === 0) return;
    updatePartialPreferences({
      mealsToInclude: selectedMeals,
      includeSnacks,
      includeDesserts,
    });
    goToNextStep();
    router.push('/onboarding/calendar-sync');
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
          Which meals should we plan?
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Pick the meals you'd like included in your weekly plan.
        </Text>

        <View style={styles.mealList}>
          {mealTypeOptions.map((option) => {
            const isSelected = selectedMeals.includes(option.value);
            return (
              <Pressable key={option.value} onPress={() => toggleMeal(option.value)}>
                <Surface
                  style={[
                    styles.mealCard,
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
                    size={32}
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
                      variant="bodySmall"
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

        <View style={styles.extrasSection}>
          <Text variant="titleMedium" style={{ color: theme.colors.onBackground, fontWeight: '600', marginBottom: 12 }}>
            Extras
          </Text>

          <Surface style={[styles.toggleRow, { backgroundColor: theme.colors.surface }]} elevation={0}>
            <MaterialCommunityIcons name="cookie" size={24} color={theme.colors.tertiary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>Snacks</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Add healthy snack ideas
              </Text>
            </View>
            <Switch value={includeSnacks} onValueChange={setIncludeSnacks} color={theme.colors.primary} />
          </Surface>

          <Surface style={[styles.toggleRow, { backgroundColor: theme.colors.surface }]} elevation={0}>
            <MaterialCommunityIcons name="ice-cream" size={24} color={theme.colors.tertiary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>Desserts</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Include dessert recipes
              </Text>
            </View>
            <Switch value={includeDesserts} onValueChange={setIncludeDesserts} color={theme.colors.primary} />
          </Surface>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button mode="outlined" onPress={handleBack} style={styles.footerButton} labelStyle={{ fontWeight: '600' }}>
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          disabled={selectedMeals.length === 0}
          style={[styles.footerButton, { backgroundColor: selectedMeals.length > 0 ? theme.colors.primary : undefined }]}
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
  mealList: { gap: 12 },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  extrasSection: { marginTop: 32 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
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
