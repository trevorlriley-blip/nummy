import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ChipSelector } from '../common/ChipSelector';
import { spacing } from '../../theme/spacing';

const BLEND_OPTIONS = [
  { value: 'all-new', label: 'All New' },
  { value: 'mostly-new', label: 'Mostly New' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'mostly-familiar', label: 'Mostly Familiar' },
  { value: 'all-familiar', label: 'All Familiar' },
];

const BLEND_VALUES: Record<string, number> = {
  'all-new': 0,
  'mostly-new': 25,
  'balanced': 50,
  'mostly-familiar': 75,
  'all-familiar': 100,
};

export function blendValueToOption(value: number): string {
  const entry = Object.entries(BLEND_VALUES).find(([, v]) => v === value);
  return entry ? entry[0] : 'balanced';
}

interface RecipeBlendStepProps {
  blend: number;
  onChange: (value: number) => void;
}

export function RecipeBlendStep({ blend, onChange }: RecipeBlendStepProps) {
  const theme = useAppTheme();
  const selectedOption = blendValueToOption(blend);

  const handleToggle = (value: string) => {
    onChange(BLEND_VALUES[value] ?? 50);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
        This week's recipe mix
      </Text>
      <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        How much should we draw from recipes you already know?
      </Text>

      <ChipSelector
        options={BLEND_OPTIONS}
        selected={[selectedOption]}
        onToggle={handleToggle}
      />

      <Text variant="bodySmall" style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>
        Familiar = your saved recipes + recipes you've cooked and liked
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  note: {
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
});
