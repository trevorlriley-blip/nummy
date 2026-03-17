import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { useAppTheme } from '../../hooks/useAppTheme';
import { QuickReply } from '../../types/agent';
import { spacing } from '../../theme/spacing';

interface QuickReplyBarProps {
  replies: QuickReply[];
  onSelect: (message: string) => void;
  disabled?: boolean;
}

export function QuickReplyBar({ replies, onSelect, disabled }: QuickReplyBarProps) {
  const theme = useAppTheme();

  if (replies.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      style={styles.scrollView}
    >
      {replies.map((reply) => (
        <Chip
          key={reply.label}
          mode="outlined"
          onPress={() => onSelect(reply.message)}
          disabled={disabled}
          style={[styles.chip, { borderColor: theme.colors.primary }]}
          textStyle={{ color: theme.colors.primary, fontSize: 13 }}
          compact
        >
          {reply.label}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    borderRadius: 20,
  },
});
