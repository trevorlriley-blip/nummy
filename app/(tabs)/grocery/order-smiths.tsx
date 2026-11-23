import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Chip, IconButton, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useGroceryList } from '../../../src/contexts/GroceryListContext';
import { useOrdering } from '../../../src/contexts/OrderingContext';
import { BrandPreference, BRAND_LABELS } from '../../../src/types/ordering';
import { GroceryItem } from '../../../src/types/groceryList';
import { formatOrderText, resolveBrandPref, smithsSearchUrl } from '../../../src/utils/orderList';
import { spacing } from '../../../src/theme/spacing';

const NEXT_BRAND: Record<BrandPreference, BrandPreference> = { store: 'name', name: 'ask', ask: 'store' };

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}

export default function OrderSmithsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { groceryList, haveItCount } = useGroceryList();
  const {
    ready, requests, defaultBrand, brandOverrides, setBrandOverride,
    orderStartedAt, orderChecked, toggleOrderChecked, startOrderIfNeeded, completeOrder,
  } = useOrdering();

  const sections = (groceryList?.sections ?? [])
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.haveIt) }))
    .filter((s) => s.items.length > 0);
  const needed = sections.flatMap((s) => s.items);
  const checkedCount = needed.filter((i) => orderChecked[i.id]).length;
  const stapleCount = needed.filter((i) => i.source === 'staple').length;
  const requestCount = needed.filter((i) => i.source === 'request').length;

  const brandFor = (item: GroceryItem) => resolveBrandPref(item, brandOverrides, defaultBrand);

  // Start the timer on first open. It is wall-clock based, so it keeps running while the
  // in-app browser is open (or the app is backgrounded) and resumes on return.
  useEffect(() => {
    if (ready && groceryList) {
      startOrderIfNeeded({ items: needed.length, staples: stapleCount, requests: requestCount });
    }
  }, [ready, !!groceryList]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const elapsed = orderStartedAt ? now - Date.parse(orderStartedAt) : 0;

  const findAtSmiths = async (item: GroceryItem) => {
    try {
      await WebBrowser.openBrowserAsync(smithsSearchUrl(item.name, brandFor(item)));
    } catch {
      Alert.alert("Couldn't open Smith's", 'Please try again.');
    }
  };

  const shareList = () => {
    if (!groceryList) return;
    Share.share({ message: formatOrderText(groceryList, brandFor), title: "Smith's order" });
  };

  const finish = () => {
    const orderedRequestIds = requests.filter((r) => orderChecked[`req-${r.id}`]).map((r) => r.id);
    const done = () => {
      completeOrder(
        {
          items: needed.length,
          itemsChecked: checkedCount,
          itemsSkippedHaveIt: haveItCount,
          staples: stapleCount,
          requests: requestCount,
        },
        orderedRequestIds
      );
      router.back();
    };
    const remaining = needed.length - checkedCount;
    if (remaining > 0) {
      Alert.alert('Finish ordering?', `${remaining} item${remaining === 1 ? '' : 's'} not checked off yet.`, [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Done ordering', onPress: done },
      ]);
    } else {
      done();
    }
  };

  if (!groceryList || needed.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
            Nothing to order yet.
          </Text>
          <Button onPress={() => router.back()}>Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerTop}>
          <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Back" />
          <Text variant="titleMedium" style={{ flex: 1, color: theme.colors.onSurface, fontWeight: '700' }}>
            Order at Smith's
          </Text>
          <View style={[styles.timer, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="timer-outline" size={16} color={theme.colors.onPrimaryContainer} />
            <Text variant="labelLarge" style={{ color: theme.colors.onPrimaryContainer }}>
              {formatElapsed(elapsed)}
            </Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
            {checkedCount} of {needed.length} items
          </Text>
          {haveItCount > 0 && (
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {haveItCount} already have
            </Text>
          )}
        </View>
        <ProgressBar progress={needed.length ? checkedCount / needed.length : 0} style={styles.bar} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {sections.map((section) => (
          <View key={section.category} style={styles.section}>
            <Text variant="titleSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
              {section.displayName}
            </Text>
            {section.items.map((item) => {
              const checked = !!orderChecked[item.id];
              const pref = brandFor(item);
              return (
                <View key={item.id} style={[styles.row, { backgroundColor: theme.colors.surface }]}>
                  <Pressable
                    onPress={() => toggleOrderChecked(item.id)}
                    style={styles.rowMain}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                  >
                    <MaterialCommunityIcons
                      name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={24}
                      color={checked ? theme.colors.primary : theme.colors.outline}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        variant="bodyLarge"
                        style={[{ color: theme.colors.onSurface }, checked && styles.checkedText]}
                      >
                        {item.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {item.quantity}{item.unit ? ` ${item.unit}` : ''}
                      </Text>
                    </View>
                  </Pressable>
                  <View style={styles.chips}>
                    <Chip compact onPress={() => setBrandOverride(item.name, NEXT_BRAND[pref])}>
                      {BRAND_LABELS[pref]}
                    </Chip>
                    {item.tags?.map((t) => (
                      <Chip key={t} compact mode="outlined">
                        {t}
                      </Chip>
                    ))}
                    <Button compact mode="text" icon="open-in-new" onPress={() => findAtSmiths(item)}>
                      Find at Smith's
                    </Button>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <Button mode="outlined" icon="share-variant" onPress={shareList} style={{ flex: 1 }}>
          Share list
        </Button>
        <Button mode="contained" icon="check" onPress={finish} style={{ flex: 1 }}>
          Done ordering
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  header: { paddingBottom: spacing.sm, gap: spacing.xs },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingRight: spacing.md },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  bar: { marginHorizontal: spacing.md, height: 7, borderRadius: 4 },
  content: { padding: spacing.md, gap: spacing.md },
  section: { gap: spacing.xs },
  row: { borderRadius: 12, padding: spacing.sm, gap: spacing.xs },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs, paddingLeft: 32 },
  checkedText: { textDecorationLine: 'line-through', opacity: 0.5 },
  footer: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
});
