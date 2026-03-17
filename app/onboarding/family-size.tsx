import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useOnboarding } from '../../src/contexts/OnboardingContext';
import { StepIndicator } from '../../src/components/common/StepIndicator';

export default function FamilySizeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { state, updatePartialPreferences, goToNextStep, goToPreviousStep } = useOnboarding();
  const [familySize, setFamilySize] = useState(state.partialPreferences.familySize ?? 2);

  const handleNext = () => {
    updatePartialPreferences({ familySize });
    goToNextStep();
    router.push('/onboarding/dietary-restrictions');
  };

  const handleBack = () => {
    goToPreviousStep();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StepIndicator currentStep={state.stepIndex} totalSteps={state.totalSteps} />

      <View style={styles.content}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          How many people are you cooking for?
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          We'll adjust portion sizes and quantities accordingly.
        </Text>

        <View style={styles.counter}>
          <IconButton
            icon="minus-circle-outline"
            size={44}
            iconColor={familySize <= 1 ? theme.colors.outlineVariant : theme.colors.primary}
            onPress={() => setFamilySize((prev) => Math.max(1, prev - 1))}
            disabled={familySize <= 1}
          />
          <View style={[styles.countDisplay, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text variant="displayMedium" style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}>
              {familySize}
            </Text>
          </View>
          <IconButton
            icon="plus-circle-outline"
            size={44}
            iconColor={familySize >= 12 ? theme.colors.outlineVariant : theme.colors.primary}
            onPress={() => setFamilySize((prev) => Math.min(12, prev + 1))}
            disabled={familySize >= 12}
          />
        </View>

        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          {familySize === 1
            ? 'Just for me'
            : familySize <= 3
              ? `${familySize} people`
              : `${familySize} people — family style!`}
        </Text>
      </View>

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
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  title: { textAlign: 'center', fontWeight: '700', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 48 },
  counter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  countDisplay: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingBottom: 16,
    gap: 12,
  },
  footerButton: { flex: 1, borderRadius: 12 },
});
