import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, TextInput, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useOnboarding } from '../../src/contexts/OnboardingContext';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { commonFoodAversions } from '../../src/data/onboardingOptions';

export default function FoodAversionsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { state, updatePartialPreferences, goToNextStep, goToPreviousStep } = useOnboarding();
  const [aversions, setAversions] = useState<string[]>(state.partialPreferences.foodAversions ?? []);
  const [inputText, setInputText] = useState('');

  const addAversion = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !aversions.includes(trimmed)) {
      setAversions((prev) => [...prev, trimmed]);
    }
    setInputText('');
  };

  const removeAversion = (item: string) => {
    setAversions((prev) => prev.filter((a) => a !== item));
  };

  const handleNext = () => {
    updatePartialPreferences({ foodAversions: aversions });
    goToNextStep();
    router.push('/onboarding/cooking-methods');
  };

  const handleBack = () => {
    goToPreviousStep();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StepIndicator currentStep={state.stepIndex} totalSteps={state.totalSteps} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Foods you don't like?
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          We'll avoid these ingredients in your meal plans.
        </Text>

        <TextInput
          mode="outlined"
          label="Add a food"
          placeholder="e.g. Brussels sprouts"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => addAversion(inputText)}
          right={
            inputText.trim() ? (
              <TextInput.Icon icon="plus" onPress={() => addAversion(inputText)} />
            ) : undefined
          }
          style={{ marginBottom: 16 }}
        />

        {aversions.length > 0 && (
          <View style={styles.chipRow}>
            {aversions.map((item) => (
              <Chip
                key={item}
                onClose={() => removeAversion(item)}
                style={{ backgroundColor: theme.colors.errorContainer, marginBottom: 4 }}
                textStyle={{ color: theme.colors.onErrorContainer }}
                closeIconAccessibilityLabel="Remove"
              >
                {item}
              </Chip>
            ))}
          </View>
        )}

        <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 24, marginBottom: 12 }}>
          Common dislikes
        </Text>
        <View style={styles.chipRow}>
          {commonFoodAversions.filter((a) => !aversions.includes(a)).map((item) => (
            <Chip
              key={item}
              onPress={() => addAversion(item)}
              style={{ backgroundColor: theme.colors.surfaceVariant, marginBottom: 4 }}
              textStyle={{ color: theme.colors.onSurfaceVariant }}
            >
              + {item}
            </Chip>
          ))}
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
  subtitle: { marginBottom: 24 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 12,
  },
  footerButton: { flex: 1, borderRadius: 12 },
});
