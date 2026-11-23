import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, IconButton } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { getLog, clearLog, formatLogAsText, TestLogEntry } from '../../../src/utils/testLog';
import { versionSummary } from '../../../src/utils/appVersion';
import { spacing } from '../../../src/theme/spacing';

export default function TestLogScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [entries, setEntries] = useState<TestLogEntry[]>([]);

  const load = useCallback(() => {
    getLog().then((e) => setEntries([...e].reverse()));
  }, []);

  useFocusEffect(load);

  const share = () => {
    // Oldest first reads best as a text transcript
    // Header says which build/update produced these entries
    Share.share({
      message: `${versionSummary()}\n\n${formatLogAsText([...entries].reverse())}`,
      title: 'Nummy test log',
    });
  };

  const clear = async () => {
    await clearLog();
    setEntries([]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <IconButton icon="arrow-left" onPress={() => router.back()} accessibilityLabel="Back" />
        <Text variant="titleMedium" style={{ flex: 1, color: theme.colors.onSurface, fontWeight: '700' }}>
          Test log ({entries.length})
        </Text>
        <Button compact onPress={clear} disabled={entries.length === 0}>
          Clear
        </Button>
        <Button compact mode="contained" icon="share-variant" onPress={share} disabled={entries.length === 0}>
          Share
        </Button>
      </View>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, paddingHorizontal: spacing.md, paddingTop: spacing.xs }}>
        {versionSummary()}
      </Text>
      <FlatList
        data={entries}
        keyExtractor={(e, i) => `${e.at}-${i}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: spacing.xl }}>
            No events yet.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.entry, { backgroundColor: theme.colors.surface }]}>
            <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
              {item.event}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
              {typeof item.detail === 'string' ? item.detail : JSON.stringify(item.detail)}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {new Date(item.at).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingRight: spacing.sm, gap: spacing.xs },
  list: { padding: spacing.md, gap: spacing.sm },
  entry: { borderRadius: 10, padding: spacing.sm, gap: 2 },
});
