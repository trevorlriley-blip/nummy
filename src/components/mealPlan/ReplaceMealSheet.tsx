import React from 'react';
import { View, FlatList, StyleSheet, Pressable, Modal } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Recipe } from '../../types/recipe';
import { PlannedMeal } from '../../types/mealPlan';
import { formatTime } from '../../utils/formatters';
import { MEAL_LABELS } from './mealConstants';
import { spacing, borderRadius } from '../../theme/spacing';

interface ReplaceMealSheetProps {
  visible: boolean;
  meal: PlannedMeal | null;
  alternatives: Recipe[];
  onSelect: (recipeId: string) => void;
  onDismiss: () => void;
}

export function ReplaceMealSheet({
  visible,
  meal,
  alternatives,
  onSelect,
  onDismiss,
}: ReplaceMealSheetProps) {
  const theme = useAppTheme();

  if (!meal) return null;

  const renderItem = ({ item }: { item: Recipe }) => (
    <Pressable
      onPress={() => onSelect(item.id)}
      style={({ pressed }) => [
        styles.recipeRow,
        {
          backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface,
        },
      ]}
    >
      <View style={[styles.recipeIcon, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name="food-variant" size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.recipeContent}>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurface, fontWeight: '600' }}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {formatTime(item.totalTimeMinutes)}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={theme.colors.onSurfaceVariant}
      />
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
              Replace {MEAL_LABELS[meal.mealType]}
            </Text>
            <Pressable onPress={onDismiss}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

          {alternatives.length === 0 ? (
            <View style={styles.empty}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                No alternative recipes available.
              </Text>
            </View>
          ) : (
            <FlatList
              data={alternatives}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ItemSeparatorComponent={() => (
                <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
              )}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  list: {
    flexGrow: 0,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  recipeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  recipeContent: {
    flex: 1,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});
