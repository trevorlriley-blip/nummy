import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../../src/hooks/useAppTheme';
import { useThemeMode, type ThemeMode } from '../../../src/contexts/ThemeContext';
import { spacing } from '../../../src/theme/spacing';

const OPTIONS: { mode: ThemeMode; label: string; description: string; icon: string }[] = [
  {
    mode: 'system',
    label: 'System Default',
    description: 'Follows your device setting',
    icon: 'cellphone-cog',
  },
  {
    mode: 'light',
    label: 'Light',
    description: 'Always use light theme',
    icon: 'white-balance-sunny',
  },
  {
    mode: 'dark',
    label: 'Dark',
    description: 'Always use dark theme',
    icon: 'moon-waning-crescent',
  },
];

export default function AppearanceScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { themeMode, setThemeMode } = useThemeMode();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.onBackground}
          />
        </Pressable>
        <Text
          variant="titleLarge"
          style={{ color: theme.colors.onBackground, fontWeight: '700', marginLeft: spacing.md }}
        >
          Appearance
        </Text>
      </View>

      {/* Theme options */}
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        mode="elevated"
      >
        <Card.Content style={{ paddingHorizontal: 0, paddingVertical: 0 }}>
          {OPTIONS.map((option, index) => (
            <React.Fragment key={option.mode}>
              <Pressable
                onPress={() => setThemeMode(option.mode)}
                style={styles.optionRow}
              >
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={22}
                  color={theme.colors.primary}
                />
                <View style={styles.optionText}>
                  <Text
                    variant="bodyLarge"
                    style={{ color: theme.colors.onSurface }}
                  >
                    {option.label}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {option.description}
                  </Text>
                </View>
                <RadioButton
                  value={option.mode}
                  status={themeMode === option.mode ? 'checked' : 'unchecked'}
                  onPress={() => setThemeMode(option.mode)}
                  color={theme.colors.primary}
                  uncheckedColor={theme.colors.outline}
                />
              </Pressable>
              {index < OPTIONS.length - 1 && (
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.outlineVariant, marginLeft: spacing.xxl + spacing.sm },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  card: {
    marginHorizontal: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  optionText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
