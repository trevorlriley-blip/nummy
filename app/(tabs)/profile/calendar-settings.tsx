import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useCalendar } from '../../../src/contexts/CalendarContext';
import { useMealPlan } from '../../../src/contexts/MealPlanContext';
import { MealTimePicker } from '../../../src/components/calendar/MealTimePicker';
import { MealType } from '../../../src/types/recipe';
import { TimeOfDay } from '../../../src/types/calendar';
import { formatWeekRange } from '../../../src/utils/formatters';
import { spacing, borderRadius } from '../../../src/theme/spacing';

const MEAL_CONFIG: { type: MealType; label: string; icon: string }[] = [
  { type: 'breakfast', label: 'Breakfast', icon: 'weather-sunny' },
  { type: 'lunch', label: 'Lunch', icon: 'white-balance-sunny' },
  { type: 'dinner', label: 'Dinner', icon: 'weather-night' },
  { type: 'snack', label: 'Snack', icon: 'cookie' },
  { type: 'dessert', label: 'Dessert', icon: 'cupcake' },
];

function formatTime12(time: TimeOfDay): string {
  const period = time.hour >= 12 ? 'PM' : 'AM';
  let hour = time.hour % 12;
  if (hour === 0) hour = 12;
  const minute = String(time.minute).padStart(2, '0');
  return `${hour}:${minute} ${period}`;
}

export default function CalendarSettingsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const {
    mealTimeDefaults,
    updateMealTime,
    isConnected,
    connectGoogle,
    disconnectGoogle,
    syncStatus,
    syncError,
    syncPlanToCalendar,
    isSynced,
    syncHistory,
    isLoading,
  } = useCalendar();
  const { currentPlan } = useMealPlan();

  const [pickerMeal, setPickerMeal] = useState<MealType | null>(null);

  const handleSync = () => {
    if (currentPlan) {
      syncPlanToCalendar(currentPlan);
    }
  };

  const currentPlanSynced = currentPlan ? isSynced(currentPlan.id) : false;

  const totalMeals = currentPlan
    ? currentPlan.days.reduce((sum, day) => sum + day.meals.length, 0)
    : 0;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text variant="titleLarge" style={{ color: theme.colors.onSurface, fontWeight: '700' }}>
          Calendar Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Google Calendar Connection Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="google" size={24} color={theme.colors.primary} />
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface, fontWeight: '700', marginLeft: spacing.sm }}
              >
                Google Calendar
              </Text>
              <View style={{ flex: 1 }} />
              <Chip
                mode="flat"
                compact
                style={{
                  backgroundColor: isConnected
                    ? theme.colors.primaryContainer
                    : theme.colors.surfaceVariant,
                }}
                textStyle={{
                  fontSize: 12,
                  color: isConnected
                    ? theme.colors.onPrimaryContainer
                    : theme.colors.onSurfaceVariant,
                }}
              >
                {isConnected ? 'Connected' : 'Not Connected'}
              </Chip>
            </View>

            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.sm }}
            >
              {isConnected
                ? 'Your Google Calendar is connected. You can sync your meal plans as calendar events.'
                : 'Connect your Google Calendar to push meal plans as events.'}
            </Text>

            <View style={styles.connectionActions}>
              {!isConnected ? (
                <Button
                  mode="contained"
                  icon="link"
                  onPress={connectGoogle}
                  style={{ borderRadius: borderRadius.md }}
                >
                  Connect Google Calendar
                </Button>
              ) : (
                <View style={styles.connectedActions}>
                  <Button
                    mode="contained"
                    icon="sync"
                    onPress={handleSync}
                    disabled={!currentPlan || syncStatus === 'syncing'}
                    style={[styles.syncButton, { borderRadius: borderRadius.md }]}
                  >
                    {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Current Plan'}
                  </Button>
                  <Button
                    mode="outlined"
                    icon="link-off"
                    onPress={disconnectGoogle}
                    textColor={theme.colors.error}
                    style={{
                      borderColor: theme.colors.error,
                      borderRadius: borderRadius.md,
                    }}
                  >
                    Disconnect
                  </Button>
                </View>
              )}
            </View>

            {/* Current plan info */}
            {isConnected && currentPlan && (
              <View
                style={[
                  styles.planInfo,
                  { backgroundColor: theme.colors.surfaceVariant, borderRadius: borderRadius.sm },
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-week"
                  size={18}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant, marginLeft: spacing.xs, flex: 1 }}
                >
                  {formatWeekRange(currentPlan.weekStartDate)} — {totalMeals} meals
                </Text>
                {currentPlanSynced && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={18}
                    color={theme.colors.primary}
                  />
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Sync Status Banner */}
        {syncStatus === 'syncing' && (
          <View style={[styles.statusBanner, { backgroundColor: theme.colors.primaryContainer }]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onPrimaryContainer, marginLeft: spacing.sm }}
            >
              Syncing meals to your calendar...
            </Text>
          </View>
        )}

        {syncStatus === 'success' && (
          <View style={[styles.statusBanner, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name="check-circle"
              size={22}
              color={theme.colors.primary}
            />
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onPrimaryContainer, marginLeft: spacing.sm }}
            >
              Successfully synced {totalMeals} meals!
            </Text>
          </View>
        )}

        {syncStatus === 'error' && syncError && (
          <View style={[styles.statusBanner, { backgroundColor: theme.colors.errorContainer }]}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={22}
              color={theme.colors.error}
            />
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onErrorContainer, marginLeft: spacing.sm, flex: 1 }}
            >
              {syncError}
            </Text>
          </View>
        )}

        {/* Default Meal Times Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="clock-outline" size={24} color={theme.colors.primary} />
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface, fontWeight: '700', marginLeft: spacing.sm }}
              >
                Default Meal Times
              </Text>
            </View>

            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.xs, marginBottom: spacing.md }}
            >
              Set when each meal type appears on your calendar.
            </Text>

            {MEAL_CONFIG.map((meal, index) => (
              <React.Fragment key={meal.type}>
                <Pressable
                  onPress={() => setPickerMeal(meal.type)}
                  style={styles.mealTimeRow}
                >
                  <View style={styles.mealTimeLeft}>
                    <MaterialCommunityIcons
                      name={meal.icon as any}
                      size={22}
                      color={theme.colors.primary}
                    />
                    <Text
                      variant="bodyLarge"
                      style={{ color: theme.colors.onSurface, marginLeft: spacing.md }}
                    >
                      {meal.label}
                    </Text>
                  </View>
                  <View style={styles.mealTimeRight}>
                    <Text
                      variant="bodyMedium"
                      style={{ color: theme.colors.primary, fontWeight: '600' }}
                    >
                      {formatTime12(mealTimeDefaults[meal.type])}
                    </Text>
                    <MaterialCommunityIcons
                      name="clock-edit-outline"
                      size={20}
                      color={theme.colors.onSurfaceVariant}
                      style={{ marginLeft: spacing.sm }}
                    />
                  </View>
                </Pressable>
                {index < MEAL_CONFIG.length - 1 && (
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

        {/* Sync History */}
        {syncHistory.length > 0 && (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="history" size={24} color={theme.colors.primary} />
                <Text
                  variant="titleMedium"
                  style={{ color: theme.colors.onSurface, fontWeight: '700', marginLeft: spacing.sm }}
                >
                  Sync History
                </Text>
              </View>

              {syncHistory.slice(0, 5).map((record, index) => {
                const date = new Date(record.syncedAt);
                return (
                  <React.Fragment key={`${record.planId}-${record.syncedAt}`}>
                    <View style={styles.historyRow}>
                      <View>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                          {date.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {date.toLocaleTimeString(undefined, {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      <Chip
                        mode="flat"
                        compact
                        style={{ backgroundColor: theme.colors.secondaryContainer }}
                        textStyle={{ fontSize: 12, color: theme.colors.onSecondaryContainer }}
                      >
                        {record.eventIds.length} events
                      </Chip>
                    </View>
                    {index < Math.min(syncHistory.length, 5) - 1 && (
                      <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
                    )}
                  </React.Fragment>
                );
              })}
            </Card.Content>
          </Card>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Meal Time Picker Modal */}
      {pickerMeal && (
        <MealTimePicker
          visible={pickerMeal !== null}
          label={`Set ${MEAL_CONFIG.find((m) => m.type === pickerMeal)?.label ?? ''} Time`}
          value={mealTimeDefaults[pickerMeal]}
          onConfirm={(time: TimeOfDay) => {
            updateMealTime(pickerMeal, time);
            setPickerMeal(null);
          }}
          onDismiss={() => setPickerMeal(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  backButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  connectionActions: {
    marginTop: spacing.md,
  },
  connectedActions: {
    gap: spacing.sm,
  },
  syncButton: {
    flex: 1,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  mealTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  mealTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTimeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
