import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAppTheme } from '../../hooks/useAppTheme';
import { CleanOutCandidate, CleanOutSource, tossedCost } from '../../utils/recap';
import { TossedItem } from '../../types/recap';
import { spacing } from '../../theme/spacing';

interface Props {
  source: CleanOutSource;
  onDone: (tossed: TossedItem[]) => void;
  onClose: () => void;
}

/** Step 1: tap whatever got tossed this week. */
export function CleanOutStep({ source, onDone, onClose }: Props) {
  const theme = useAppTheme();
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState<{ id: string; name: string; typed: string }[]>([]);
  const [draft, setDraft] = useState('');

  const toggle = (key: string) =>
    setPicked((p) => {
      const next = { ...p };
      if (key in next) delete next[key];
      else next[key] = '';
      return next;
    });

  const addExtra = () => {
    const name = draft.trim();
    if (!name) return;
    setExtras((e) => [...e, { id: `x-${Date.now()}`, name, typed: '' }]);
    setDraft('');
  };

  const finish = () => {
    const items: TossedItem[] = [];
    for (const c of source.candidates) {
      if (!(c.key in picked)) continue;
      const typed = picked[c.key].trim();
      items.push({ name: c.name, quantity: typed || undefined, cost: tossedCost(c, typed) });
    }
    for (const x of extras) items.push({ name: x.name, quantity: x.typed.trim() || undefined, cost: 0 });
    onDone(items);
  };

  const count = Object.keys(picked).length + extras.length;
  const subtitle =
    source.from === 'order'
      ? "From your latest Smith's order, plus anything flagged use-soon."
      : source.from === 'list'
      ? "From this week's grocery list, plus anything flagged use-soon."
      : 'No food list found for this week, so add anything that got tossed.';

  const renderRow = (c: Pick<CleanOutCandidate, 'key' | 'name' | 'label'>) => {
    const on = c.key in picked;
    return (
      <View key={c.key} style={[styles.row, { backgroundColor: on ? theme.colors.primaryContainer : theme.colors.surface }]}>
        <Pressable onPress={() => toggle(c.key)} style={styles.rowMain} accessibilityRole="checkbox" accessibilityState={{ checked: on }}>
          <MaterialCommunityIcons
            name={on ? 'check-circle' : 'circle-outline'}
            size={24}
            color={on ? theme.colors.primary : theme.colors.outline}
          />
          <View style={{ flex: 1 }}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{c.name}</Text>
            {!!c.label && <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{c.label}</Text>}
          </View>
        </Pressable>
        {on && (
          <TextInput
            dense
            mode="outlined"
            label="How much? (optional)"
            value={picked[c.key]}
            onChangeText={(t) => setPicked((p) => ({ ...p, [c.key]: t }))}
          />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.headerRow}>
        <IconButton icon="close" onPress={onClose} accessibilityLabel="Close recap" />
        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>Step 1 of 3</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
          Did anything get tossed?
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{subtitle}</Text>

        {source.candidates.map(renderRow)}
        {extras.map((x) => (
          <View key={x.id} style={[styles.row, { backgroundColor: theme.colors.primaryContainer }]}>
            <View style={styles.rowMain}>
              <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.primary} />
              <Text variant="bodyLarge" style={{ flex: 1, color: theme.colors.onSurface }}>{x.name}</Text>
              <IconButton icon="close" size={18} onPress={() => setExtras((e) => e.filter((y) => y.id !== x.id))} />
            </View>
            <TextInput
              dense
              mode="outlined"
              label="How much? (optional)"
              value={x.typed}
              onChangeText={(t) => setExtras((e) => e.map((y) => (y.id === x.id ? { ...y, typed: t } : y)))}
            />
          </View>
        ))}

        <View style={styles.addRow}>
          <TextInput
            dense
            mode="outlined"
            style={{ flex: 1 }}
            label="Add something that isn't listed"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={addExtra}
            returnKeyType="done"
          />
          <Button mode="contained-tonal" onPress={addExtra} disabled={!draft.trim()}>Add</Button>
        </View>
      </ScrollView>
      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <Button mode="contained" onPress={finish} style={{ flex: 1 }}>
          {count > 0 ? `Nothing else (${count} tossed)` : 'Nothing was tossed'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: spacing.md },
  content: { padding: spacing.md, gap: spacing.sm },
  row: { borderRadius: 12, padding: spacing.sm, gap: spacing.xs },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  footer: { flexDirection: 'row', padding: spacing.md },
});
