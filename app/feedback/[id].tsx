import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Text, IconButton, Button, TextInput, SegmentedButtons, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useMealPlan } from '../../src/contexts/MealPlanContext';
import { useFeedback } from '../../src/contexts/FeedbackContext';
import { useUser } from '../../src/contexts/UserContext';

export default function FeedbackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const router = useRouter();
  const { getPlannedMeal, markMealCompleted } = useMealPlan();
  const { submitFeedback } = useFeedback();
  const { toggleFavorite, isFavorite } = useUser();

  const meal = getPlannedMeal(id ?? '');

  const [didMakeIt, setDidMakeIt] = useState<string>('yes');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [addToFavorites, setAddToFavorites] = useState(meal ? isFavorite(meal.recipe.id) : false);

  const handleSubmit = useCallback(() => {
    if (!meal) return;
    const currentlyFav = isFavorite(meal.recipe.id);
    if (addToFavorites !== currentlyFav) {
      toggleFavorite(meal.recipe.id);
    }
    submitFeedback({
      plannedMealId: meal.id,
      recipeId: meal.recipe.id,
      date: meal.date,
      didMakeIt: didMakeIt === 'yes',
      rating: didMakeIt === 'yes' && rating > 0 ? (rating as 1 | 2 | 3 | 4 | 5) : undefined,
      notes: notes.trim() || undefined,
    });
    markMealCompleted(meal.id);
    router.back();
  }, [meal, didMakeIt, rating, notes, addToFavorites, toggleFavorite, isFavorite, submitFeedback, markMealCompleted, router]);

  if (!meal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge" style={{ textAlign: 'center', marginTop: 40 }}>
          Meal not found
        </Text>
        <Button onPress={() => router.back()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.headerBar, { backgroundColor: theme.colors.surface }]}>
        <IconButton icon="close" onPress={() => router.back()} iconColor={theme.colors.onSurface} />
        <Text variant="titleMedium" style={{ flex: 1, fontWeight: '600', color: theme.colors.onSurface }}>
          Meal Feedback
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Recipe card */}
        <Surface style={styles.recipeCard} elevation={1}>
          <MaterialCommunityIcons name="food-variant" size={40} color={theme.colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
              {meal.recipe.title}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {meal.date} · {meal.mealType}
            </Text>
          </View>
        </Surface>

        {/* Did you make it? */}
        <Text variant="titleMedium" style={[styles.question, { color: theme.colors.onSurface }]}>
          Did you make this meal?
        </Text>
        <SegmentedButtons
          value={didMakeIt}
          onValueChange={setDidMakeIt}
          buttons={[
            { value: 'yes', label: 'Yes!', icon: 'check' },
            { value: 'no', label: 'No', icon: 'close' },
          ]}
          style={styles.segmented}
        />

        {didMakeIt === 'yes' ? (
          <>
            {/* Star rating */}
            <Text variant="titleMedium" style={[styles.question, { color: theme.colors.onSurface }]}>
              How was it?
            </Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <IconButton
                  key={star}
                  icon={star <= rating ? 'star' : 'star-outline'}
                  iconColor={star <= rating ? theme.colors.tertiary : theme.colors.outlineVariant}
                  size={36}
                  onPress={() => setRating(star)}
                />
              ))}
            </View>
            {rating > 0 && (
              <Text variant="bodySmall" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                {['', 'Not great', 'Below average', 'Good', 'Very good', 'Amazing!'][rating]}
              </Text>
            )}

            {/* Add to Favorites */}
            <Pressable
              onPress={() => setAddToFavorites((v) => !v)}
              style={[styles.favRow, { backgroundColor: theme.colors.surfaceVariant }]}
            >
              <MaterialCommunityIcons
                name={addToFavorites ? 'heart' : 'heart-outline'}
                size={22}
                color={addToFavorites ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginLeft: 12, flex: 1 }}>
                Add to Favorites
              </Text>
              {addToFavorites && (
                <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
              )}
            </Pressable>

            {/* Notes */}
            <Text variant="titleMedium" style={[styles.question, { color: theme.colors.onSurface }]}>
              Any notes?
            </Text>
            <TextInput
              mode="outlined"
              placeholder="What did you think? Any adjustments?"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />
          </>
        ) : (
          <Surface style={[styles.skipMessage, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, flex: 1, marginLeft: 12 }}>
              No worries! We'll use this to adjust future meal plan recommendations.
            </Text>
          </Surface>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          labelStyle={{ fontWeight: '700' }}
        >
          Submit Feedback
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
    elevation: 2,
  },
  scrollContent: { padding: 16 },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  question: {
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  segmented: {
    marginBottom: 24,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  notesInput: {
    marginBottom: 24,
  },
  skipMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
});
