import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ChipSelector } from '../common/ChipSelector';
import { REQUEST_TAG_OPTIONS } from '../../data/wizardOptions';
import { spacing, borderRadius } from '../../theme/spacing';

interface SpecialRequestsStepProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  customPrompt: string;
  onCustomPromptChange: (text: string) => void;
}

export function SpecialRequestsStep({
  selectedTags,
  onToggleTag,
  customPrompt,
  onCustomPromptChange,
}: SpecialRequestsStepProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
        Any special requests?
      </Text>
      <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Pick themes or type your own preferences.
      </Text>

      <ChipSelector
        options={REQUEST_TAG_OPTIONS}
        selected={selectedTags}
        onToggle={onToggleTag}
      />

      <TextInput
        mode="outlined"
        label="Anything else? (optional)"
        placeholder="e.g., Use chicken thighs, no recipes over 45 min..."
        value={customPrompt}
        onChangeText={onCustomPromptChange}
        multiline
        numberOfLines={3}
        style={styles.textInput}
        outlineStyle={{ borderRadius: borderRadius.md }}
      />
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
  textInput: {
    marginTop: spacing.lg,
  },
});
