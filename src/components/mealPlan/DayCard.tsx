import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { useAppTheme } from '../../hooks/useAppTheme';
import { DayPlan } from '../../types/mealPlan';
import { MealSlot } from './MealSlot';
import { formatDayFull } from '../../utils/formatters';

interface DayCardProps {
  day: DayPlan;
  isToday: boolean;
  onMealPress: (mealId: string) => void;
  onMealRate: (mealId: string) => void;
  feedbackStatus: Record<string, boolean>;
}

export function DayCard({ day, isToday, onMealPress, onMealRate, feedbackStatus }: DayCardProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: isToday ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
          },
        ]}
      >
        <Text
          variant="titleSmall"
          style={{
            color: isToday ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
            fontWeight: '700',
          }}
        >
          {formatDayFull(day.date)}
        </Text>
        {isToday && (
          <Text
            variant="labelSmall"
            style={{ color: theme.colors.primary, fontWeight: '700' }}
          >
            TODAY
          </Text>
        )}
      </View>
      {day.meals.map((meal) => (
        <MealSlot
          key={meal.id}
          meal={meal}
          onPress={() => onMealPress(meal.id)}
          onRate={() => onMealRate(meal.id)}
          hasFeedback={feedbackStatus[meal.id] ?? false}
        />
      ))}
      <View style={{ height: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
});
