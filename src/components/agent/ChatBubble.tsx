import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ChatMessage } from '../../types/agent';
import { spacing } from '../../theme/spacing';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const theme = useAppTheme();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? theme.colors.primary : theme.colors.surfaceVariant,
            borderBottomRightRadius: isUser ? 4 : 16,
            borderBottomLeftRadius: isUser ? 16 : 4,
          },
        ]}
      >
        <Text
          variant="bodyMedium"
          style={{ color: isUser ? theme.colors.onPrimary : theme.colors.onSurface }}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export function TypingIndicator() {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.bubble,
          styles.typingBubble,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
      >
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {'Thinking...'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: 16,
  },
  typingBubble: {
    borderBottomLeftRadius: 4,
  },
});
