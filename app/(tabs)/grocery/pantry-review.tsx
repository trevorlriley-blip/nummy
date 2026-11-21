import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { usePantry } from '../../../src/contexts/PantryContext';
import { useGroceryList } from '../../../src/contexts/GroceryListContext';
import { PantryItem } from '../../../src/types/pantry';
import { logEvent } from '../../../src/utils/testLog';
import { spacing } from '../../../src/theme/spacing';

const FRESHNESS_LABEL: Record<PantryItem['freshness'], string> = {
  fresh: 'Fresh',
  'use-soon': 'Use soon',
  past: 'Past its best',
};

export default function PantryReviewScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { draft, discardDraft, saveSnapshot } = usePantry();
  const { applyPantryMatch } = useGroceryList();

  const [items, setItems] = useState<PantryItem[]>(draft?.items ?? []);
  const [useFirst, setUseFirst] = useState<string[]>(draft?.useFirst ?? []);
  const [newName, setNewName] = useState('');

  if (!draft) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.empty}>
          <Text variant="bodyLarge">Nothing to review.</Text>
          <Button onPress={() => router.back()}>Back</Button>
        </View>
      </SafeAreaView>
    );
  }

  const rename = (id: string, name: string) => {
    const old = items.find((i) => i.id === id)?.name;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, name } : i)));
    if (old !== undefined) {
      setUseFirst((prev) => prev.map((n) => (n === old ? name.trim().toLowerCase() : n)));
    }
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const add = () => {
    const name = newName.trim().toLowerCase();
    if (!name) return;
    setItems((prev) => [
      ...prev,
      {
        id: `pantry-item-${Date.now()}-added`,
        name,
        category: 'other',
        quantityEstimate: '',
        freshness: 'fresh',
        confidence: 1,
      },
    ]);
    setNewName('');
  };

  const cancel = () => {
    discardDraft();
    router.back();
  };

  const save = () => {
    const cleaned = items
      .map((i) => ({ ...i, name: i.name.trim().toLowerCase() }))
      .filter((i) => i.name.length > 0);

    const originalById = new Map(draft.original.map((i) => [i.id, i]));
    const added = cleaned.filter((i) => !originalById.has(i.id)).length;
    const removed = draft.original.filter((o) => !items.some((i) => i.id === o.id)).length;
    const renamed = cleaned.filter((i) => {
      const o = originalById.get(i.id);
      return o && o.name !== i.name;
    }).length;
    logEvent('snapshot_edited', { itemsAdded: added, itemsRemoved: removed, itemsRenamed: renamed });

    const names = new Set(cleaned.map((i) => i.name));
    saveSnapshot(cleaned, useFirst.filter((n) => names.has(n)));

    const matched = applyPantryMatch(cleaned.map((i) => i.name));
    logEvent('list_matched', { count: matched });

    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
            Review your pantry
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Fix names, remove mistakes, add anything we missed.
          </Text>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.addRow}>
            <TextInput
              mode="outlined"
              dense
              placeholder="Add an item"
              value={newName}
              onChangeText={setNewName}
              onSubmitEditing={add}
              returnKeyType="done"
              autoCapitalize="none"
              style={styles.flex}
            />
            <Button mode="contained-tonal" onPress={add} disabled={!newName.trim()}>
              Add
            </Button>
          </View>

          {items.map((item) => (
            <View key={item.id} style={[styles.row, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.flex}>
                <TextInput
                  mode="flat"
                  dense
                  value={item.name}
                  onChangeText={(t) => rename(item.id, t)}
                  autoCapitalize="none"
                  underlineColor="transparent"
                  style={styles.nameInput}
                />
                <View style={styles.meta}>
                  {item.freshness !== 'fresh' && (
                    <MaterialCommunityIcons
                      name="clock-alert-outline"
                      size={14}
                      color={item.freshness === 'past' ? theme.colors.error : theme.colors.tertiary}
                    />
                  )}
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {[item.quantityEstimate, item.freshness !== 'fresh' ? FRESHNESS_LABEL[item.freshness] : '']
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
              </View>
              <IconButton
                icon="delete-outline"
                accessibilityLabel={`Remove ${item.name}`}
                onPress={() => remove(item.id)}
              />
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
          <Button mode="outlined" onPress={cancel} style={styles.flex}>
            Cancel
          </Button>
          <Button mode="contained" onPress={save} style={styles.flex} disabled={items.length === 0}>
            Save {items.length} items
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  header: { padding: spacing.md, gap: 2 },
  content: { padding: spacing.md, gap: spacing.sm },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingLeft: spacing.sm },
  nameInput: { backgroundColor: 'transparent', paddingHorizontal: 0 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.xs },
  footer: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
});
