import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useOnboarding } from '../../src/contexts/OnboardingContext';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { allergyOptions } from '../../src/data/onboardingOptions';
import { Allergy } from '../../src/types/user';

export default function AllergiesScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { state, updatePartialPreferences, goToNextStep, goToPreviousStep } = useOnboarding();
  const [selected, setSelected] = useState<Allergy[]>(
    (state.partialPreferences.allergies as Allergy[]) ?? []
  );

  const handleToggle = (value: string) => {
    const allergy = value as Allergy;
    if (allergy === 'none') {
      setSelected(['none']);
      return;
    }
    setSelected((prev) => {
      const without = prev.filter((v) => v !== 'none');
      return without.includes(allergy) ? without.filter((v) => v !== allergy) : [...without, allergy];
    });
  };

  const handleNext = () => {
    updatePartialPreferences({ allergies: selected });
    goToNextStep();
    router.push('/onboarding/health-issues');
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
          Any food allergies?
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          This is important for your safety. We'll completely exclude these ingredients.
        </Text>

        <Surface style={[styles.warningBanner, { backgroundColor: theme.colors.errorContainer }]} elevation={0}>
          <MaterialCommunityIcons name="alert-outline" size={20} color={theme.colors.onErrorContainer} />
          <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer, flex: 1, marginLeft: 10 }}>
            Always double-check ingredients. Our allergy filters help but may not catch every derivative.
          </Text>
        </Surface>

        <View style={styles.grid}>
          {allergyOptions.map((option) => {
            const isSelected = selected.includes(option.value);
            const isNone = option.value === 'none';
            return (
              <View key={option.value} style={{ width: isNone ? '100%' : '48%' }}>
                <Surface
                  style={[
                    styles.card,
                    {
                      borderColor: isSelected
                        ? isNone ? theme.colors.primary : theme.colors.error
                        : theme.colors.outlineVariant,
                      borderWidth: isSelected ? 2 : 1,
                      backgroundColor: isSelected
                        ? isNone ? theme.colors.primaryContainer : theme.colors.errorContainer
                        : theme.colors.surface,
                    },
                  ]}
                  elevation={isSelected ? 1 : 0}
                >
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                    onTouchEnd={() => handleToggle(option.value)}
                  >
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={24}
                      color={isSelected
                        ? isNone ? theme.colors.primary : theme.colors.error
                        : theme.colors.onSurfaceVariant}
                    />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text
                        variant="titleSmall"
                        style={{
                          fontWeight: '600',
                          color: isSelected
                            ? isNone ? theme.colors.onPrimaryContainer : theme.colors.onErrorContainer
                            : theme.colors.onSurface,
                        }}
                      >
                        {option.label}
                      </Text>
                      {isNone && (
                        <Text
                          variant="bodySmall"
                          style={{ color: isSelected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }}
                        >
                          {option.description}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color={isNone ? theme.colors.primary : theme.colors.error}
                      />
                    )}
                  </View>
                </Surface>
              </View>
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
  subtitle: { marginBottom: 16 },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    padding: 14,
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
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
