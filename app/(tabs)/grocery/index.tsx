import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  ProgressBar,
  Button,
  IconButton,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useGroceryList } from '../../../src/contexts/GroceryListContext';
import { useMealPlan } from '../../../src/contexts/MealPlanContext';
import { WeekNavigator } from '../../../src/components/mealPlan/WeekNavigator';
import { spacing } from '../../../src/theme/spacing';
import { GrocerySection, GroceryItem } from '../../../src/types/groceryList';

export default function GroceryListScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const {
    groceryList,
    isConsolidating,
    toggleItemChecked,
    uncheckAll,
    checkedCount,
    totalCount,
  } = useGroceryList();
  const { currentPlan, goToPreviousWeek, goToNextWeek, canGoBack, canGoForward } = useMealPlan();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const toggleSection = useCallback((category: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  if (!groceryList || groceryList.sections.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="cart-outline"
            size={64}
            color={theme.colors.outlineVariant}
          />
          <Text
            variant="titleMedium"
            style={[styles.emptyTitle, { color: theme.colors.onBackground }]}
          >
            No Grocery List Yet
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
          >
            Generate a meal plan first to create your grocery list.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerRow}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
            Grocery List
          </Text>
          <Button
            mode="text"
            compact
            onPress={uncheckAll}
            textColor={theme.colors.primary}
            icon="checkbox-multiple-blank-outline"
          >
            Uncheck All
          </Button>
        </View>

        {/* Week Navigator */}
        {currentPlan && (
          <WeekNavigator
            weekStartDate={currentPlan.weekStartDate}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            style={{ marginHorizontal: 0, marginTop: 0, marginBottom: spacing.sm }}
          />
        )}

        {/* Summary Bar */}
        <View style={[styles.summaryBar, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>
            {checkedCount} / {totalCount} items
          </Text>
          <ProgressBar
            progress={progress}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
        </View>
      </View>

      {/* AI consolidation loading banner */}
      {isConsolidating && (
        <View style={[styles.consolidatingBanner, { backgroundColor: theme.colors.secondaryContainer }]}>
          <ActivityIndicator size={14} color={theme.colors.onSecondaryContainer} />
          <Text variant="labelMedium" style={{ color: theme.colors.onSecondaryContainer, marginLeft: 8 }}>
            Consolidating ingredients…
          </Text>
        </View>
      )}

      {/* Sections */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {groceryList.sections.map((section) => (
          <SectionCard
            key={section.category}
            section={section}
            collapsed={!expandedSections.has(section.category)}
            onToggleCollapse={() => toggleSection(section.category)}
            onToggleItem={toggleItemChecked}
            theme={theme}
          />
        ))}

        {/* Find Nearby Stores Button */}
        <Button
          mode="outlined"
          icon="map-marker-radius"
          onPress={() => router.push('/(tabs)/grocery/store-finder')}
          style={[styles.storeButton, { borderColor: theme.colors.primary }]}
          textColor={theme.colors.primary}
          contentStyle={styles.storeButtonContent}
        >
          Find Nearby Stores
        </Button>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface SectionCardProps {
  section: GrocerySection;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleItem: (itemId: string) => void;
  theme: ReturnType<typeof useAppTheme>;
}

function SectionCard({
  section,
  collapsed,
  onToggleCollapse,
  onToggleItem,
  theme,
}: SectionCardProps) {
  const checkedInSection = section.items.filter((i) => i.isChecked).length;

  const sectionIcon: Record<string, string> = {
    produce: 'fruit-grapes',
    dairy: 'cheese',
    meat: 'food-steak',
    seafood: 'fish',
    pantry: 'package-variant',
    spices: 'shaker-outline',
    condiments: 'bottle-soda-classic-outline',
    bakery: 'bread-slice',
    frozen: 'snowflake',
    beverages: 'cup',
    snacks: 'cookie',
    deli: 'food-variant',
    other: 'dots-horizontal',
  };

  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
      {/* Section Header */}
      <Pressable onPress={onToggleCollapse} style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <MaterialCommunityIcons
            name={(sectionIcon[section.category] || 'cart') as any}
            size={22}
            color={theme.colors.primary}
          />
          <Text
            variant="titleSmall"
            style={{ color: theme.colors.onSurface, fontWeight: '600', marginLeft: spacing.sm }}
          >
            {section.displayName}
          </Text>
          <View
            style={[styles.countBadge, { backgroundColor: theme.colors.secondaryContainer }]}
          >
            <Text variant="labelSmall" style={{ color: theme.colors.onSecondaryContainer }}>
              {checkedInSection}/{section.items.length}
            </Text>
          </View>
        </View>
        <View style={styles.sectionHeaderRight}>
          <MaterialCommunityIcons
            name={collapsed ? 'chevron-down' : 'chevron-up'}
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      </Pressable>

      {/* Items */}
      {!collapsed && (
        <View>
          <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
          {section.items.map((item, index) => (
            <GroceryItemRow
              key={item.id}
              item={item}
              onToggle={() => onToggleItem(item.id)}
              isLast={index === section.items.length - 1}
              theme={theme}
            />
          ))}
        </View>
      )}
    </View>
  );
}

interface GroceryItemRowProps {
  item: GroceryItem;
  onToggle: () => void;
  isLast: boolean;
  theme: ReturnType<typeof useAppTheme>;
}

function GroceryItemRow({ item, onToggle, isLast, theme }: GroceryItemRowProps) {
  return (
    <Pressable onPress={onToggle} style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <MaterialCommunityIcons
          name={item.isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={22}
          color={item.isChecked ? theme.colors.primary : theme.colors.outline}
        />
        <View style={styles.itemDetails}>
          <Text
            variant="bodyMedium"
            style={[
              { color: theme.colors.onSurface },
              item.isChecked && styles.checkedText,
            ]}
          >
            {item.name}
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {item.quantity}{item.unit ? ` ${item.unit}` : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryBar: {
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: 6,
  },
  progressBar: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  consolidatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: spacing.md,
  },
  sectionCard: {
    borderRadius: 12,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countBadge: {
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    paddingLeft: spacing.xs,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  storeButton: {
    marginTop: spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  storeButtonContent: {
    paddingVertical: spacing.xs,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
