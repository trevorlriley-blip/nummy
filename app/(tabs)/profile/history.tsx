import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  IconButton,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useFeedback } from '../../../src/contexts/FeedbackContext';
import { spacing } from '../../../src/theme/spacing';
import { FeedbackSummary } from '../../../src/types/feedback';
import StarRating from '../../../src/components/common/StarRating';

export default function HistoryScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { getFeedbackSummaries } = useFeedback();

  const summaries = getFeedbackSummaries();

  const renderHistoryItem = ({ item }: { item: FeedbackSummary }) => (
    <Card
      style={[styles.historyCard, { backgroundColor: theme.colors.surface }]}
      mode="elevated"
    >
      <Card.Content style={styles.cardContent}>
        {/* Recipe Title */}
        <Text
          variant="titleSmall"
          style={{ color: theme.colors.onSurface, fontWeight: '600' }}
          numberOfLines={1}
        >
          {item.recipeTitle}
        </Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <StarRating rating={item.averageRating} size={18} />
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, marginLeft: spacing.sm }}
          >
            {item.averageRating > 0 ? item.averageRating.toFixed(1) : 'No rating'}
          </Text>
        </View>

        <Divider style={{ marginVertical: spacing.sm, backgroundColor: theme.colors.outlineVariant }} />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Times Made */}
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={18}
              color="#4CAF50"
            />
            <View style={styles.statText}>
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onSurface, fontWeight: '700' }}
              >
                {item.timesMade}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {item.timesMade === 1 ? 'time made' : 'times made'}
              </Text>
            </View>
          </View>

          {/* Times Skipped */}
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={18}
              color="#C75B39"
            />
            <View style={styles.statText}>
              <Text
                variant="titleSmall"
                style={{ color: theme.colors.onSurface, fontWeight: '700' }}
              >
                {item.timesSkipped}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {item.timesSkipped === 1 ? 'time skipped' : 'times skipped'}
              </Text>
            </View>
          </View>
        </View>

        {/* Last Made */}
        {item.lastMade && (
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.outline, marginTop: spacing.sm }}
          >
            Last made: {new Date(item.lastMade).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

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
            Meal History
          </Text>
        </View>
      </View>

      {summaries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="history"
            size={64}
            color={theme.colors.outlineVariant}
          />
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.onBackground, fontWeight: '600', marginTop: spacing.md }}
          >
            No History Yet
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.xs }}
          >
            Your meal feedback and history will appear here after you start cooking!
          </Text>
        </View>
      ) : (
        <FlatList
          data={summaries}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.recipeId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                marginBottom: spacing.sm,
                fontWeight: '500',
              }}
            >
              {summaries.length} {summaries.length === 1 ? 'recipe' : 'recipes'} in your history
            </Text>
          }
        />
      )}
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
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  historyCard: {
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  cardContent: {
    paddingVertical: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statText: {
    alignItems: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
});
