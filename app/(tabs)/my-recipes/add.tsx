import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Button, Chip, IconButton, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useMyRecipes } from '../../../src/contexts/MyRecipesContext';
import { useUser } from '../../../src/contexts/UserContext';
import { spacing } from '../../../src/theme/spacing';
import { Recipe, MealType, CuisineType } from '../../../src/types/recipe';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

const CUISINE_TYPES: { value: CuisineType; label: string }[] = [
  { value: 'american', label: 'American' },
  { value: 'italian', label: 'Italian' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'asian', label: 'Asian' },
  { value: 'indian', label: 'Indian' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'french', label: 'French' },
  { value: 'thai', label: 'Thai' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'korean', label: 'Korean' },
  { value: 'greek', label: 'Greek' },
  { value: 'other', label: 'Other' },
];

type Difficulty = 'easy' | 'medium' | 'hard';

interface IngredientRow { id: string; name: string; qty: string }
interface InstructionRow { id: string; text: string }

function parseQtyString(qty: string): { quantity: number; unit: string } {
  const match = qty.trim().match(/^([\d./]+)\s*(.*)/);
  if (match) return { quantity: parseFloat(match[1]) || 1, unit: match[2].trim() };
  return { quantity: 1, unit: qty.trim() };
}

export default function AddRecipeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { recipeId } = useLocalSearchParams<{ recipeId?: string }>();
  const { myRecipes, addMyRecipe, updateMyRecipe } = useMyRecipes();
  const { user } = useUser();

  const isEditing = Boolean(recipeId);
  const existing = recipeId ? myRecipes.find((r) => r.id === recipeId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [mealTypes, setMealTypes] = useState<MealType[]>(existing?.mealTypes ?? ['dinner']);
  const [cuisine, setCuisine] = useState<CuisineType>(existing?.cuisineType ?? 'other');
  const [difficulty, setDifficulty] = useState<Difficulty>(existing?.difficulty ?? 'easy');
  const [prepTime, setPrepTime] = useState(existing?.prepTimeMinutes ? String(existing.prepTimeMinutes) : '');
  const [cookTime, setCookTime] = useState(existing?.cookTimeMinutes ? String(existing.cookTimeMinutes) : '');
  const [servings, setServings] = useState(existing?.servings ? String(existing.servings) : '4');
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    existing?.ingredients.map((ing, i) => ({
      id: String(i),
      name: ing.name,
      qty: ing.unit ? `${ing.quantity} ${ing.unit}` : String(ing.quantity),
    })) ?? [{ id: '0', name: '', qty: '' }]
  );
  const [instructions, setInstructions] = useState<InstructionRow[]>(
    existing?.instructions.map((s, i) => ({ id: String(i), text: s.instruction })) ??
    [{ id: '0', text: '' }]
  );
  const [isScanning, setIsScanning] = useState(false);

  const toggleMealType = (t: MealType) =>
    setMealTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const prefillFromScan = (r: any) => {
    if (r.title) setTitle(r.title);
    if (r.description) setDescription(r.description);
    if (r.mealTypes?.length) setMealTypes(r.mealTypes);
    if (r.cuisineType) setCuisine(r.cuisineType);
    if (r.difficulty) setDifficulty(r.difficulty);
    if (r.prepTimeMinutes) setPrepTime(String(r.prepTimeMinutes));
    if (r.cookTimeMinutes) setCookTime(String(r.cookTimeMinutes));
    if (r.servings) setServings(String(r.servings));
    if (r.ingredients?.length) {
      setIngredients(r.ingredients.map((ing: any, i: number) => ({
        id: String(i),
        name: ing.name ?? '',
        qty: ing.unit ? `${ing.quantity} ${ing.unit}` : String(ing.quantity ?? ''),
      })));
    }
    if (r.instructions?.length) {
      setInstructions(r.instructions.map((s: any, i: number) => ({
        id: String(i),
        text: s.instruction ?? '',
      })));
    }
  };

  const handleScan = () => {
    Alert.alert('Scan Recipe', 'Take a photo or choose from your library', [
      {
        text: 'Take Photo',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) { Alert.alert('Camera access required'); return; }
          const result = await ImagePicker.launchCameraAsync({ quality: 0.8, base64: true });
          if (!result.canceled && result.assets[0]?.base64) {
            await doScan(result.assets[0].base64, result.assets[0].mimeType ?? 'image/jpeg');
          }
        },
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) { Alert.alert('Photo library access required'); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: true });
          if (!result.canceled && result.assets[0]?.base64) {
            await doScan(result.assets[0].base64, result.assets[0].mimeType ?? 'image/jpeg');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const doScan = async (base64: string, mimeType: string) => {
    setIsScanning(true);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL ?? ''}/api/scan-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        Alert.alert('Scan Failed', data.error || 'Could not extract a recipe. Try a clearer photo.');
        return;
      }
      prefillFromScan(data.recipe);
      Alert.alert('Recipe Scanned!', 'Review and edit the details below, then tap Save.');
    } catch {
      Alert.alert('Scan Failed', 'Could not connect. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const canSave =
    title.trim().length > 0 &&
    mealTypes.length > 0 &&
    ingredients.some((i) => i.name.trim().length > 0) &&
    instructions.some((i) => i.text.trim().length > 0);

  const handleSave = () => {
    const prepMins = parseInt(prepTime) || 0;
    const cookMins = parseInt(cookTime) || 0;
    const builtIngredients = ingredients.filter((i) => i.name.trim()).map((i, idx) => {
      const { quantity, unit } = parseQtyString(i.qty);
      return {
        id: `ing-custom-${recipeId ?? Date.now()}-${idx}`,
        name: i.name.trim(),
        quantity,
        unit: unit as Recipe['ingredients'][0]['unit'],
        category: 'other' as const,
        estimatedCostUSD: 0,
      };
    });
    const builtInstructions = instructions.filter((i) => i.text.trim()).map((i, idx) => ({
      stepNumber: idx + 1,
      instruction: i.text.trim(),
    }));

    if (isEditing && recipeId) {
      updateMyRecipe(recipeId, {
        title: title.trim(), description: description.trim(), mealTypes, cuisineType: cuisine,
        difficulty, prepTimeMinutes: prepMins, cookTimeMinutes: cookMins,
        totalTimeMinutes: prepMins + cookMins, servings: parseInt(servings) || 4,
        ingredients: builtIngredients, instructions: builtInstructions,
      });
    } else {
      addMyRecipe({
        id: `custom-${user.id || 'local'}-${Date.now()}`,
        title: title.trim(), description: description.trim(), imageUri: '',
        mealTypes, cuisineType: cuisine, difficulty, dietaryTags: [],
        prepTimeMinutes: prepMins, cookTimeMinutes: cookMins,
        totalTimeMinutes: prepMins + cookMins, servings: parseInt(servings) || 4,
        ingredients: builtIngredients, instructions: builtInstructions,
        nutrition: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 },
        estimatedCostPerServing: 0, allergens: [], createdAt: new Date().toISOString(),
      });
    }
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} iconColor={theme.colors.onSurface} />
        <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '700', flex: 1 }}>
          {isEditing ? 'Edit Recipe' : 'New Recipe'}
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Scan Banner */}
          <Pressable onPress={handleScan} disabled={isScanning}
            style={[styles.scanBanner, { backgroundColor: theme.colors.primaryContainer }]}>
            {isScanning
              ? <ActivityIndicator size="small" color={theme.colors.primary} />
              : <MaterialCommunityIcons name="camera-outline" size={22} color={theme.colors.primary} />}
            <Text variant="labelLarge" style={{ color: theme.colors.primary, marginLeft: spacing.sm, fontWeight: '700' }}>
              {isScanning ? 'Scanning…' : 'Scan a Recipe with Camera'}
            </Text>
          </Pressable>

          {/* Title */}
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Recipe Name *</Text>
          <TextInput mode="outlined" placeholder="e.g. Mom's Chicken Soup" value={title} onChangeText={setTitle} style={styles.input} />

          {/* Meal Types */}
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Meal Type *</Text>
          <View style={styles.chipRow}>
            {MEAL_TYPES.map((t) => {
              const sel = mealTypes.includes(t);
              return (
                <Chip key={t} selected={sel} onPress={() => toggleMealType(t)}
                  style={{ backgroundColor: sel ? theme.colors.primaryContainer : theme.colors.surfaceVariant }}
                  textStyle={{ color: sel ? theme.colors.primary : theme.colors.onSurfaceVariant, fontWeight: sel ? '700' : '400' }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Chip>
              );
            })}
          </View>

          {/* Description */}
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Description (optional)</Text>
          <TextInput mode="outlined" placeholder="A brief description…" value={description} onChangeText={setDescription} multiline numberOfLines={2} style={styles.input} />

          {/* Difficulty */}
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Difficulty</Text>
          <View style={[styles.chipRow, { marginBottom: spacing.md }]}>
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <Chip key={d} selected={difficulty === d} onPress={() => setDifficulty(d)}
                style={{ backgroundColor: difficulty === d ? theme.colors.primaryContainer : theme.colors.surfaceVariant }}
                textStyle={{ color: difficulty === d ? theme.colors.primary : theme.colors.onSurfaceVariant, fontWeight: difficulty === d ? '700' : '400' }}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </Chip>
            ))}
          </View>

          {/* Time & Servings */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Prep (min)</Text>
              <TextInput mode="outlined" placeholder="0" value={prepTime} onChangeText={setPrepTime} keyboardType="number-pad" style={styles.input} />
            </View>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Cook (min)</Text>
              <TextInput mode="outlined" placeholder="0" value={cookTime} onChangeText={setCookTime} keyboardType="number-pad" style={styles.input} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Servings</Text>
              <TextInput mode="outlined" placeholder="4" value={servings} onChangeText={setServings} keyboardType="number-pad" style={styles.input} />
            </View>
          </View>

          {/* Cuisine */}
          <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Cuisine</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
            <View style={styles.chipRow}>
              {CUISINE_TYPES.map((c) => (
                <Chip key={c.value} selected={cuisine === c.value} onPress={() => setCuisine(c.value)}
                  style={{ backgroundColor: cuisine === c.value ? theme.colors.primaryContainer : theme.colors.surfaceVariant }}
                  textStyle={{ color: cuisine === c.value ? theme.colors.primary : theme.colors.onSurfaceVariant, fontWeight: cuisine === c.value ? '700' : '400' }}>
                  {c.label}
                </Chip>
              ))}
            </View>
          </ScrollView>

          {/* Ingredients */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Ingredients *</Text>
          {ingredients.map((ing) => (
            <View key={ing.id} style={styles.ingredientRow}>
              <TextInput mode="outlined" placeholder="Ingredient" value={ing.name}
                onChangeText={(v) => setIngredients((p) => p.map((r) => r.id === ing.id ? { ...r, name: v } : r))}
                style={[styles.ingName]} dense />
              <TextInput mode="outlined" placeholder="Qty" value={ing.qty}
                onChangeText={(v) => setIngredients((p) => p.map((r) => r.id === ing.id ? { ...r, qty: v } : r))}
                style={styles.ingQty} dense />
              <IconButton icon="close" size={18} iconColor={theme.colors.onSurfaceVariant}
                onPress={() => setIngredients((p) => p.length > 1 ? p.filter((r) => r.id !== ing.id) : p)}
                style={styles.removeBtn} />
            </View>
          ))}
          <Button mode="outlined" icon="plus" onPress={() => setIngredients((p) => [...p, { id: String(Date.now()), name: '', qty: '' }])}
            style={styles.addRow} labelStyle={{ fontSize: 13 }} compact>Add Ingredient</Button>

          {/* Instructions */}
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground, marginTop: spacing.md }]}>Instructions *</Text>
          {instructions.map((inst, idx) => (
            <View key={inst.id} style={styles.instructionRow}>
              <View style={[styles.stepBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>{idx + 1}</Text>
              </View>
              <TextInput mode="outlined" placeholder={`Step ${idx + 1}…`} value={inst.text}
                onChangeText={(v) => setInstructions((p) => p.map((r) => r.id === inst.id ? { ...r, text: v } : r))}
                multiline style={styles.instInput} dense />
              <IconButton icon="close" size={18} iconColor={theme.colors.onSurfaceVariant}
                onPress={() => setInstructions((p) => p.length > 1 ? p.filter((r) => r.id !== inst.id) : p)}
                style={styles.removeBtn} />
            </View>
          ))}
          <Button mode="outlined" icon="plus" onPress={() => setInstructions((p) => [...p, { id: String(Date.now()), text: '' }])}
            style={styles.addRow} labelStyle={{ fontSize: 13 }} compact>Add Step</Button>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
          <Button mode="outlined" onPress={() => router.back()} style={styles.footerBtn} labelStyle={{ fontWeight: '600' }}>Cancel</Button>
          <Button mode="contained" onPress={handleSave} disabled={!canSave}
            style={[styles.footerBtn, { backgroundColor: canSave ? theme.colors.primary : undefined }]}
            labelStyle={{ fontWeight: '700' }}>
            {isEditing ? 'Save Changes' : 'Save Recipe'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingBottom: spacing.xs, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  scroll: { padding: spacing.md },
  scanBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.md, borderRadius: 12, marginBottom: spacing.lg },
  label: { marginBottom: spacing.xs, fontWeight: '600' },
  sectionTitle: { fontWeight: '700', marginBottom: spacing.sm },
  input: { backgroundColor: 'transparent', marginBottom: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  row: { flexDirection: 'row', marginBottom: spacing.md },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, gap: spacing.xs },
  ingName: { flex: 2, backgroundColor: 'transparent' },
  ingQty: { flex: 1, backgroundColor: 'transparent' },
  removeBtn: { margin: 0 },
  addRow: { borderRadius: 8, alignSelf: 'flex-start', marginBottom: spacing.sm },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs, gap: spacing.xs },
  stepBadge: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  instInput: { flex: 1, backgroundColor: 'transparent' },
  footer: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: -1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  footerBtn: { flex: 1, borderRadius: 12 },
});
