import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useOnboarding } from '../../src/contexts/OnboardingContext';

export default function CompleteScreen() {
  const theme = useAppTheme();
  const { completeOnboarding, state } = useOnboarding();

  const prefs = state.partialPreferences;
  const summaryItems = [
    { icon: 'account-group', text: `Cooking for ${prefs.familySize ?? 2}` },
    {
      icon: 'silverware-fork-knife',
      text: `${(prefs.mealsToInclude ?? []).length} meals/day${prefs.includeSnacks ? ' + snacks' : ''}${prefs.includeDesserts ? ' + desserts' : ''}`,
    },
    { icon: 'cash', text: prefs.budget?.range ? prefs.budget.range.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) + ' budget' : 'Budget set' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.checkCircle, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons name="check-bold" size={60} color={theme.colors.primary} />
        </View>

        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          You're all set!
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          We've got everything we need to create your personalized meal plan.
        </Text>

        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          {summaryItems.map((item, i) => (
            <View key={i} style={styles.summaryRow}>
              <MaterialCommunityIcons name={item.icon as any} size={22} color={theme.colors.primary} />
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 12 }}>
                {item.text}
              </Text>
            </View>
          ))}
          {(prefs.allergies?.length ?? 0) > 0 && !prefs.allergies?.includes('none') && (
            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="alert-circle-outline" size={22} color={theme.colors.primary} />
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 12 }}>
                {prefs.allergies!.length} allerg{prefs.allergies!.length > 1 ? 'ies' : 'y'} flagged
              </Text>
            </View>
          )}
          {(prefs.dietaryRestrictions?.length ?? 0) > 0 && (
            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="leaf" size={22} color={theme.colors.primary} />
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 12 }}>
                {prefs.dietaryRestrictions!.length} dietary restriction{prefs.dietaryRestrictions!.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
          {(prefs.foodAversions?.length ?? 0) > 0 && (
            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="close-circle-outline" size={22} color={theme.colors.primary} />
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 12 }}>
                {prefs.foodAversions!.length} food aversion{prefs.foodAversions!.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
          {(prefs.cookingMethods?.length ?? 0) > 0 && (
            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="stove" size={22} color={theme.colors.primary} />
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 12 }}>
                {prefs.cookingMethods!.length} cooking method{prefs.cookingMethods!.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.bottom}>
        <Button
          mode="contained"
          onPress={completeOnboarding}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ fontWeight: '700', fontSize: 16 }}
          contentStyle={{ paddingVertical: 6 }}
          icon="arrow-right"
        >
          Let's Go!
        </Button>
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
    alignItems: 'center',
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { textAlign: 'center', fontWeight: '800', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  summaryCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    gap: 14,
  },
  summaryRow: {
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
