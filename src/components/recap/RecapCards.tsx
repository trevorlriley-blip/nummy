import React, { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, IconButton, Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../../hooks/useAppTheme';
import { WeekendRecap } from '../../types/recap';
import {
  Bar,
  TossedComparison,
  UseItUpPick,
  formatDollars,
} from '../../utils/recap';
import { TossedBars } from './TossedBars';

interface Props {
  recap: WeekendRecap;
  comparison: TossedComparison;
  isFirst: boolean;
  bars: Bar[];
  useItUp: UseItUpPick | null;
  line: string;
  onSetBaseline: (value: number | null) => void;
  onUseItUp: (name: string) => void;
  onDone: () => void;
  onClose: () => void;
}

/** Step 3: swipeable full-screen recap cards. */
export function RecapCards({ recap, comparison, isFirst, bars, useItUp, line, onSetBaseline, onUseItUp, onDone, onClose }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scroller = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [baselineText, setBaselineText] = useState(recap.baseline !== null ? String(recap.baseline) : '');

  const palette = [
    { bg: theme.colors.primaryContainer, fg: theme.colors.onPrimaryContainer },
    { bg: theme.colors.tertiaryContainer, fg: theme.colors.onTertiaryContainer },
    { bg: theme.colors.secondaryContainer, fg: theme.colors.onSecondaryContainer },
  ];

  const loved = recap.ratings.filter((r) => r.verdict === 'loved');
  const ateOut = recap.ratings.filter((r) => r.status === 'ate-out').length;

  type Card = { key: string; render: (fg: string) => React.ReactNode };
  const cards: Card[] = [];

  if (isFirst) {
    cards.push({
      key: 'baseline',
      render: (fg) => (
        <>
          <Text variant="titleLarge" style={[styles.center, { color: fg }]}>Your starting point</Text>
          <Text variant="bodyLarge" style={[styles.center, { color: fg }]}>
            From your paper count: about how many items did you toss in a typical week before Nummy?
          </Text>
          <TextInput
            mode="outlined"
            keyboardType="number-pad"
            value={baselineText}
            onChangeText={(t) => setBaselineText(t.replace(/[^0-9]/g, ''))}
            style={styles.baselineInput}
            placeholder="e.g. 8"
          />
          <Button
            mode="contained"
            disabled={baselineText === ''}
            onPress={() => onSetBaseline(parseInt(baselineText, 10))}
          >
            {recap.baseline !== null && String(recap.baseline) === baselineText ? 'Saved ✓' : 'Save baseline'}
          </Button>
          <Button mode="text" textColor={fg} onPress={() => { setBaselineText(''); onSetBaseline(null); }}>
            Skip for now
          </Button>
        </>
      ),
    });
  }

  cards.push({
    key: 'tossed',
    render: (fg) => (
      <>
        <Text variant="titleMedium" style={[styles.center, { color: fg }]}>Food tossed this week</Text>
        <Text style={[styles.huge, { color: fg }]}>{recap.tossedCount}</Text>
        <Text variant="titleMedium" style={[styles.center, { color: fg }]}>
          {recap.tossedCount === 1 ? 'item' : 'items'}
        </Text>
        {comparison.direction ? (
          <View style={styles.compareRow}>
            <MaterialCommunityIcons
              name={comparison.direction === 'down' ? 'arrow-down-bold' : comparison.direction === 'up' ? 'arrow-up-bold' : 'equal'}
              size={32}
              color={fg}
            />
            <Text variant="titleMedium" style={{ color: fg }}>
              {comparison.direction === 'same'
                ? `Same as ${comparison.previousLabel}`
                : `${comparison.delta} ${comparison.direction === 'down' ? 'fewer' : 'more'} than ${comparison.previousLabel}`}
            </Text>
          </View>
        ) : (
          <Text variant="bodyLarge" style={[styles.center, { color: fg }]}>
            Next weekend we'll show how it compares.
          </Text>
        )}
      </>
    ),
  });

  cards.push({
    key: 'dinners',
    render: (fg) => (
      <>
        <Text variant="titleMedium" style={[styles.center, { color: fg }]}>Dinners you made</Text>
        <Text style={[styles.huge, { color: fg }]}>
          {recap.mealsMade}<Text style={[styles.hugeSub, { color: fg }]}> of {recap.mealsPlanned}</Text>
        </Text>
        <Text variant="bodyLarge" style={[styles.center, { color: fg }]}>
          {ateOut > 0
            ? `Plus ${ateOut} night${ateOut === 1 ? '' : 's'} out. Those count too!`
            : recap.mealsMade > 0
            ? 'Home-cooked and worth it.'
            : 'Weeks like this happen.'}
        </Text>
      </>
    ),
  });

  cards.push({
    key: 'favorites',
    render: (fg) => (
      <>
        <MaterialCommunityIcons name="heart" size={48} color={fg} />
        <Text variant="titleMedium" style={[styles.center, { color: fg }]}>This week's favorites</Text>
        {loved.length > 0 ? (
          loved.map((r) => (
            <Text key={r.plannedMealId} variant="headlineSmall" style={[styles.center, { color: fg, fontWeight: '700' }]}>
              {r.title}
            </Text>
          ))
        ) : (
          <Text variant="bodyLarge" style={[styles.center, { color: fg }]}>
            No standouts this week. Tell us what you love next time and we'll plan more of it.
          </Text>
        )}
      </>
    ),
  });

  cards.push({
    key: 'useitup',
    render: (fg) => (
      <>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={48} color={fg} />
        <Text variant="titleMedium" style={[styles.center, { color: fg }]}>Use it up next week</Text>
        {useItUp ? (
          <>
            <Text variant="headlineMedium" style={[styles.center, { color: fg, fontWeight: '700' }]}>{useItUp.name}</Text>
            <Text variant="bodyLarge" style={[styles.center, { color: fg }]}>
              If you still have some, it's your best candidate for next week's dinners.
            </Text>
            <Button mode="contained" icon="creation" onPress={() => onUseItUp(useItUp.name)}>
              Get ideas from Nummy
            </Button>
          </>
        ) : (
          <Text variant="bodyLarge" style={[styles.center, { color: fg }]}>
            Nothing is waiting to be used up. Fresh start for next week!
          </Text>
        )}
      </>
    ),
  });

  cards.push({
    key: 'dollars',
    render: (fg) => (
      <>
        <Text variant="bodyLarge" style={[styles.center, { color: fg, opacity: 0.85 }]}>
          Estimated value of food tossed
        </Text>
        <Text variant="headlineMedium" style={[styles.center, { color: fg }]}>
          {recap.wastedEstimate > 0 ? formatDollars(recap.wastedEstimate) : '$0.00'}
        </Text>
        <Text variant="bodySmall" style={[styles.center, { color: fg, opacity: 0.7 }]}>
          A rough estimate from listed prices. Items without a price count as $0.
        </Text>
      </>
    ),
  });

  cards.push({
    key: 'line',
    render: (fg) => (
      <Text variant="headlineSmall" style={[styles.center, { color: fg, fontWeight: '700', lineHeight: 36 }]}>
        {line}
      </Text>
    ),
  });

  cards.push({
    key: 'history',
    render: (fg) => (
      <>
        <Text variant="titleMedium" style={[styles.center, { color: fg }]}>Items tossed by week</Text>
        <TossedBars bars={bars} color={fg} mutedColor={fg} textColor={fg} />
        <Text variant="bodySmall" style={[styles.center, { color: fg, opacity: 0.8 }]}>
          Shorter bars are the goal. The first bar is your starting point.
        </Text>
      </>
    ),
  });

  const last = cards.length - 1;
  const current = palette[page % palette.length];

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const next = () => {
    if (page >= last) return onDone();
    scroller.current?.scrollTo({ x: (page + 1) * width, animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: current.bg }}>
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        keyboardShouldPersistTaps="handled"
      >
        {cards.map((c, i) => {
          const p = palette[i % palette.length];
          return (
            <View
              key={c.key}
              style={[styles.page, { width, backgroundColor: p.bg, paddingTop: insets.top + 72, paddingBottom: insets.bottom + 96 }]}
            >
              {c.render(p.fg)}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.top, { top: insets.top + 4 }]} pointerEvents="box-none">
        <View style={styles.dots}>
          {cards.map((c, i) => (
            <View
              key={c.key}
              style={[styles.dot, { backgroundColor: current.fg, opacity: i <= page ? 0.9 : 0.25 }]}
            />
          ))}
        </View>
        <IconButton icon="close" iconColor={current.fg} onPress={onClose} accessibilityLabel="Close recap" />
      </View>

      <View style={[styles.bottom, { bottom: insets.bottom + 16 }]}>
        <Button mode="contained" onPress={next} style={{ flex: 1 }}>
          {page >= last ? 'Done' : 'Next'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', gap: 16 },
  center: { textAlign: 'center' },
  huge: { fontSize: 96, lineHeight: 104, fontWeight: '800', textAlign: 'center' },
  hugeSub: { fontSize: 32, lineHeight: 40, fontWeight: '600' },
  compareRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  baselineInput: { width: 140, textAlign: 'center', fontSize: 28 },
  top: { position: 'absolute', left: 16, right: 4, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dots: { flex: 1, flexDirection: 'row', gap: 4 },
  dot: { flex: 1, height: 4, borderRadius: 2 },
  bottom: { position: 'absolute', left: 24, right: 24, flexDirection: 'row' },
});
