import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../src/hooks/useAppTheme';
import { useMealPlan } from '../src/contexts/MealPlanContext';
import { useGroceryList } from '../src/contexts/GroceryListContext';
import { useOrdering } from '../src/contexts/OrderingContext';
import { usePantry } from '../src/contexts/PantryContext';
import { useFeedback } from '../src/contexts/FeedbackContext';
import { useRecaps } from '../src/contexts/RecapContext';
import { CleanOutStep } from '../src/components/recap/CleanOutStep';
import { RerateStep } from '../src/components/recap/RerateStep';
import { RecapCards } from '../src/components/recap/RecapCards';
import { RecapRating, TossedItem, WeekendRecap } from '../src/types/recap';
import {
  VERDICT_RATING,
  buildCleanOut,
  compareTossed,
  encouragement,
  historyBars,
  perishableNameSet,
  pickUseItUp,
  sumCost,
} from '../src/utils/recap';
import { logEvent } from '../src/utils/testLog';

type Phase = 'clean' | 'rerate' | 'cards';
const STEP_NUMBER: Record<Phase, number> = { clean: 1, rerate: 2, cards: 3 };

/** Weekend Recap: clean-out, re-rate dinners, then swipeable recap cards. */
export default function RecapScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { currentPlan, markMealCompleted } = useMealPlan();
  const { groceryList } = useGroceryList();
  const { lastOrder } = useOrdering();
  const { snapshot, useFirstItems } = usePantry();
  const { feedbackEntries, submitFeedback } = useFeedback();
  const { recaps, saveRecap } = useRecaps();

  const weekOf = currentPlan?.weekStartDate ?? '';
  const dinners = useMemo(
    () => (currentPlan?.days ?? []).flatMap((d) => d.meals.filter((m) => m.mealType === 'dinner')),
    [currentPlan]
  );
  const source = useMemo(
    () => buildCleanOut(lastOrder, groceryList, (snapshot?.items ?? []).filter((i) => i.freshness === 'use-soon')),
    // Computed once per recap so the list doesn't shift under the user while they tap.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [phase, setPhase] = useState<Phase>('clean');
  const [tossed, setTossed] = useState<TossedItem[]>([]);
  const [recap, setRecap] = useState<WeekendRecap | null>(null);

  const startedAt = useRef(Date.now());
  const stepStartedAt = useRef(Date.now());
  const started = useRef(false);
  const finished = useRef(false);

  useEffect(() => {
    if (started.current || !currentPlan) return;
    started.current = true;
    logEvent('recap_started', { weekOf, from: source.from, candidates: source.candidates.length });
  }, [currentPlan, weekOf, source]);

  const leaveStep = (step: Phase) => {
    const seconds = Math.round((Date.now() - stepStartedAt.current) / 1000);
    stepStartedAt.current = Date.now();
    logEvent('recap_step', { step: STEP_NUMBER[step], seconds });
  };

  const existingBaseline = recaps.find((r) => r.baseline !== null)?.baseline ?? null;

  const handleCleanDone = (items: TossedItem[]) => {
    leaveStep('clean');
    setTossed(items);
    setPhase('rerate');
  };

  const handleRerateDone = (ratings: RecapRating[]) => {
    leaveStep('rerate');
    for (const r of ratings) {
      const meal = dinners.find((m) => m.id === r.plannedMealId);
      if (!meal) continue;
      const prior = feedbackEntries.find((f) => f.plannedMealId === meal.id);
      submitFeedback({
        plannedMealId: meal.id,
        recipeId: meal.recipe.id,
        date: meal.date,
        didMakeIt: r.status === 'made',
        ateOut: r.status === 'ate-out' ? true : undefined,
        rating: r.status === 'made' && r.verdict ? VERDICT_RATING[r.verdict] : undefined,
        notes: prior?.notes,
      });
      markMealCompleted(meal.id);
    }
    const next: WeekendRecap = {
      weekOf,
      baseline: existingBaseline,
      tossedItems: tossed,
      tossedCount: tossed.length,
      wastedEstimate: sumCost(tossed),
      mealsMade: ratings.filter((r) => r.status === 'made').length,
      mealsPlanned: dinners.length,
      ratings,
      completedAt: new Date().toISOString(),
    };
    saveRecap(next);
    setRecap(next);
    setPhase('cards');
  };

  const setBaseline = (value: number | null) => {
    if (!recap) return;
    const next = { ...recap, baseline: value };
    saveRecap(next);
    setRecap(next);
  };

  const derived = useMemo(() => {
    if (!recap) return null;
    const history = [...recaps.filter((r) => r.weekOf !== recap.weekOf), recap].sort((a, b) =>
      a.weekOf.localeCompare(b.weekOf)
    );
    const isFirst = !recaps.some((r) => r.weekOf < recap.weekOf);
    const comparison = compareTossed(recap.tossedCount, history, recap.weekOf, recap.baseline);
    const useItUp = pickUseItUp(useFirstItems, source.candidates, perishableNameSet(groceryList, lastOrder), recap.tossedItems);
    const line = encouragement({
      tossedCount: recap.tossedCount,
      comparison,
      mealsMade: recap.mealsMade,
      mealsPlanned: recap.mealsPlanned,
      useItUp,
    });
    return { isFirst, comparison, useItUp, line, bars: historyBars(history, recap.weekOf) };
  }, [recap, recaps, useFirstItems, source, groceryList, lastOrder]);

  const finish = () => {
    if (!recap) return;
    if (!finished.current) {
      finished.current = true;
      leaveStep('cards');
      logEvent('recap_done', {
        minutes: Math.round(((Date.now() - startedAt.current) / 60000) * 10) / 10,
        tossedCount: recap.tossedCount,
        baseline: recap.baseline,
        mealsMade: recap.mealsMade,
        mealsPlanned: recap.mealsPlanned,
      });
    }
    router.back();
  };

  const openUseItUp = (name: string) => {
    logEvent('use_it_up_opened', { item: name, from: 'recap' });
    router.push({
      pathname: '/agent',
      params: { initialMessage: `Give me 3 family dinner ideas that use up ${name}.` },
    } as any);
  };

  if (!currentPlan) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, textAlign: 'center' }}>
            Make a meal plan first, then come back for your recap.
          </Text>
          <Button onPress={() => router.back()}>Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'cards' && recap && derived) {
    return (
      <RecapCards
        recap={recap}
        comparison={derived.comparison}
        isFirst={derived.isFirst}
        bars={derived.bars}
        useItUp={derived.useItUp}
        line={derived.line}
        onSetBaseline={setBaseline}
        onUseItUp={openUseItUp}
        onDone={finish}
        onClose={router.back}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {phase === 'clean' ? (
        <CleanOutStep source={source} onDone={handleCleanDone} onClose={router.back} />
      ) : (
        <RerateStep dinners={dinners} onDone={handleRerateDone} onClose={router.back} />
      )}
    </SafeAreaView>
  );
}
