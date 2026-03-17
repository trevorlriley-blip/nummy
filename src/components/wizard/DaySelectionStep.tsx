import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../hooks/useAppTheme';
import { DAY_OPTIONS, ALL_DAYS } from '../../data/wizardOptions';
import { spacing, borderRadius } from '../../theme/spacing';

interface DaySelectionStepProps {
  selectedDays: string[];
  onToggle: (day: string) => void;
  onSetAll: (days: string[]) => void;
}

export function DaySelectionStep({ selectedDays, onToggle, onSetAll }: DaySelectionStepProps) {
  const theme = useAppTheme();
  const allSelected = selectedDays.length === ALL_DAYS.length;

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
        Which days do you need meals?
      </Text>
      <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        We'll plan meals for each day you pick.
      </Text>

      <Pressable onPress={() => onSetAll(allSelected ? [] : ALL_DAYS)}>
        <Text variant="labelLarge" style={[styles.toggleAll, { color: theme.colors.primary }]}>
          {allSelected ? 'Deselect All' : 'Select All'}
        </Text>
      </Pressable>

      <View style={styles.grid}>
        {DAY_OPTIONS.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <Pressable
              key={day.value}
              onPress={() => onToggle(day.value)}
              style={[
                styles.dayCard,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primaryContainer
                    : theme.colors.surfaceVariant,
                  borderColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.outlineVariant,
                },
              ]}
            >
              <Text
                variant="titleMedium"
                style={{
                  color: isSelected
                    ? theme.colors.onPrimaryContainer
                    : theme.colors.onSurfaceVariant,
                  fontWeight: isSelected ? '700' : '500',
                }}
              >
                {day.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  toggleAll: {
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayCard: {
    width: '30%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
});
