import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useMealPlan } from '../../contexts/MealPlanContext';
import { useRecaps } from '../../contexts/RecapContext';
import { isWeekend, weekContains } from '../../utils/recap';
import { spacing } from '../../theme/spacing';

/** "Your week in food" card on Home, shown on Saturday and Sunday until dismissed or the recap is done. */
export function WeekendRecapCard() {
  const theme = useAppTheme();
  const router = useRouter();
  const { currentPlan } = useMealPlan();
  const { ready, recaps, dismissedWeek, dismissCard } = useRecaps();

  const now = new Date();
  if (!ready || !currentPlan || !isWeekend(now) || !weekContains(currentPlan.weekStartDate, now)) return null;
  const weekOf = currentPlan.weekStartDate;
  if (dismissedWeek === weekOf || recaps.some((r) => r.weekOf === weekOf)) return null;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}>
      <View style={styles.top}>
        <MaterialCommunityIcons name="star-four-points" size={22} color={theme.colors.onPrimaryContainer} />
        <Text variant="titleMedium" style={{ flex: 1, color: theme.colors.onPrimaryContainer, fontWeight: '700' }}>
          Your week in food
        </Text>
        <IconButton
          icon="close"
          size={18}
          iconColor={theme.colors.onPrimaryContainer}
          onPress={() => dismissCard(weekOf)}
          accessibilityLabel="Dismiss"
          style={{ margin: 0 }}
        />
      </View>
      <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer }}>
        Take two minutes to look back: what got tossed, and how dinners turned out.
      </Text>
      <Button mode="contained" onPress={() => router.push('/recap' as any)} style={styles.button}>
        See my recap
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.md, marginBottom: spacing.sm, borderRadius: 16, padding: spacing.md, gap: spacing.xs },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  button: { alignSelf: 'flex-start', marginTop: spacing.xs },
});
