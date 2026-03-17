import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Searchbar,
  Chip,
  Card,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useRecipes } from '../../../src/contexts/RecipeContext';
import { formatTime } from '../../../src/utils/formatters';
import { spacing } from '../../../src/theme/spacing';
import { Recipe, MealType, DietaryTag } from '../../../src/types/recipe';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 2 - CARD_GAP) / 2;

type FilterOption = {
  key: string;
  label: string;
  type: 'all' | 'meal' | 'time' | 'dietary';
  value?: MealType | DietaryTag;
  maxTime?: number;
};

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All', type: 'all' },
  { key: 'breakfast', label: 'Breakfast', type: 'meal', value: 'breakfast' },
  { key: 'lunch', label: 'Lunch', type: 'meal', value: 'lunch' },
  { key: 'dinner', label: 'Dinner', type: 'meal', value: 'dinner' },
  { key: 'snack', label: 'Snack', type: 'meal', value: 'snack' },
  { key: 'dessert', label: 'Dessert', type: 'meal', value: 'dessert' },
  { key: 'quick', label: 'Quick <30min', type: 'time', maxTime: 30 },
  { key: 'vegetarian', label: 'Vegetarian', type: 'dietary', value: 'vegetarian' },
  { key: 'vegan', label: 'Vegan', type: 'dietary', value: 'vegan' },
  { key: 'gluten-free', label: 'Gluten-Free', type: 'dietary', value: 'gluten-free' },
];

export default function ExploreScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { filterRecipes } = useRecipes();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredRecipes = useMemo(() => {
    const selected = FILTER_OPTIONS.find((f) => f.key === activeFilter);

    const filters: Parameters<typeof filterRecipes>[0] = {};

    if (searchQuery.trim()) {
      filters.query = searchQuery.trim();
    }

    if (selected && selected.type === 'meal' && selected.value) {
      filters.mealTypes = [selected.value as MealType];
    }

    if (selected && selected.type === 'time' && selected.maxTime) {
      filters.maxTotalTime = selected.maxTime;
    }

    if (selected && selected.type === 'dietary' && selected.value) {
      filters.dietaryTags = [selected.value as DietaryTag];
    }

    return filterRecipes(filters);
  }, [searchQuery, activeFilter, filterRecipes]);

  const handleRecipePress = useCallback(
    (recipe: Recipe) => {
      router.push(`/recipe/${recipe.id}` as any);
    },
    [router]
  );

  const cuisineLabel = (cuisine: string): string => {
    return cuisine.charAt(0).toUpperCase() + cuisine.slice(1).replace('-', ' ');
  };

  const dietaryLabel = (tag: string): string => {
    return tag
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('-');
  };

  const renderRecipeCard = useCallback(
    ({ item }: { item: Recipe }) => (
      <Pressable
        onPress={() => handleRecipePress(item)}
        style={[styles.cardWrapper]}
      >
        <Card
          style={[styles.recipeCard, { backgroundColor: theme.colors.surface }]}
          mode="elevated"
        >
          {/* Image placeholder */}
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name="food"
              size={32}
              color={theme.colors.primary}
            />
          </View>

          <Card.Content style={styles.cardContent}>
            {/* Title */}
            <Text
              variant="titleSmall"
              style={{ color: theme.colors.onSurface, fontWeight: '600' }}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            {/* Cuisine Chip */}
            <Chip
              mode="flat"
              compact
              style={[styles.cuisineChip, { backgroundColor: theme.colors.tertiaryContainer }]}
              textStyle={{
                fontSize: 10,
                color: theme.colors.onTertiaryContainer,
                fontWeight: '500',
              }}
            >
              {cuisineLabel(item.cuisineType)}
            </Chip>

            {/* Time */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant, marginLeft: 3 }}
                >
                  {formatTime(item.totalTimeMinutes)}
                </Text>
              </View>
            </View>

            {/* Dietary Tags (max 2) */}
            {item.dietaryTags.length > 0 && (
              <View style={styles.tagRow}>
                {item.dietaryTags.slice(0, 2).map((tag) => (
                  <Chip
                    key={tag}
                    mode="outlined"
                    compact
                    style={styles.dietaryChip}
                    textStyle={{
                      fontSize: 9,
                      color: theme.colors.secondary,
                    }}
                  >
                    {dietaryLabel(tag)}
                  </Chip>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      </Pressable>
    ),
    [theme, handleRecipePress]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text
          variant="headlineSmall"
          style={{ color: theme.colors.onSurface, fontWeight: '700', marginBottom: spacing.sm }}
        >
          Explore Recipes
        </Text>

        {/* Search Bar */}
        <Searchbar
          placeholder="Search recipes, ingredients..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
          inputStyle={{ fontSize: 14 }}
          iconColor={theme.colors.onSurfaceVariant}
          placeholderTextColor={theme.colors.outline}
        />

        {/* Filter Chips */}
        <FlatList
          data={FILTER_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item: filter }) => {
            const isActive = activeFilter === filter.key;
            return (
              <Chip
                selected={isActive}
                onPress={() => setActiveFilter(filter.key)}
                mode={isActive ? 'flat' : 'outlined'}
                compact
                style={[
                  styles.filterChip,
                  isActive && { backgroundColor: theme.colors.primaryContainer },
                ]}
                textStyle={[
                  { fontSize: 12 },
                  isActive
                    ? { color: theme.colors.onPrimaryContainer, fontWeight: '600' }
                    : { color: theme.colors.onSurfaceVariant },
                ]}
                showSelectedOverlay={false}
              >
                {filter.label}
              </Chip>
            );
          }}
        />
      </View>

      {/* Recipe Grid */}
      {filteredRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="magnify-close"
            size={56}
            color={theme.colors.outlineVariant}
          />
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.onBackground, fontWeight: '600', marginTop: spacing.sm }}
          >
            No Recipes Found
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.xs }}
          >
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchBar: {
    borderRadius: 12,
    elevation: 0,
    height: 44,
  },
  filterRow: {
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  filterChip: {
    borderRadius: 20,
  },
  gridContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  recipeCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  cuisineChip: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    height: 22,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  dietaryChip: {
    height: 22,
    borderRadius: 11,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
});
