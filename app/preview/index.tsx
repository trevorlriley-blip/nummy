import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useMealPlan } from '../../src/contexts/MealPlanContext';
import { useRecipes } from '../../src/contexts/RecipeContext';
import { useUser } from '../../src/contexts/UserContext';
import { PreviewMealSlot } from '../../src/components/mealPlan/PreviewMealSlot';
import { ReplaceMealSheet } from '../../src/components/mealPlan/ReplaceMealSheet';
import { PlannedMeal } from '../../src/types/mealPlan';
import { formatDayFull, formatWeekRange } from '../../src/utils/formatters';
import { spacing, borderRadius } from '../../src/theme/spacing';

export default function PreviewScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    draftPlan,
    acceptDraftPlan,
    discardDraftPlan,
    replaceDraftMeal,
  } = useMealPlan();
  const { getCompatibleRecipes } = useRecipes();
  const { user } = useUser();

  const [replacingMeal, setReplacingMeal] = useState<PlannedMeal | null>(null);

  // Navigate back if no draft (user navigated directly)
  useEffect(() => {
    if (!draftPlan) {
      router.back();
    }
  }, [draftPlan]);

  const handleAccept = () => {
    acceptDraftPlan();
    router.back();
  };

  const handleDiscard = () => {
    discardDraftPlan();
    router.back();
  };

  const handleSwapPress = (meal: PlannedMeal) => {
    setReplacingMeal(meal);
  };

  const handleSelectReplacement = (recipeId: string) => {
    if (replacingMeal) {
      replaceDraftMeal(replacingMeal.id, recipeId);
      setReplacingMeal(null);
    }
  };

  // Get alternative recipes for the meal being replaced
  // Show meal-type matches first, then other compatible recipes
  const alternatives = useMemo(() => {
    if (!replacingMeal || !draftPlan) return [];
    const usedIds = new Set(
      draftPlan.days.flatMap((d) => d.meals.map((m) => m.recipe.id))
    );
    const compatible = getCompatibleRecipes(user.preferences).filter(
      (r) => !usedIds.has(r.id)
    );
    // Sort: exact meal type matches first
    const mealType = replacingMeal.mealType;
    return compatible.sort((a, b) => {
      const aMatch = a.mealTypes.includes(mealType) ? 0 : 1;
      const bMatch = b.mealTypes.includes(mealType) ? 0 : 1;
      return aMatch - bMatch;
    }).slice(0, 3);
  }, [replacingMeal, draftPlan, user.preferences, getCompatibleRecipes]);

  if (!draftPlan) return null;

  const totalMeals = draftPlan.days.reduce((sum, day) => sum + day.meals.length, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={handleDiscard} style={styles.headerButton}>
          <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurfaceVariant} />
        </Pressable>
        <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
          Review Your Plan
        </Text>
        <Pressable onPress={handleAccept} style={styles.headerButton}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: '700' }}>
            Accept
          </Text>
        </Pressable>
      </View>

      {/* Summary Bar */}
      <View style={[styles.summaryBar, { backgroundColor: theme.colors.primaryContainer }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer }}>
              Week
            </Text>
            <Text
              variant="titleSmall"
              style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}
            >
              {formatWeekRange(draftPlan.weekStartDate)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer }}>
              Meals
            </Text>
            <Text
              variant="titleSmall"
              style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}
            >
              {totalMeals}
            </Text>
          </View>
        </View>
      </View>

      {/* Meal List */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {draftPlan.days.map((day) => (
          <View key={day.date} style={styles.daySection}>
            <View style={styles.dayHeader}>
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onBackground, fontWeight: '700' }}
              >
                {formatDayFull(day.date)}
              </Text>
            </View>
            {day.meals.map((meal) => (
              <PreviewMealSlot
                key={meal.id}
                meal={meal}
                onPress={() => router.push(`/recipe/${meal.recipe.id}` as any)}
                onSwapPress={() => handleSwapPress(meal)}
              />
            ))}
          </View>
        ))}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Accept Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface, paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <Button
          mode="contained"
          onPress={handleAccept}
          style={[styles.acceptButton, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ fontWeight: '700', fontSize: 16 }}
          contentStyle={{ paddingVertical: 6 }}
          icon="check"
        >
          Accept Plan
        </Button>
      </View>

      {/* Replace Meal Sheet */}
      <ReplaceMealSheet
        visible={replacingMeal !== null}
        meal={replacingMeal}
        alternatives={alternatives}
        onSelect={handleSelectReplacement}
        onDismiss={() => setReplacingMeal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerButton: {
    padding: spacing.xs,
  },
  summaryBar: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingVertical: spacing.sm,
  },
  daySection: {
    marginBottom: spacing.sm,
  },
  dayHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  acceptButton: {
    borderRadius: borderRadius.md,
  },
  bottomSpacer: {
    height: spacing.md,
  },
});
