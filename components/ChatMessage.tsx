import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors } from '@/constants/colors';
import { ChatMessage as ChatMessageType } from '@/store/useAppStore';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const colorScheme = useColorScheme() || 'light';
  const theme = colors[colorScheme];

  const isUser = message.role === 'user';

  const markdownStyles = {
    body: {
      color: isUser ? theme.bg : theme.text,
      fontSize: 14,
      lineHeight: 20,
    },
    heading1: {
      color: isUser ? theme.bg : theme.text,
      fontSize: 20,
      fontWeight: '700' as const,
      marginTop: 8,
      marginBottom: 8,
    },
    heading2: {
      color: isUser ? theme.bg : theme.text,
      fontSize: 18,
      fontWeight: '600' as const,
      marginTop: 8,
      marginBottom: 6,
    },
    heading3: {
      color: isUser ? theme.bg : theme.text,
      fontSize: 16,
      fontWeight: '600' as const,
      marginTop: 6,
      marginBottom: 4,
    },
    code_inline: {
      backgroundColor: isUser ? 'rgba(0, 0, 0, 0.15)' : theme.bg,
      color: isUser ? theme.bg : theme.accent1,
      fontFamily: 'monospace',
      fontSize: 13,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 3,
    },
    code_block: {
      backgroundColor: isUser ? 'rgba(0, 0, 0, 0.15)' : theme.bg,
      color: isUser ? theme.bg : theme.text,
      fontFamily: 'monospace',
      fontSize: 13,
      padding: 8,
      borderRadius: 6,
      marginVertical: 8,
    },
    fence: {
      backgroundColor: isUser ? 'rgba(0, 0, 0, 0.15)' : theme.bg,
      color: isUser ? theme.bg : theme.text,
      fontFamily: 'monospace',
      fontSize: 13,
      padding: 8,
      borderRadius: 6,
      marginVertical: 8,
    },
    blockquote: {
      backgroundColor: isUser ? 'rgba(0, 0, 0, 0.1)' : theme.bgSecondary,
      borderLeftColor: isUser ? theme.bg : theme.accent1,
      borderLeftWidth: 3,
      paddingLeft: 8,
      marginVertical: 8,
    },
    bullet_list: {
      marginVertical: 4,
    },
    ordered_list: {
      marginVertical: 4,
    },
    list_item: {
      marginVertical: 2,
    },
    strong: {
      fontWeight: '700' as const,
      color: isUser ? theme.bg : theme.text,
    },
    em: {
      fontStyle: 'italic' as const,
      color: isUser ? theme.bg : theme.text,
    },
    link: {
      color: isUser ? theme.bg : theme.accent1,
      textDecorationLine: 'underline' as const,
    },
  };

  return (
    <View
      style={[
        styles.messageBubble,
        {
          backgroundColor: isUser ? theme.accent1 : theme.bgSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      {isUser ? (
        <Text
          style={[
            styles.messageText,
            {
              color: theme.bg,
            },
          ]}
        >
          {message.content}
        </Text>
      ) : (
        <Markdown style={markdownStyles}>
          {message.content}
        </Markdown>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  messageBubble: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
