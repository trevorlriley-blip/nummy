import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useOnboarding } from '../../src/contexts/OnboardingContext';
import { useCalendar } from '../../src/contexts/CalendarContext';
import { StepIndicator } from '../../src/components/common/StepIndicator';
import { spacing, borderRadius } from '../../src/theme/spacing';

const BENEFITS = [
  { icon: 'calendar-check', text: 'See every meal directly in your calendar' },
  { icon: 'bell-outline', text: 'Get reminders before meal time' },
  { icon: 'sync', text: 'Re-sync any time with one tap' },
];

export default function CalendarSyncScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { state, goToNextStep, goToPreviousStep } = useOnboarding();
  const { isConnected, connectGoogle } = useCalendar();

  const handleContinue = () => {
    goToNextStep();
    router.push('/onboarding/complete');
  };

  const handleBack = () => {
    goToPreviousStep();
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StepIndicator currentStep={state.stepIndex} totalSteps={state.totalSteps} />

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons
            name={isConnected ? 'calendar-check' : 'google'}
            size={56}
            color={theme.colors.primary}
          />
        </View>

        {isConnected && (
          <View style={[styles.connectedBadge, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="check-circle" size={18} color={theme.colors.primary} />
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.primary, marginLeft: spacing.xs, fontWeight: '700' }}
            >
              Connected!
            </Text>
          </View>
        )}

        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          {isConnected ? 'Calendar connected' : 'Add meals to your calendar'}
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {isConnected
            ? 'Your meals will appear as events in Google Calendar so you always know what\'s on the menu.'
            : 'Sync your weekly meal plan to Google Calendar so you always know what\'s for dinner.'}
        </Text>

        <View style={[styles.benefitsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          {BENEFITS.map((item) => (
            <View key={item.text} style={styles.benefitRow}>
              <MaterialCommunityIcons name={item.icon as any} size={20} color={theme.colors.primary} />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant, marginLeft: 12, flex: 1 }}
              >
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={handleBack}
          style={styles.footerButton}
          labelStyle={{ fontWeight: '600' }}
        >
          Back
        </Button>

        {isConnected ? (
          <Button
            mode="contained"
            onPress={handleContinue}
            style={[styles.footerButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ fontWeight: '600' }}
            icon="arrow-right"
          >
            Continue
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={connectGoogle}
            style={[styles.footerButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ fontWeight: '600' }}
            icon="google"
          >
            Connect
          </Button>
        )}
      </View>

      {!isConnected && (
        <Button
          mode="text"
          onPress={handleContinue}
          labelStyle={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}
          style={styles.skipButton}
        >
          Skip for now
        </Button>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full ?? 999,
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  benefitsCard: {
    width: '100%',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 12,
  },
  footerButton: { flex: 1, borderRadius: 12 },
  skipButton: {
    alignSelf: 'center',
    marginBottom: 8,
  },
});
