import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { PlannedMeal } from '../../types/mealPlan';
import { formatTime } from '../../utils/formatters';
import { MEAL_ICONS, MEAL_LABELS } from './mealConstants';

interface PreviewMealSlotProps {
  meal: PlannedMeal;
  onPress: () => void;
  onSwapPress: () => void;
}

export function PreviewMealSlot({ meal, onPress, onSwapPress }: PreviewMealSlotProps) {
  const theme = useAppTheme();
  const iconName = MEAL_ICONS[meal.mealType] ?? 'food';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.8 : 1,
          borderLeftColor: theme.colors.primary,
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
      <IconButton
        icon="swap-horizontal"
        size={20}
        iconColor={theme.colors.primary}
        onPress={onSwapPress}
        style={styles.swapButton}
      />
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
  swapButton: {
    margin: 0,
  },
});
