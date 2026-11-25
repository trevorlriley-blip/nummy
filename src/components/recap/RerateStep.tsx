import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, IconButton, Text } from 'react-native-paper';
import { format, parseISO } from 'date-fns';

import { useAppTheme } from '../../hooks/useAppTheme';
import { useFeedback } from '../../contexts/FeedbackContext';
import { PlannedMeal } from '../../types/mealPlan';
import { DinnerStatus, DinnerVerdict, RecapRating } from '../../types/recap';
import { verdictFromRating } from '../../utils/recap';
import { spacing } from '../../theme/spacing';

interface Props {
  dinners: PlannedMeal[];
  onDone: (ratings: RecapRating[]) => void;
  onClose: () => void;
}

interface Answer {
  status?: DinnerStatus;
  verdict?: DinnerVerdict;
}

const STATUS_OPTIONS: { value: DinnerStatus; label: string }[] = [
  { value: 'made', label: 'Yes' },
  { value: 'skipped', label: 'No' },
  { value: 'ate-out', label: 'Ate out' },
];
const VERDICT_OPTIONS: { value: DinnerVerdict; label: string }[] = [
  { value: 'loved', label: 'Loved it' },
  { value: 'ok', label: 'It was OK' },
  { value: 'not-again', label: 'Not again' },
];

/** Step 2: did you make each planned dinner, and how was it after sleeping on it. */
export function RerateStep({ dinners, onDone, onClose }: Props) {
  const theme = useAppTheme();
  const { feedbackEntries } = useFeedback();

  // Start from any rating already saved so the recap updates it rather than starting blank.
  const [answers, setAnswers] = useState<Record<string, Answer>>(() => {
    const initial: Record<string, Answer> = {};
    for (const m of dinners) {
      const fb = feedbackEntries.find((f) => f.plannedMealId === m.id);
      if (!fb) continue;
      initial[m.id] = fb.didMakeIt
        ? { status: 'made', verdict: verdictFromRating(fb.rating) }
        : { status: fb.ateOut ? 'ate-out' : 'skipped' };
    }
    return initial;
  });

  const set = (id: string, patch: Answer) => setAnswers((a) => ({ ...a, [id]: { ...a[id], ...patch } }));

  const finish = () => {
    const ratings: RecapRating[] = [];
    for (const m of dinners) {
      const a = answers[m.id];
      if (!a?.status) continue;
      ratings.push({
        plannedMealId: m.id,
        recipeId: m.recipe.id,
        title: m.recipe.title,
        status: a.status,
        verdict: a.status === 'made' ? a.verdict : undefined,
      });
    }
    onDone(ratings);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerRow}>
        <IconButton icon="close" onPress={onClose} accessibilityLabel="Close recap" />
        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>Step 2 of 3</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
          How did dinners go?
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Ratings often change after you sleep on them, so this updates what you said earlier.
        </Text>

        {dinners.length === 0 && (
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.md }}>
            No dinners were planned this week.
          </Text>
        )}

        {dinners.map((m) => {
          const a = answers[m.id] ?? {};
          return (
            <View key={m.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                {format(parseISO(m.date), 'EEEE')}
              </Text>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>{m.recipe.title}</Text>
              <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Made it?</Text>
              <View style={styles.chips}>
                {STATUS_OPTIONS.map((o) => (
                  <Chip
                    key={o.value}
                    selected={a.status === o.value}
                    showSelectedOverlay
                    onPress={() => set(m.id, { status: o.value, verdict: o.value === 'made' ? a.verdict : undefined })}
                  >
                    {o.label}
                  </Chip>
                ))}
              </View>
              {a.status === 'made' && (
                <>
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>How was it?</Text>
                  <View style={styles.chips}>
                    {VERDICT_OPTIONS.map((o) => (
                      <Chip
                        key={o.value}
                        selected={a.verdict === o.value}
                        showSelectedOverlay
                        onPress={() => set(m.id, { verdict: o.value })}
                      >
                        {o.label}
                      </Chip>
                    ))}
                  </View>
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <Button mode="contained" onPress={finish} style={{ flex: 1 }}>See my recap</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: spacing.md },
  content: { padding: spacing.md, gap: spacing.sm },
  card: { borderRadius: 12, padding: spacing.md, gap: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  footer: { flexDirection: 'row', padding: spacing.md },
});
