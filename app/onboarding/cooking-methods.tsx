import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useOnboarding } from '../../src/contexts/OnboardingContext';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { cookingMethodOptions } from '../../src/data/onboardingOptions';
import { CookingMethod } from '../../src/types/user';

export default function CookingMethodsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { state, updatePartialPreferences, goToNextStep, goToPreviousStep } = useOnboarding();
  const [selected, setSelected] = useState<CookingMethod[]>(
    (state.partialPreferences.cookingMethods as CookingMethod[]) ?? []
  );

  const handleToggle = (value: CookingMethod) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleNext = () => {
    updatePartialPreferences({ cookingMethods: selected });
    goToNextStep();
    router.push('/onboarding/budget');
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
          How do you like to cook?
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Select the cooking methods you have access to. We'll match recipes accordingly.
        </Text>

        <View style={styles.grid}>
          {cookingMethodOptions.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <Pressable
                key={option.value}
                onPress={() => handleToggle(option.value)}
                style={{ width: '48%' }}
              >
                <Surface
                  style={[
                    styles.card,
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
                  <Text
                    variant="titleSmall"
                    style={{
                      fontWeight: '600',
                      marginTop: 8,
                      color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{
                      textAlign: 'center',
                      marginTop: 4,
                      color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
                    }}
                    numberOfLines={2}
                  >
                    {option.description}
                  </Text>
                  {isSelected && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={theme.colors.primary}
                      style={styles.checkIcon}
                    />
                  )}
                </Surface>
              </Pressable>
            );
          })}
        </View>

        {selected.length === 0 && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 12 }}>
            Select at least one method, or skip to see all recipes.
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minHeight: 120,
    justifyContent: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
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
