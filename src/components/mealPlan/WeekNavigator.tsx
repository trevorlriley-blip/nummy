import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useAppTheme } from '../../hooks/useAppTheme';
import { formatWeekRange } from '../../utils/formatters';

interface WeekNavigatorProps {
  weekStartDate: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  style?: ViewStyle;
}

export function WeekNavigator({ weekStartDate, onPreviousWeek, onNextWeek, canGoBack = true, canGoForward = true, style }: WeekNavigatorProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }, style]}>
      <IconButton
        icon="chevron-left"
        onPress={onPreviousWeek}
        iconColor={canGoBack ? theme.colors.primary : theme.colors.outlineVariant}
        disabled={!canGoBack}
      />
      <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
        {formatWeekRange(weekStartDate)}
      </Text>
      <IconButton
        icon="chevron-right"
        onPress={onNextWeek}
        iconColor={canGoForward ? theme.colors.primary : theme.colors.outlineVariant}
        disabled={!canGoForward}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    elevation: 1,
  },
});
