import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, IconButton, Chip, Divider, Surface, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useRecipes } from '../../src/contexts/RecipeContext';
import { useUser } from '../../src/contexts/UserContext';
import { useFeedback } from '../../src/contexts/FeedbackContext';
import { formatTime } from '../../src/utils/formatters';

export default function RecipeDetailScreen() {
  const { id, plannedMealId } = useLocalSearchParams<{ id: string; plannedMealId?: string }>();
  const theme = useAppTheme();
  const router = useRouter();
  const { getRecipeById } = useRecipes();
  const { isFavorite, toggleFavorite } = useUser();
  const { getAverageRating } = useFeedback();

  const recipe = useMemo(() => getRecipeById(id ?? ''), [id, getRecipeById]);

  if (!recipe) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge" style={{ textAlign: 'center', marginTop: 40 }}>
          Recipe not found
        </Text>
        <Button onPress={() => router.back()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  const favorite = isFavorite(recipe.id);
  const avgRating = getAverageRating(recipe.id);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header bar */}
      <View style={[styles.headerBar, { backgroundColor: theme.colors.surface }]}>
        <IconButton icon="close" onPress={() => router.back()} iconColor={theme.colors.onSurface} />
        <Text variant="titleMedium" style={{ flex: 1, fontWeight: '600', color: theme.colors.onSurface }} numberOfLines={1}>
          {recipe.title}
        </Text>
        <IconButton
          icon={favorite ? 'heart' : 'heart-outline'}
          iconColor={favorite ? theme.colors.error : theme.colors.onSurfaceVariant}
          onPress={() => toggleFavorite(recipe.id)}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero placeholder */}
        <View style={[styles.heroPlaceholder, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons name="food-variant" size={80} color={theme.colors.primary} />
          <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer, marginTop: 8 }}>
            {recipe.cuisineType.charAt(0).toUpperCase() + recipe.cuisineType.slice(1)} Cuisine
          </Text>
        </View>

        {/* Meta bar */}
        <View style={styles.metaBar}>
          <Chip icon="clock-outline" compact textStyle={styles.chipText}>
            {formatTime(recipe.totalTimeMinutes)}
          </Chip>
          <Chip icon="account-group" compact textStyle={styles.chipText}>
            {recipe.servings} servings
          </Chip>
          <Chip icon="signal-cellular-2" compact textStyle={styles.chipText}>
            {recipe.difficulty}
          </Chip>
        </View>

        {avgRating !== null && (
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={18} color={theme.colors.tertiary} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, marginLeft: 4 }}>
              {avgRating.toFixed(1)} average rating
            </Text>
          </View>
        )}

        {plannedMealId && (
          <Button
            mode="outlined"
            icon="star-plus-outline"
            onPress={() => router.push(`/feedback/${plannedMealId}` as any)}
            style={{ marginHorizontal: 16, marginTop: 12, borderRadius: 12, borderColor: theme.colors.primary }}
            textColor={theme.colors.primary}
          >
            Rate this meal
          </Button>
        )}

        {/* Dietary tags */}
        {recipe.dietaryTags.length > 0 && (
          <View style={styles.tagRow}>
            {recipe.dietaryTags.map((tag) => (
              <Chip
                key={tag}
                compact
                style={[styles.dietTag, { backgroundColor: theme.colors.secondaryContainer }]}
                textStyle={{ fontSize: 11, color: theme.colors.onSecondaryContainer }}
              >
                {tag}
              </Chip>
            ))}
          </View>
        )}

        {/* Description */}
        <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurface }]}>
          {recipe.description}
        </Text>

        <Divider style={styles.divider} />

        {/* Ingredients */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Ingredients
        </Text>
        {recipe.ingredients.map((ing) => (
          <View key={ing.id} style={styles.ingredientRow}>
            <MaterialCommunityIcons name="circle-small" size={20} color={theme.colors.primary} />
            <Text variant="bodyMedium" style={{ flex: 1, color: theme.colors.onSurface }}>
              {ing.quantity}{ing.unit ? ` ${ing.unit}` : ''} {ing.name}
            </Text>
          </View>
        ))}

        <Divider style={styles.divider} />

        {/* Instructions */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Instructions
        </Text>
        {recipe.instructions.map((step) => (
          <View key={step.stepNumber} style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text variant="labelSmall" style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>
                {step.stepNumber}
              </Text>
            </View>
            <View style={styles.stepContent}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {step.instruction}
              </Text>
              {step.tip && (
                <View style={[styles.tipContainer, { backgroundColor: theme.colors.tertiaryContainer }]}>
                  <MaterialCommunityIcons name="lightbulb-outline" size={14} color={theme.colors.tertiary} />
                  <Text variant="bodySmall" style={{ color: theme.colors.onTertiaryContainer, flex: 1, marginLeft: 6 }}>
                    {step.tip}
                  </Text>
                </View>
              )}
              {step.durationMinutes && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  ~{step.durationMinutes} min
                </Text>
              )}
            </View>
          </View>
        ))}

        <Divider style={styles.divider} />

        {/* Nutrition */}
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Nutrition per Serving
        </Text>
        <Surface style={styles.nutritionGrid} elevation={1}>
          {[
            { label: 'Calories', value: `${recipe.nutrition.calories}`, unit: 'kcal' },
            { label: 'Protein', value: `${recipe.nutrition.protein}`, unit: 'g' },
            { label: 'Carbs', value: `${recipe.nutrition.carbohydrates}`, unit: 'g' },
            { label: 'Fat', value: `${recipe.nutrition.fat}`, unit: 'g' },
            { label: 'Fiber', value: `${recipe.nutrition.fiber}`, unit: 'g' },
            { label: 'Sodium', value: `${recipe.nutrition.sodium}`, unit: 'mg' },
          ].map((item) => (
            <View key={item.label} style={styles.nutritionItem}>
              <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                {item.value}
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.unit}
                </Text>
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {item.label}
              </Text>
            </View>
          ))}
        </Surface>

        {/* Allergens */}
        {recipe.allergens.length > 0 && (
          <View style={styles.allergenRow}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color={theme.colors.error} />
            <Text variant="bodySmall" style={{ color: theme.colors.error, marginLeft: 6 }}>
              Allergens: {recipe.allergens.join(', ')}
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
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
  scrollContent: { paddingBottom: 20 },
  heroPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  chipText: { fontSize: 12 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  dietTag: { height: 28 },
  description: {
    paddingHorizontal: 16,
    paddingTop: 16,
    lineHeight: 22,
  },
  divider: { marginHorizontal: 16, marginVertical: 16 },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
    fontWeight: '700',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stepRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepContent: { flex: 1 },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  nutritionItem: {
    width: '33%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
});
