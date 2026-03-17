import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Chip,
  Button,
  IconButton,
  RadioButton,
  Switch,
  Divider,
  TextInput,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useUser } from '../../../src/contexts/UserContext';
import { spacing } from '../../../src/theme/spacing';
import { UserPreferences, BudgetRange, CookingMethod, Allergy } from '../../../src/types/user';
import { DietaryTag, MealType } from '../../../src/types/recipe';
import {
  dietaryRestrictionOptions,
  allergyOptions,
  healthIssueOptions,
  dietaryGoalOptions,
  budgetOptions,
  mealTypeOptions,
  cookingMethodOptions,
  commonFoodAversions,
} from '../../../src/data/onboardingOptions';

export default function EditPreferencesScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { user, updatePreferences } = useUser();

  // Local state initialized from current preferences
  const [familySize, setFamilySize] = useState(user.preferences.familySize);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryTag[]>(
    [...user.preferences.dietaryRestrictions]
  );
  const [allergies, setAllergies] = useState<Allergy[]>(
    [...user.preferences.allergies]
  );
  const [healthIssues, setHealthIssues] = useState<string[]>(
    [...user.preferences.healthIssues]
  );
  const [dietaryGoals, setDietaryGoals] = useState<string[]>(
    [...user.preferences.dietaryGoals]
  );
  const [foodAversions, setFoodAversions] = useState<string[]>(
    [...user.preferences.foodAversions]
  );
  const [aversionInput, setAversionInput] = useState('');
  const [cookingMethods, setCookingMethods] = useState<CookingMethod[]>(
    [...user.preferences.cookingMethods]
  );
  const [budgetRange, setBudgetRange] = useState<BudgetRange>(
    user.preferences.budget.range
  );
  const [mealsToInclude, setMealsToInclude] = useState<MealType[]>(
    [...user.preferences.mealsToInclude]
  );
  const [includeSnacks, setIncludeSnacks] = useState(
    user.preferences.includeSnacks
  );
  const [includeDesserts, setIncludeDesserts] = useState(
    user.preferences.includeDesserts
  );

  const toggleInList = <T,>(list: T[], item: T): T[] => {
    return list.includes(item)
      ? list.filter((x) => x !== item)
      : [...list, item];
  };

  const getBudgetAmounts = (range: BudgetRange): { min: number; max: number } => {
    switch (range) {
      case 'budget-friendly':
        return { min: 50, max: 75 };
      case 'moderate':
        return { min: 75, max: 125 };
      case 'comfortable':
        return { min: 125, max: 200 };
      case 'premium':
        return { min: 200, max: 400 };
    }
  };

  const addAversion = (item?: string) => {
    const trimmed = (item ?? aversionInput).trim();
    if (trimmed && !foodAversions.includes(trimmed)) {
      setFoodAversions([...foodAversions, trimmed]);
      if (!item) setAversionInput('');
    }
  };

  const removeAversion = (aversion: string) => {
    setFoodAversions(foodAversions.filter((a) => a !== aversion));
  };

  const handleSave = () => {
    const amounts = getBudgetAmounts(budgetRange);
    const prefs: Partial<UserPreferences> = {
      familySize,
      dietaryRestrictions,
      allergies,
      healthIssues: healthIssues as any,
      dietaryGoals: dietaryGoals as any,
      foodAversions,
      cookingMethods,
      budget: {
        range: budgetRange,
        weeklyMinUSD: amounts.min,
        weeklyMaxUSD: amounts.max,
      },
      mealsToInclude,
      includeSnacks,
      includeDesserts,
    };
    updatePreferences(prefs);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerRow}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
            iconColor={theme.colors.onSurface}
          />
          <Text
            variant="titleLarge"
            style={{ color: theme.colors.onSurface, fontWeight: '700', flex: 1 }}
          >
            Edit Preferences
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Family Size */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Family Size
          </Text>
          <View style={styles.stepperRow}>
            <IconButton
              icon="minus-circle-outline"
              size={28}
              onPress={() => setFamilySize(Math.max(1, familySize - 1))}
              iconColor={theme.colors.primary}
              disabled={familySize <= 1}
            />
            <View
              style={[styles.stepperValue, { backgroundColor: theme.colors.primaryContainer }]}
            >
              <Text
                variant="headlineSmall"
                style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}
              >
                {familySize}
              </Text>
            </View>
            <IconButton
              icon="plus-circle-outline"
              size={28}
              onPress={() => setFamilySize(Math.min(12, familySize + 1))}
              iconColor={theme.colors.primary}
              disabled={familySize >= 12}
            />
          </View>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
          >
            {familySize === 1 ? '1 person' : `${familySize} people`}
          </Text>
        </View>

        <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

        {/* Dietary Restrictions */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Dietary Restrictions
          </Text>
          <View style={styles.chipGrid}>
            {dietaryRestrictionOptions.map((opt) => {
              const isSelected = dietaryRestrictions.includes(opt.value);
              return (
                <Chip
                  key={opt.value}
                  selected={isSelected}
                  onPress={() =>
                    setDietaryRestrictions(toggleInList(dietaryRestrictions, opt.value))
                  }
                  mode={isSelected ? 'flat' : 'outlined'}
                  compact
                  icon={opt.icon}
                  style={[
                    styles.selectChip,
                    isSelected && { backgroundColor: theme.colors.secondaryContainer },
                  ]}
                  textStyle={
                    isSelected
                      ? { color: theme.colors.onSecondaryContainer, fontWeight: '600' }
                      : { color: theme.colors.onSurfaceVariant }
                  }
                  showSelectedOverlay={false}
                >
                  {opt.label}
                </Chip>
              );
            })}
          </View>
        </View>

        <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

        {/* Allergies */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Food Allergies
          </Text>
          <View style={styles.chipGrid}>
            {allergyOptions.map((opt) => {
              const isSelected = allergies.includes(opt.value);
              return (
                <Chip
                  key={opt.value}
                  selected={isSelected}
                  onPress={() => {
                    if (opt.value === 'none') {
                      setAllergies(['none']);
                    } else {
                      const val = opt.value;
                      setAllergies((prev) => {
                        const without = prev.filter((x) => x !== 'none');
                        return without.includes(val)
                          ? without.filter((x) => x !== val)
                          : [...without, val];
                      });
                    }
                  }}
                  mode={isSelected ? 'flat' : 'outlined'}
                  compact
                  icon={opt.icon}
                  style={[
                    styles.selectChip,
                    isSelected && { backgroundColor: theme.colors.errorContainer },
                  ]}
                  textStyle={
                    isSelected
                      ? { color: theme.colors.onErrorContainer, fontWeight: '600' }
                      : { color: theme.colors.onSurfaceVariant }
                  }
                  showSelectedOverlay={false}
                >
                  {opt.label}
                </Chip>
              );
            })}
          </View>
        </View>

        <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

        {/* Health Issues */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Health Considerations
          </Text>
          <View style={styles.chipGrid}>
            {healthIssueOptions.map((opt) => {
              const isSelected = healthIssues.includes(opt.value);
              return (
                <Chip
                  key={opt.value}
                  selected={isSelected}
                  onPress={() =>
                    setHealthIssues(toggleInList(healthIssues, opt.value))
                  }
                  mode={isSelected ? 'flat' : 'outlined'}
                  compact
                  icon={opt.icon}
                  style={[
                    styles.selectChip,
                    isSelected && { backgroundColor: theme.colors.secondaryContainer },
                  ]}
                  textStyle={
                    isSelected
                      ? { color: theme.colors.onSecondaryContainer, fontWeight: '600' }
                      : { color: theme.colors.onSurfaceVariant }
                  }
                  showSelectedOverlay={false}
                >
                  {opt.label}
                </Chip>
              );
            })}
          </View>
        </View>

        <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

        {/* Dietary Goals */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Dietary Goals
          </Text>
          <View style={styles.chipGrid}>
            {dietaryGoalOptions.map((opt) => {
              const isSelected = dietaryGoals.includes(opt.value);
              return (
                <Chip
                  key={opt.value}
                  selected={isSelected}
                  onPress={() =>
                    setDietaryGoals(toggleInList(dietaryGoals, opt.value))
                  }
                  mode={isSelected ? 'flat' : 'outlined'}
                  compact
                  icon={opt.icon}
                  style={[
                    styles.selectChip,
                    isSelected && { backgroundColor: theme.colors.secondaryContainer },
                  ]}
                  textStyle={
                    isSelected
                      ? { color: theme.colors.onSecondaryContainer, fontWeight: '600' }
                      : { color: theme.colors.onSurfaceVariant }
                  }
                  showSelectedOverlay={false}
                >
                  {opt.label}
                </Chip>
              );
            })}
          </View>
        </View>

        <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

        {/* Food Aversions */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Food Aversions
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, marginBottom: spacing.sm }}
          >
            Tap common dislikes or add your own
          </Text>

          {/* Common aversions as toggleable chips */}
          <View style={[styles.chipGrid, { marginBottom: spacing.sm }]}>
            {commonFoodAversions.map((item) => {
              const isSelected = foodAversions.includes(item);
              return (
                <Chip
                  key={item}
                  selected={isSelected}
                  onPress={() =>
                    isSelected ? removeAversion(item) : addAversion(item)
                  }
                  mode={isSelected ? 'flat' : 'outlined'}
                  compact
                  style={[
                    styles.selectChip,
                    isSelected && { backgroundColor: theme.colors.errorContainer },
                  ]}
                  textStyle={
                    isSelected
                      ? { color: theme.colors.onErrorContainer, fontWeight: '600' }
                      : { color: theme.colors.onSurfaceVariant }
                  }
                  showSelectedOverlay={false}
                >
                  {item}
                </Chip>
              );
            })}
          </View>

          {/* Custom aversions */}
          {foodAversions.filter((a) => !commonFoodAversions.includes(a)).length > 0 && (
            <View style={[styles.chipGrid, { marginBottom: spacing.sm }]}>
              {foodAversions
                .filter((a) => !commonFoodAversions.includes(a))
                .map((aversion) => (
                  <Chip
                    key={aversion}
                    mode="flat"
                    compact
                    onClose={() => removeAversion(aversion)}
                    closeIcon="close-circle"
                    style={{ backgroundColor: theme.colors.errorContainer }}
                    textStyle={{ color: theme.colors.onErrorContainer, fontSize: 12 }}
                  >
                    {aversion}
                  </Chip>
                ))}
            </View>
          )}

          {/* Text input for custom additions */}
          <View style={styles.aversionInputRow}>
            <TextInput
              mode="outlined"
              placeholder="Add something else..."
              value={aversionInput}
              onChangeText={setAversionInput}
              onSubmitEditing={() => addAversion()}
              style={styles.aversionInput}
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.colors.primary}
              dense
            />
            <IconButton
              icon="plus-circle"
              size={28}
              onPress={() => addAversion()}
              iconColor={theme.colors.primary}
              disabled={!aversionInput.trim()}
            />
          </View>
        </View>

        <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

        {/* Cooking Methods */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Cooking Methods
          </Text>
          <View style={styles.chipGrid}>
            {cookingMethodOptions.map((opt) => {
              const isSelected = cookingMethods.includes(opt.value);
              return (
                <Chip
                  key={opt.value}
                  selected={isSelected}
                  onPress={() =>
                    setCookingMethods(toggleInList(cookingMethods, opt.value))
                  }
                  mode={isSelected ? 'flat' : 'outlined'}
                  compact
                  icon={opt.icon}
                  style={[
                    styles.selectChip,
                    isSelected && { backgroundColor: theme.colors.secondaryContainer },
                  ]}
                  textStyle={
                    isSelected
                      ? { color: theme.colors.onSecondaryContainer, fontWeight: '600' }
                      : { color: theme.colors.onSurfaceVariant }
                  }
                  showSelectedOverlay={false}
                >
                  {opt.label}
                </Chip>
              );
            })}
          </View>
        </View>

        <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

        {/* Budget Range */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Weekly Budget
          </Text>
          <RadioButton.Group
            value={budgetRange}
            onValueChange={(val) => setBudgetRange(val as BudgetRange)}
          >
            {budgetOptions.map((opt) => (
              <View key={opt.value} style={styles.radioRow}>
                <RadioButton
                  value={opt.value}
                  color={theme.colors.primary}
                  uncheckedColor={theme.colors.outline}
                />
                <View style={styles.radioLabel}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                    {opt.label}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {opt.description}
                  </Text>
                </View>
              </View>
            ))}
          </RadioButton.Group>
        </View>

        <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

        {/* Meal Selection */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
            Meals to Include
          </Text>
          {mealTypeOptions.map((opt) => {
            const isSelected = mealsToInclude.includes(opt.value);
            return (
              <View key={opt.value} style={styles.toggleRow}>
                <View style={styles.toggleLabel}>
                  <MaterialCommunityIcons
                    name={(opt.icon || 'food') as any}
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurface, marginLeft: spacing.sm }}
                  >
                    {opt.label}
                  </Text>
                </View>
                <Switch
                  value={isSelected}
                  onValueChange={() =>
                    setMealsToInclude(toggleInList(mealsToInclude, opt.value))
                  }
                  color={theme.colors.primary}
                />
              </View>
            );
          })}

          <Divider style={{ marginVertical: spacing.sm, backgroundColor: theme.colors.outlineVariant }} />

          {/* Snacks */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <MaterialCommunityIcons
                name="cookie"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurface, marginLeft: spacing.sm }}
              >
                Include Snacks
              </Text>
            </View>
            <Switch
              value={includeSnacks}
              onValueChange={setIncludeSnacks}
              color={theme.colors.primary}
            />
          </View>

          {/* Desserts */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <MaterialCommunityIcons
                name="ice-cream"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurface, marginLeft: spacing.sm }}
              >
                Include Desserts
              </Text>
            </View>
            <Switch
              value={includeDesserts}
              onValueChange={setIncludeDesserts}
              color={theme.colors.primary}
            />
          </View>
        </View>

        {/* Save Button */}
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary}
          icon="check"
        >
          Save Preferences
        </Button>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  stepperValue: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectChip: {
    borderRadius: 20,
  },
  aversionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aversionInput: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  radioLabel: {
    marginLeft: spacing.xs,
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderRadius: 12,
  },
  saveButtonContent: {
    paddingVertical: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
