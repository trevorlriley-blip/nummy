import React, { useState, useMemo } from 'react';
import { View, Modal, Pressable, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../hooks/useAppTheme';
import { usePantry } from '../../contexts/PantryContext';
import { useRecipes } from '../../contexts/RecipeContext';
import { PantryItem } from '../../types/pantry';
import { ingredientContains } from '../../utils/pantryMatch';
import { logEvent } from '../../utils/testLog';
import { spacing } from '../../theme/spacing';

/** "Use first" card: items from the pantry snapshot that should be eaten soon. */
export function UseFirstCard() {
  const theme = useAppTheme();
  const router = useRouter();
  const { useFirstItems } = usePantry();
  const { recipes } = useRecipes();
  const [selected, setSelected] = useState<PantryItem | null>(null);

  const ideas = useMemo(() => {
    if (!selected) return [];
    return recipes
      .filter((r) => r.ingredients.some((ing) => ingredientContains(ing.name, selected.name)))
      .slice(0, 3);
  }, [recipes, selected]);

  if (useFirstItems.length === 0) return null;

  const open = (item: PantryItem) => {
    logEvent('use_it_up_opened', { item: item.name });
    setSelected(item);
  };

  const askNummy = () => {
    if (!selected) return;
    const message = `Give me 3 family dinner ideas that use up ${selected.name}.`;
    setSelected(null);
    router.push({ pathname: '/agent', params: { initialMessage: message } } as any);
  };

  const openRecipe = (id: string) => {
    setSelected(null);
    router.push(`/recipe/${id}` as any);
  };

  return (
    <>
      <View style={[styles.card, { backgroundColor: theme.colors.tertiaryContainer }]}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="fridge-alert-outline" size={20} color={theme.colors.onTertiaryContainer} />
          <Text variant="titleSmall" style={{ color: theme.colors.onTertiaryContainer, fontWeight: '600' }}>
            Use first
          </Text>
        </View>
        <View style={styles.chips}>
          {useFirstItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => open(item)}
              style={[styles.chip, { backgroundColor: theme.colors.surface }]}
              accessibilityRole="button"
              accessibilityLabel={`Ideas for ${item.name}`}
            >
              <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
                {item.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Modal transparent animationType="fade" visible={!!selected} onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          <Pressable style={[styles.sheet, { backgroundColor: theme.colors.surface }]} onPress={() => {}}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
              Use up {selected?.name}
            </Text>
            {ideas.length > 0 ? (
              ideas.map((r) => (
                <Pressable key={r.id} onPress={() => openRecipe(r.id)} style={styles.ideaRow}>
                  <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
                    {r.title}
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
                </Pressable>
              ))
            ) : (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                None of your saved recipes use this yet.
              </Text>
            )}
            <Button mode="contained" icon="chat-processing-outline" onPress={askNummy} style={styles.askButton}>
              Ideas from Nummy
            </Button>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { borderRadius: 16, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: spacing.lg },
  sheet: { borderRadius: 16, padding: spacing.md, gap: spacing.sm },
  ideaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  askButton: { marginTop: spacing.xs },
});
