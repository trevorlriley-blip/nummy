import React, { useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  Chip,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useUser } from '../../../src/contexts/UserContext';
import { useRecipes } from '../../../src/contexts/RecipeContext';
import { formatTime } from '../../../src/utils/formatters';
import { spacing } from '../../../src/theme/spacing';
import { Recipe } from '../../../src/types/recipe';

export default function FavoritesScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { user, toggleFavorite } = useUser();
  const { getRecipeById } = useRecipes();

  const favoriteRecipes = useMemo(() => {
    return user.favoriteRecipeIds
      .map((id) => getRecipeById(id))
      .filter((r): r is Recipe => r !== undefined);
  }, [user.favoriteRecipeIds, getRecipeById]);

  const cuisineLabel = (cuisine: string): string => {
    return cuisine.charAt(0).toUpperCase() + cuisine.slice(1).replace('-', ' ');
  };

  const dietaryLabel = (tag: string): string => {
    return tag
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('-');
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <Pressable onPress={() => router.push(`/recipe/${item.id}` as any)}>
      <Card
        style={[styles.recipeCard, { backgroundColor: theme.colors.surface }]}
        mode="elevated"
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardRow}>
            {/* Image Placeholder */}
            <View
              style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primaryContainer }]}
            >
              <MaterialCommunityIcons
                name="food"
                size={28}
                color={theme.colors.primary}
              />
            </View>

            {/* Details */}
            <View style={styles.cardDetails}>
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onSurface, fontWeight: '600' }}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              <View style={styles.metaRow}>
                <Chip
                  mode="flat"
                  compact
                  style={{ backgroundColor: theme.colors.tertiaryContainer, height: 22 }}
                  textStyle={{ fontSize: 10, color: theme.colors.onTertiaryContainer }}
                >
                  {cuisineLabel(item.cuisineType)}
                </Chip>
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

              {/* Dietary Tags */}
              {item.dietaryTags.length > 0 && (
                <View style={styles.tagRow}>
                  {item.dietaryTags.slice(0, 3).map((tag) => (
                    <Chip
                      key={tag}
                      mode="outlined"
                      compact
                      style={styles.dietaryChip}
                      textStyle={{ fontSize: 9, color: theme.colors.secondary }}
                    >
                      {dietaryLabel(tag)}
                    </Chip>
                  ))}
                </View>
              )}
            </View>

            {/* Favorite Button */}
            <IconButton
              icon="heart"
              size={22}
              onPress={() => toggleFavorite(item.id)}
              iconColor={theme.colors.primary}
              style={styles.favButton}
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
        <View style={styles.headerRow}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
            iconColor={theme.colors.onSurface}
          />
          <Text
            variant="titleLarge"
            style={{ color: theme.colors.onSurface, fontWeight: '700', flex: 1 }}
          >
            Favorites
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, marginRight: spacing.md }}
          >
            {favoriteRecipes.length} {favoriteRecipes.length === 1 ? 'recipe' : 'recipes'}
          </Text>
        </View>
      </View>

      {favoriteRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="heart-outline"
            size={64}
            color={theme.colors.outlineVariant}
          />
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.onBackground, fontWeight: '600', marginTop: spacing.md }}
          >
            No Favorites Yet
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.xs }}
          >
            Tap the heart icon on any recipe to add it to your favorites.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
    paddingBottom: spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  recipeCard: {
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
  cardDetails: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
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
    height: 20,
    borderRadius: 10,
  },
  favButton: {
    margin: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
});
