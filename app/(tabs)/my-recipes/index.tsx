import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Chip, IconButton, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useMyRecipes } from '../../../src/contexts/MyRecipesContext';
import { useUser } from '../../../src/contexts/UserContext';
import { useMealPlan } from '../../../src/contexts/MealPlanContext';
import { spacing } from '../../../src/theme/spacing';
import { Recipe } from '../../../src/types/recipe';

const MEAL_TYPE_ICONS: Record<string, string> = {
  breakfast: 'coffee',
  lunch: 'food',
  dinner: 'silverware-fork-knife',
  snack: 'cookie',
  dessert: 'ice-cream',
};

export default function MyRecipesScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { myRecipes, deleteMyRecipe } = useMyRecipes();
  const { user, toggleFavorite } = useUser();
  const { plans } = useMealPlan();

  // Build a lookup of all recipe objects from stored plans
  const planRecipeLookup = useMemo(() => {
    const map: Record<string, Recipe> = {};
    for (const plan of plans) {
      for (const day of plan.days) {
        for (const meal of day.meals) {
          map[meal.recipe.id] = meal.recipe;
        }
      }
    }
    return map;
  }, [plans]);

  // Favorited recipes that aren't already in myRecipes (custom recipes)
  const favoriteRecipes = useMemo(() => {
    const customIds = new Set(myRecipes.map((r) => r.id));
    return user.favoriteRecipeIds
      .filter((id) => !customIds.has(id))
      .map((id) => planRecipeLookup[id])
      .filter((r): r is Recipe => r !== undefined);
  }, [user.favoriteRecipeIds, planRecipeLookup, myRecipes]);

  const totalCount = myRecipes.length + favoriteRecipes.length;
  const showSectionHeaders = myRecipes.length > 0 && favoriteRecipes.length > 0;

  const handleDelete = (recipe: Recipe) => {
    Alert.alert(
      'Delete Recipe',
      `Remove "${recipe.title}" from My Recipes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMyRecipe(recipe.id),
        },
      ]
    );
  };

  const cuisineLabel = (cuisine: string) =>
    cuisine.charAt(0).toUpperCase() + cuisine.slice(1).replace('-', ' ');

  const renderCustomCard = (item: Recipe) => (
    <Pressable key={item.id} onPress={() => router.push(`/recipe/${item.id}` as any)}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardRow}>
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primaryContainer }]}>
              <MaterialCommunityIcons
                name={(MEAL_TYPE_ICONS[item.mealTypes[0]] ?? 'food') as any}
                size={28}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.details}>
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onSurface, fontWeight: '600' }}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              <View style={styles.metaRow}>
                {item.mealTypes.map((t) => (
                  <Chip
                    key={t}
                    mode="flat"
                    compact
                    style={{ backgroundColor: theme.colors.tertiaryContainer }}
                    textStyle={{ fontSize: 11, color: theme.colors.onTertiaryContainer }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Chip>
                ))}
                <Chip
                  mode="flat"
                  compact
                  style={{ backgroundColor: theme.colors.secondaryContainer }}
                  textStyle={{ fontSize: 11, color: theme.colors.onSecondaryContainer }}
                >
                  {cuisineLabel(item.cuisineType)}
                </Chip>
              </View>

              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="signal-cellular-1" size={14} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 3 }}>
                  {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                </Text>
                {item.totalTimeMinutes > 0 && (
                  <>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.onSurfaceVariant} style={{ marginLeft: spacing.sm }} />
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 3 }}>
                      {item.totalTimeMinutes} min
                    </Text>
                  </>
                )}
              </View>
            </View>

            <View style={styles.actions}>
              <IconButton
                icon="pencil-outline"
                size={20}
                iconColor={theme.colors.primary}
                onPress={() => router.push({ pathname: '/my-recipes/add', params: { recipeId: item.id } } as any)}
                style={styles.actionBtn}
              />
              <IconButton
                icon="trash-can-outline"
                size={20}
                iconColor={theme.colors.error}
                onPress={() => handleDelete(item)}
                style={styles.actionBtn}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );

  const renderFavoriteCard = (item: Recipe) => (
    <Pressable key={item.id} onPress={() => router.push(`/recipe/${item.id}` as any)}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardRow}>
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.secondaryContainer }]}>
              <MaterialCommunityIcons
                name={(MEAL_TYPE_ICONS[item.mealTypes[0]] ?? 'food') as any}
                size={28}
                color={theme.colors.secondary}
              />
            </View>

            <View style={styles.details}>
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onSurface, fontWeight: '600' }}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              <View style={styles.metaRow}>
                {item.mealTypes.map((t) => (
                  <Chip
                    key={t}
                    mode="flat"
                    compact
                    style={{ backgroundColor: theme.colors.tertiaryContainer }}
                    textStyle={{ fontSize: 11, color: theme.colors.onTertiaryContainer }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Chip>
                ))}
                <Chip
                  mode="flat"
                  compact
                  style={{ backgroundColor: theme.colors.secondaryContainer }}
                  textStyle={{ fontSize: 11, color: theme.colors.onSecondaryContainer }}
                >
                  {cuisineLabel(item.cuisineType)}
                </Chip>
              </View>

              <View style={styles.metaRow}>
                <MaterialCommunityIcons name="signal-cellular-1" size={14} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 3 }}>
                  {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                </Text>
                {item.totalTimeMinutes > 0 && (
                  <>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.onSurfaceVariant} style={{ marginLeft: spacing.sm }} />
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 3 }}>
                      {item.totalTimeMinutes} min
                    </Text>
                  </>
                )}
              </View>
            </View>

            <IconButton
              icon="heart"
              size={20}
              iconColor={theme.colors.primary}
              onPress={() => toggleFavorite(item.id)}
              style={styles.actionBtn}
            />
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
          My Recipes
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {totalCount} {totalCount === 1 ? 'recipe' : 'recipes'}
        </Text>
      </View>

      {totalCount === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="notebook-outline" size={64} color={theme.colors.outlineVariant} />
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.onBackground, fontWeight: '600', marginTop: spacing.md }}
          >
            No Recipes Yet
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.xs, paddingHorizontal: spacing.xl }}
          >
            Add your own recipes or favorite ones from your meal plans, and the agent can include them in future plans.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {favoriteRecipes.length > 0 && (
            <>
              {showSectionHeaders && (
                <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Favorites
                </Text>
              )}
              {favoriteRecipes.map(renderFavoriteCard)}
            </>
          )}
          {myRecipes.length > 0 && (
            <>
              {showSectionHeaders && (
                <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Custom Recipes
                </Text>
              )}
              {myRecipes.map(renderCustomCard)}
            </>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <FAB
        icon="plus"
        label="Add Recipe"
        onPress={() => router.push('/my-recipes/add' as any)}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  cardContent: {
    paddingVertical: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    marginLeft: spacing.sm,
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  actionBtn: {
    margin: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    borderRadius: 28,
  },
});
