import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useOnboarding } from '../../src/contexts/OnboardingContext';

export default function WelcomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { goToNextStep } = useOnboarding();

  const handleGetStarted = () => {
    goToNextStep();
    router.push('/onboarding/family-size');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="food-variant" size={80} color={theme.colors.primary} />
          </View>
        </View>

        <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
          Nummy
        </Text>
        <Text variant="titleMedium" style={[styles.subtitle, { color: theme.colors.primary }]}>
          Eat well, stress less
        </Text>

        <Text variant="bodyLarge" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
          Personalized meal plans tailored to your family's needs, dietary preferences, and budget. Let us handle
          the planning so you can enjoy the cooking.
        </Text>

        <View style={styles.features}>
          {[
            { icon: 'calendar-check', text: 'Weekly meal plans' },
            { icon: 'cart-outline', text: 'Smart grocery lists' },
            { icon: 'silverware-fork-knife', text: 'Curated recipes' },
          ].map((item) => (
            <View key={item.text} style={styles.featureRow}>
              <MaterialCommunityIcons name={item.icon as any} size={24} color={theme.colors.primary} />
              <Text variant="bodyLarge" style={{ color: theme.colors.onBackground, marginLeft: 12 }}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <Button
          mode="contained"
          onPress={handleGetStarted}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ fontWeight: '700', fontSize: 16 }}
          contentStyle={{ paddingVertical: 6 }}
        >
          Get Started
        </Button>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 12 }}>
          Takes about 2 minutes to set up
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: '800',
  },
  subtitle: {
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 24,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  features: {
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  button: {
    borderRadius: 12,
  },
});
