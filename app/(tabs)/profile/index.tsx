import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  Chip,
  Button,
  Divider,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useUser } from '../../../src/contexts/UserContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useOnboarding } from '../../../src/contexts/OnboardingContext';
import { spacing } from '../../../src/theme/spacing';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { user, resetProfile, updatePreferences } = useUser();
  const { signOut } = useAuth();
  const { resetOnboarding } = useOnboarding();
  const { preferences } = user;

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const budgetLabels: Record<string, string> = {
    'budget-friendly': 'Budget Friendly ($50-$75/wk)',
    moderate: 'Moderate ($75-$125/wk)',
    comfortable: 'Comfortable ($125-$200/wk)',
    premium: 'Premium ($200+/wk)',
  };

  const dietaryLabel = (tag: string): string => {
    return tag
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('-');
  };

  const mealLabel = (meal: string): string => {
    return meal.charAt(0).toUpperCase() + meal.slice(1);
  };

  const navigationItems = [
    {
      icon: 'pencil-outline' as const,
      label: 'Edit Preferences',
      route: '/(tabs)/profile/edit-preferences',
    },
    {
      icon: 'palette-outline' as const,
      label: 'Appearance',
      route: '/(tabs)/profile/appearance',
    },
    {
      icon: 'calendar-sync' as const,
      label: 'Calendar Sync',
      route: '/(tabs)/profile/calendar-settings',
    },
    {
      icon: 'heart-outline' as const,
      label: 'Favorites',
      route: '/(tabs)/profile/favorites',
    },
    {
      icon: 'history' as const,
      label: 'Meal History',
      route: '/(tabs)/profile/history',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.colors.surface }]}>
          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <Text
              variant="headlineMedium"
              style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}
            >
              {getInitials(user.displayName)}
            </Text>
          </View>

          <Text
            variant="headlineSmall"
            style={{ color: theme.colors.onSurface, fontWeight: '700', marginTop: spacing.md }}
          >
            {user.displayName}
          </Text>

          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.xs }}
          >
            {user.email}
          </Text>
        </View>

        {/* Your Preferences Card */}
        <Card
          style={[styles.preferencesCard, { backgroundColor: theme.colors.surface }]}
          mode="elevated"
        >
          <Card.Content>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onSurface, fontWeight: '700', marginBottom: spacing.md }}
            >
              Your Preferences
            </Text>

            {/* Family Size */}
            <View style={styles.prefRow}>
              <View style={styles.prefLabel}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, marginLeft: spacing.sm }}
                >
                  Family Size
                </Text>
              </View>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurface, fontWeight: '600' }}
              >
                {preferences.familySize} {preferences.familySize === 1 ? 'person' : 'people'}
              </Text>
            </View>

            <Divider style={{ marginVertical: spacing.sm, backgroundColor: theme.colors.outlineVariant }} />

            {/* Dietary Restrictions */}
            <View style={styles.prefSection}>
              <View style={styles.prefLabel}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, marginLeft: spacing.sm }}
                >
                  Dietary Restrictions
                </Text>
              </View>
              <View style={styles.chipRow}>
                {preferences.dietaryRestrictions.length > 0 ? (
                  preferences.dietaryRestrictions.map((tag) => (
                    <Chip
                      key={tag}
                      mode="flat"
                      compact
                      style={{ backgroundColor: theme.colors.secondaryContainer }}
                      textStyle={{
                        fontSize: 12,
                        color: theme.colors.onSecondaryContainer,
                      }}
                    >
                      {dietaryLabel(tag)}
                    </Chip>
                  ))
                ) : (
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    None set
                  </Text>
                )}
              </View>
            </View>

            <Divider style={{ marginVertical: spacing.sm, backgroundColor: theme.colors.outlineVariant }} />

            {/* Allergies */}
            <View style={styles.prefSection}>
              <View style={styles.prefLabel}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={20}
                  color={theme.colors.error}
                />
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, marginLeft: spacing.sm }}
                >
                  Allergies
                </Text>
              </View>
              <View style={styles.chipRow}>
                {preferences.allergies.length > 0 && !preferences.allergies.includes('none') ? (
                  preferences.allergies.map((allergy) => (
                    <Chip
                      key={allergy}
                      mode="flat"
                      compact
                      style={{ backgroundColor: theme.colors.errorContainer }}
                      textStyle={{
                        fontSize: 12,
                        color: theme.colors.onErrorContainer,
                      }}
                    >
                      {dietaryLabel(allergy)}
                    </Chip>
                  ))
                ) : (
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    None
                  </Text>
                )}
              </View>
            </View>

            <Divider style={{ marginVertical: spacing.sm, backgroundColor: theme.colors.outlineVariant }} />

            {/* Cooking Methods */}
            <View style={styles.prefSection}>
              <View style={styles.prefLabel}>
                <MaterialCommunityIcons
                  name="stove"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, marginLeft: spacing.sm }}
                >
                  Cooking Methods
                </Text>
              </View>
              <View style={styles.chipRow}>
                {preferences.cookingMethods.length > 0 ? (
                  preferences.cookingMethods.map((method) => (
                    <Chip
                      key={method}
                      mode="flat"
                      compact
                      style={{ backgroundColor: theme.colors.secondaryContainer }}
                      textStyle={{
                        fontSize: 12,
                        color: theme.colors.onSecondaryContainer,
                      }}
                    >
                      {dietaryLabel(method)}
                    </Chip>
                  ))
                ) : (
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    None set
                  </Text>
                )}
              </View>
            </View>

            <Divider style={{ marginVertical: spacing.sm, backgroundColor: theme.colors.outlineVariant }} />

            {/* Budget */}
            <View style={styles.prefRow}>
              <View style={styles.prefLabel}>
                <MaterialCommunityIcons
                  name="cash"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, marginLeft: spacing.sm }}
                >
                  Budget
                </Text>
              </View>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurface, fontWeight: '600' }}
              >
                {budgetLabels[preferences.budget.range] || preferences.budget.range}
              </Text>
            </View>

            <Divider style={{ marginVertical: spacing.sm, backgroundColor: theme.colors.outlineVariant }} />

            {/* Meals Included */}
            <View style={styles.prefSection}>
              <View style={styles.prefLabel}>
                <MaterialCommunityIcons
                  name="silverware-fork-knife"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, marginLeft: spacing.sm }}
                >
                  Meals Included
                </Text>
              </View>
              <View style={styles.chipRow}>
                {preferences.mealsToInclude.map((meal) => (
                  <Chip
                    key={meal}
                    mode="flat"
                    compact
                    style={{ backgroundColor: theme.colors.tertiaryContainer }}
                    textStyle={{
                      fontSize: 12,
                      color: theme.colors.onTertiaryContainer,
                    }}
                  >
                    {mealLabel(meal)}
                  </Chip>
                ))}
                {preferences.includeSnacks && (
                  <Chip
                    mode="flat"
                    compact
                    style={{ backgroundColor: theme.colors.tertiaryContainer }}
                    textStyle={{
                      fontSize: 12,
                      color: theme.colors.onTertiaryContainer,
                    }}
                  >
                    Snacks
                  </Chip>
                )}
                {preferences.includeDesserts && (
                  <Chip
                    mode="flat"
                    compact
                    style={{ backgroundColor: theme.colors.tertiaryContainer }}
                    textStyle={{
                      fontSize: 12,
                      color: theme.colors.onTertiaryContainer,
                    }}
                  >
                    Desserts
                  </Chip>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Navigation Rows */}
        <Card
          style={[styles.navCard, { backgroundColor: theme.colors.surface }]}
          mode="elevated"
        >
          <Card.Content style={{ paddingHorizontal: 0, paddingVertical: 0 }}>
            {navigationItems.map((item, index) => (
              <React.Fragment key={item.route}>
                <Pressable
                  onPress={() => router.push(item.route as any)}
                  style={styles.navRow}
                >
                  <View style={styles.navRowLeft}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={22}
                      color={theme.colors.primary}
                    />
                    <Text
                      variant="bodyLarge"
                      style={{ color: theme.colors.onSurface, marginLeft: spacing.md }}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={theme.colors.onSurfaceVariant}
                  />
                </Pressable>
                {index < navigationItems.length - 1 && (
                  <Divider
                    style={{
                      backgroundColor: theme.colors.outlineVariant,
                      marginLeft: spacing.xxl + spacing.sm,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>

        {/* Reset Onboarding */}
        <Button
          mode="outlined"
          icon="refresh"
          onPress={() => { resetOnboarding(); resetProfile(); }}
          style={[styles.resetButton, { borderColor: theme.colors.error }]}
          textColor={theme.colors.error}
          contentStyle={styles.resetButtonContent}
        >
          Reset Onboarding
        </Button>

        {/* Sign Out */}
        <Button
          mode="outlined"
          icon="logout"
          onPress={signOut}
          style={[styles.signOutButton, { borderColor: theme.colors.outline }]}
          textColor={theme.colors.onSurfaceVariant}
          contentStyle={styles.resetButtonContent}
        >
          Sign Out
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
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preferencesCard: {
    margin: spacing.md,
    borderRadius: 12,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefSection: {
    gap: spacing.sm,
  },
  prefLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginLeft: 28,
  },
  navCard: {
    marginHorizontal: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  signOutButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  resetButtonContent: {
    paddingVertical: spacing.xs,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
