import React, { useCallback, useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, FAB, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { isToday as checkIsToday, parseISO } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useUser } from '../../src/contexts/UserContext';
import { useMealPlan } from '../../src/contexts/MealPlanContext';
import { useFeedback } from '../../src/contexts/FeedbackContext';
import { WeekNavigator } from '../../src/components/mealPlan/WeekNavigator';
import { DayCard } from '../../src/components/mealPlan/DayCard';

export default function MealPlanScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { user } = useUser();
  const { currentPlan, isGenerating, goToPreviousWeek, goToNextWeek, canGoBack, canGoForward, draftPlan } = useMealPlan();
  const { hasFeedback } = useFeedback();

  const feedbackStatusMap = useMemo(() => {
    if (!currentPlan) return {};
    const map: Record<string, boolean> = {};
    for (const day of currentPlan.days) {
      for (const meal of day.meals) {
        map[meal.id] = hasFeedback(meal.id);
      }
    }
    return map;
  }, [currentPlan, hasFeedback]);

  // Navigate to preview when a draft plan is ready
  useEffect(() => {
    if (draftPlan && !isGenerating) {
      router.push('/preview');
    }
  }, [draftPlan, isGenerating]);

  const handleMealPress = useCallback(
    (mealId: string) => {
      if (!currentPlan) return;
      for (const day of currentPlan.days) {
        const meal = day.meals.find((m) => m.id === mealId);
        if (meal) {
          router.push(`/recipe/${meal.recipe.id}?plannedMealId=${meal.id}` as any);
          return;
        }
      }
    },
    [currentPlan, router]
  );

  const handleMealRate = useCallback(
    (mealId: string) => {
      router.push(`/feedback/${mealId}` as any);
    },
    [router]
  );

  const handleNewPlan = useCallback(() => {
    router.push('/wizard');
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
          Meal Plan
        </Text>
      </View>

      {isGenerating ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
            Generating your meal plan...
          </Text>
        </View>
      ) : currentPlan ? (
        <>
          <WeekNavigator
            weekStartDate={currentPlan.weekStartDate}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
          />
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {currentPlan.days.map((day) => (
              <DayCard
                key={day.date}
                day={day}
                isToday={checkIsToday(parseISO(day.date))}
                onMealPress={handleMealPress}
                onMealRate={handleMealRate}
                feedbackStatus={feedbackStatusMap}
              />
            ))}
            <View style={{ height: 80 }} />
          </ScrollView>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={64} color={theme.colors.outlineVariant} />
          <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: '700', marginTop: 16, textAlign: 'center' }}>
            {user.displayName ? `Welcome, ${user.displayName.split(' ')[0]}!` : 'No meal plan yet'}
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8, lineHeight: 24 }}>
            Create your first plan and let AI pick delicious meals for your week.
          </Text>
        </View>
      )}

      <FAB
        icon="creation"
        label="New Plan"
        onPress={handleNewPlan}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingBottom: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 28,
  },
});
