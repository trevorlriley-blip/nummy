import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton, TextInput, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useOrdering } from '../../../src/contexts/OrderingContext';
import { BrandPreference, BRAND_LABELS } from '../../../src/types/ordering';
import { StoreSection } from '../../../src/types/recipe';
import { STORE_SECTIONS, SECTION_DISPLAY_NAMES } from '../../../src/utils/orderList';
import { spacing } from '../../../src/theme/spacing';

export default function StaplesScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { staples, addStaple, deleteStaple, defaultBrand } = useOrdering();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [brand, setBrand] = useState<BrandPreference | undefined>(undefined);
  const [category, setCategory] = useState<StoreSection>('pantry');

  const add = () => {
    if (!name.trim()) return;
    addStaple({
      name: name.trim().toLowerCase(),
      quantity: quantity.trim() || '1',
      category,
      brandPreference: brand,
    });
    setName('');
    setQuantity('');
    setBrand(undefined);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Back" />
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
          Weekly staples
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Added to every grocery list, unless the list already has the item.
        </Text>

        <View style={[styles.form, { backgroundColor: theme.colors.surface }]}>
          <TextInput mode="outlined" dense label="Item" value={name} onChangeText={setName} autoCapitalize="none" />
          <TextInput
            mode="outlined"
            dense
            label="Default quantity (e.g. 1 gallon)"
            value={quantity}
            onChangeText={setQuantity}
          />
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Brand
          </Text>
          <View style={styles.chips}>
            <Chip compact selected={brand === undefined} onPress={() => setBrand(undefined)}>
              Default ({BRAND_LABELS[defaultBrand]})
            </Chip>
            {(Object.keys(BRAND_LABELS) as BrandPreference[]).map((b) => (
              <Chip key={b} compact selected={brand === b} onPress={() => setBrand(b)}>
                {BRAND_LABELS[b]}
              </Chip>
            ))}
          </View>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Store section
          </Text>
          <View style={styles.chips}>
            {STORE_SECTIONS.map((c) => (
              <Chip key={c} compact selected={category === c} onPress={() => setCategory(c)}>
                {SECTION_DISPLAY_NAMES[c]}
              </Chip>
            ))}
          </View>
          <Button mode="contained" onPress={add} disabled={!name.trim()}>
            Add staple
          </Button>
        </View>

        {staples.map((s) => (
          <View key={s.id} style={[styles.row, { backgroundColor: theme.colors.surface }]}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
                {s.name}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {s.quantity} · {BRAND_LABELS[s.brandPreference ?? defaultBrand]} · {SECTION_DISPLAY_NAMES[s.category]}
              </Text>
            </View>
            <IconButton icon="delete-outline" accessibilityLabel={`Remove ${s.name}`} onPress={() => deleteStaple(s.id)} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingRight: spacing.md },
  content: { padding: spacing.md, gap: spacing.sm },
  form: { borderRadius: 12, padding: spacing.md, gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingLeft: spacing.md },
});
