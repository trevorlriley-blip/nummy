import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, FAB, ActivityIndicator, Menu, IconButton, Button } from 'react-native-paper';
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
  const { currentPlan, isGenerating, goToPreviousWeek, goToNextWeek, canGoBack, canGoForward, deletePlan } = useMealPlan();
  const { hasFeedback } = useFeedback();

  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

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

  const handleDeletePlan = useCallback(() => {
    if (!currentPlan) return;
    deletePlan(currentPlan.id);
    setDeleteDialogVisible(false);
    setMenuVisible(false);
  }, [currentPlan, deletePlan]);

  const handleRegenerate = useCallback(() => {
    setMenuVisible(false);
    router.push('/wizard');
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Modal
        visible={deleteDialogVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setDeleteDialogVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setDeleteDialogVisible(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, marginBottom: 8 }}>
              Delete this plan?
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
              This will permanently remove the meal plan and its grocery list.
            </Text>
            <View style={styles.modalActions}>
              <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
              <Button textColor={theme.colors.error} onPress={handleDeletePlan}>Delete</Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
          Meal Plan
        </Text>
        {currentPlan && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={24}
                onPress={() => setMenuVisible(true)}
                iconColor={theme.colors.onBackground}
              />
            }
          >
            <Menu.Item
              leadingIcon="refresh"
              onPress={handleRegenerate}
              title="Regenerate plan"
            />
            <Menu.Item
              leadingIcon="trash-can-outline"
              onPress={() => { setMenuVisible(false); setDeleteDialogVisible(true); }}
              title="Delete plan"
              titleStyle={{ color: theme.colors.error }}
            />
          </Menu>
        )}
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
    paddingLeft: 20,
    paddingRight: 4,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 28,
    padding: 24,
    width: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
