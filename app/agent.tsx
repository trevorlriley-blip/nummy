import React, { useRef, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../src/hooks/useAppTheme';
import { useAgent } from '../src/contexts/AgentContext';
import { ChatBubble, TypingIndicator } from '../src/components/agent/ChatBubble';
import { QuickReplyBar } from '../src/components/agent/QuickReplyBar';
import { ChatInput } from '../src/components/agent/ChatInput';
import { spacing } from '../src/theme/spacing';
import type { ChatMessage } from '../src/types/agent';

export default function AgentScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { messages, isLoading, quickReplies, sendMessage, resetChat } = useAgent();
  const flatListRef = useRef<FlatList>(null);

  // Reset chat when screen mounts
  useEffect(() => {
    resetChat();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isLoading]);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />,
    []
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
          <Pressable onPress={handleClose} hitSlop={12}>
            <MaterialCommunityIcons name="close" size={24} color={theme.colors.onBackground} />
          </Pressable>
          <Text
            style={[
              styles.headerTitle,
              { color: theme.colors.onBackground },
            ]}
          >
            Plan Your Week
          </Text>
          <View style={styles.headerRight} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={[styles.messageList, messages.length === 0 && styles.messageListEmpty]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="chef-hat"
                size={48}
                color={theme.colors.primary}
                style={styles.emptyIcon}
              />
              <Text style={[styles.emptyTitle, { color: theme.colors.onBackground }]}>
                Ready to plan your meals!
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                Tell me what you're in the mood for, or tap a suggestion below to get started.
              </Text>
            </View>
          }
          ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        />

        {/* Quick replies */}
        <QuickReplyBar
          replies={quickReplies}
          onSelect={handleSend}
          disabled={isLoading}
        />

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    width: 24,
  },
  messageList: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  messageListEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
