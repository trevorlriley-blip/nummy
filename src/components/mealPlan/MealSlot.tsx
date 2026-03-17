import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { PlannedMeal } from '../../types/mealPlan';
import { formatTime } from '../../utils/formatters';
import { MEAL_ICONS, MEAL_LABELS } from './mealConstants';

interface MealSlotProps {
  meal: PlannedMeal;
  onPress: () => void;
  onRate: () => void;
  hasFeedback: boolean;
}

export function MealSlot({ meal, onPress, onRate, hasFeedback }: MealSlotProps) {
  const theme = useAppTheme();
  const iconName = MEAL_ICONS[meal.mealType] ?? 'food';

  const isFullyDone = meal.isCompleted && hasFeedback;
  const needsRating = meal.isCompleted && !hasFeedback;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isFullyDone
            ? theme.colors.secondaryContainer
            : theme.colors.surface,
          opacity: pressed ? 0.8 : 1,
          borderLeftColor: isFullyDone
            ? theme.colors.secondary
            : needsRating
              ? theme.colors.tertiary
              : theme.colors.primary,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={iconName as any}
          size={20}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.content}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {MEAL_LABELS[meal.mealType]}
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurface, fontWeight: '600' }}
          numberOfLines={1}
        >
          {meal.recipe.title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
          {formatTime(meal.recipe.totalTimeMinutes)}
        </Text>
      </View>
      {isFullyDone ? (
        <View style={styles.trailingArea}>
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color={theme.colors.secondary}
          />
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={theme.colors.onSurfaceVariant}
            style={{ marginLeft: 2 }}
          />
        </View>
      ) : needsRating ? (
        <IconButton
          icon="star-plus-outline"
          size={20}
          iconColor={theme.colors.tertiary}
          onPress={onRate}
          style={styles.actionButton}
        />
      ) : (
        <IconButton
          icon="checkbox-marked-circle-plus-outline"
          size={20}
          iconColor={theme.colors.primary}
          onPress={onRate}
          style={styles.actionButton}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 3,
    borderRadius: 10,
    borderLeftWidth: 3,
    elevation: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  trailingArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
  },
});
