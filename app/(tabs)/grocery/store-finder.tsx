import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  Chip,
  IconButton,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { sampleStores } from '../../../src/data/stores';
import { spacing } from '../../../src/theme/spacing';
import { StoreLocation } from '../../../src/types/store';

export default function StoreFinderScreen() {
  const theme = useAppTheme();
  const router = useRouter();

  const openDirections = (store: StoreLocation) => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `maps:?daddr=${store.latitude},${store.longitude}`,
      android: `geo:${store.latitude},${store.longitude}?q=${encodeURIComponent(store.address)}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  const getPriceLevelLabel = (level?: 1 | 2 | 3): string => {
    switch (level) {
      case 1:
        return '$';
      case 2:
        return '$$';
      case 3:
        return '$$$';
      default:
        return '--';
    }
  };

  const getPriceLevelColor = (level?: 1 | 2 | 3): string => {
    switch (level) {
      case 1:
        return '#4CAF50';
      case 2:
        return '#D4A017';
      case 3:
        return '#C75B39';
      default:
        return theme.colors.onSurfaceVariant;
    }
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
            Nearby Stores
          </Text>
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={[styles.mapPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons
          name="map-marker-radius-outline"
          size={48}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.sm, textAlign: 'center' }}
        >
          Map view available in development build
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.outline, marginTop: spacing.xs, textAlign: 'center' }}
        >
          Install react-native-maps in a dev build to see the interactive map
        </Text>
      </View>

      {/* Store List */}
      <ScrollView
        style={styles.storeList}
        contentContainerStyle={styles.storeListContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          variant="titleSmall"
          style={{
            color: theme.colors.onSurfaceVariant,
            marginBottom: spacing.sm,
            fontWeight: '600',
          }}
        >
          {sampleStores.length} stores found nearby
        </Text>

        {sampleStores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            theme={theme}
            onDirections={() => openDirections(store)}
            getPriceLevelLabel={getPriceLevelLabel}
            getPriceLevelColor={getPriceLevelColor}
          />
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface StoreCardProps {
  store: StoreLocation;
  theme: ReturnType<typeof useAppTheme>;
  onDirections: () => void;
  getPriceLevelLabel: (level?: 1 | 2 | 3) => string;
  getPriceLevelColor: (level?: 1 | 2 | 3) => string;
}

function StoreCard({
  store,
  theme,
  onDirections,
  getPriceLevelLabel,
  getPriceLevelColor,
}: StoreCardProps) {
  return (
    <Card style={[styles.storeCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
      <Card.Content style={styles.storeCardContent}>
        {/* Top Row: Name + Status */}
        <View style={styles.storeTopRow}>
          <View style={styles.storeNameContainer}>
            <MaterialCommunityIcons
              name="store"
              size={22}
              color={theme.colors.primary}
            />
            <Text
              variant="titleSmall"
              style={{ color: theme.colors.onSurface, fontWeight: '600', marginLeft: spacing.sm, flex: 1 }}
              numberOfLines={1}
            >
              {store.name}
            </Text>
          </View>
          <Chip
            mode="flat"
            compact
            style={{
              backgroundColor: store.openNow ? '#E8F5E9' : '#FDECEA',
            }}
            textStyle={{
              color: store.openNow ? '#2E7D32' : '#C62828',
              fontSize: 11,
              fontWeight: '600',
            }}
          >
            {store.openNow ? 'Open' : 'Closed'}
          </Chip>
        </View>

        {/* Address */}
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: spacing.xs, marginLeft: 30 }}
          numberOfLines={2}
        >
          {store.address}
        </Text>

        {/* Info Row: Distance, Price, Rating */}
        <View style={styles.storeInfoRow}>
          {/* Distance */}
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="map-marker-distance"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginLeft: spacing.xs, fontWeight: '500' }}
            >
              {store.distanceMiles.toFixed(1)} mi
            </Text>
          </View>

          {/* Price Level */}
          <View style={styles.infoItem}>
            <Text
              variant="bodySmall"
              style={{
                color: getPriceLevelColor(store.priceLevel),
                fontWeight: '700',
                fontSize: 14,
              }}
            >
              {getPriceLevelLabel(store.priceLevel)}
            </Text>
          </View>

          {/* Rating */}
          {store.rating && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="star"
                size={16}
                color="#D4A017"
              />
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant, marginLeft: 2, fontWeight: '500' }}
              >
                {store.rating.toFixed(1)}
              </Text>
            </View>
          )}

          {/* Store type */}
          <Chip
            mode="outlined"
            compact
            style={styles.storeTypeChip}
            textStyle={{ fontSize: 10, color: theme.colors.onSurfaceVariant }}
          >
            {store.storeType}
          </Chip>
        </View>

        <Divider style={{ marginVertical: spacing.sm, backgroundColor: theme.colors.outlineVariant }} />

        {/* Action Row */}
        <View style={styles.actionRow}>
          {store.phoneNumber && (
            <Chip
              mode="flat"
              compact
              icon="phone"
              onPress={() =>
                Linking.openURL(`tel:${store.phoneNumber}`).catch(() => {})
              }
              style={{ backgroundColor: theme.colors.surfaceVariant }}
              textStyle={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}
            >
              {store.phoneNumber}
            </Chip>
          )}
          <Chip
            mode="flat"
            compact
            icon="directions"
            onPress={onDirections}
            style={{ backgroundColor: theme.colors.primaryContainer }}
            textStyle={{ fontSize: 12, color: theme.colors.onPrimaryContainer, fontWeight: '600' }}
          >
            Directions
          </Chip>
        </View>
      </Card.Content>
    </Card>
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
  mapPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.md,
    borderRadius: 16,
  },
  storeList: {
    flex: 1,
  },
  storeListContent: {
    paddingHorizontal: spacing.md,
  },
  storeCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
  },
  storeCardContent: {
    paddingVertical: spacing.sm,
  },
  storeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginLeft: 30,
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeTypeChip: {
    height: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
