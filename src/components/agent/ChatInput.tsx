import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';
import { useAppTheme } from '../../hooks/useAppTheme';
import { spacing } from '../../theme/spacing';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const theme = useAppTheme();
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
      <TextInput
        mode="outlined"
        placeholder="Type a message..."
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSend}
        disabled={disabled}
        style={styles.input}
        outlineStyle={styles.inputOutline}
        dense
        returnKeyType="send"
      />
      <IconButton
        icon="send"
        iconColor={theme.colors.onPrimary}
        containerColor={theme.colors.primary}
        size={20}
        onPress={handleSend}
        disabled={disabled || !text.trim()}
        style={styles.sendButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    marginRight: spacing.sm,
  },
  inputOutline: {
    borderRadius: 20,
  },
  sendButton: {
    margin: 0,
  },
});
