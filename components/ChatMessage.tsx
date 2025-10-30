import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors } from '@/constants/colors';
import { ChatMessage as ChatMessageType } from '@/store/useAppStore';
import { CodeBottomSheet } from './CodeBottomSheet';
import ToolPartRenderer from './parts/ToolPartRenderer';
import PatchPartRenderer from './parts/PatchPartRenderer';
import ReasoningPartRenderer from './parts/ReasoningPartRenderer';
import FilePartRenderer from './parts/FilePartRenderer';
import AgentPartRenderer from './parts/AgentPartRenderer';
import RetryPartRenderer from './parts/RetryPartRenderer';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const colorScheme = useColorScheme() || 'light';
  const theme = colors[colorScheme];
  const [codeModal, setCodeModal] = useState<{ visible: boolean; code: string; language: string }>({
    visible: false,
    code: '',
    language: 'text',
  });

  const isUser = message.role === 'user';

  const handleCodePress = (code: string, language: string) => {
    setCodeModal({ visible: true, code, language });
  };

  const handleCloseCodeModal = () => {
    setCodeModal({ visible: false, code: '', language: 'text' });
  };

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

  const renderParts = () => {
    if (!message.parts || message.parts.length === 0) {
      return null;
    }

    return message.parts.map((part, index) => {
      const key = `${message.id}-${part.type}-${index}`;
      
      switch (part.type) {
        case 'text':
          // Already rendered in content
          return null;
        
        case 'tool':
          return <ToolPartRenderer key={key} part={part} />;
        
        case 'patch':
          return <PatchPartRenderer key={key} part={part} />;
        
        case 'reasoning':
          return <ReasoningPartRenderer key={key} part={part} />;
        
        case 'file':
          return <FilePartRenderer key={key} part={part} />;
        
        case 'agent':
          return <AgentPartRenderer key={key} part={part} />;
        
        case 'retry':
          return <RetryPartRenderer key={key} part={part} />;
        
        case 'step-start':
        case 'step-finish':
        case 'snapshot':
          // Ignore these parts
          return null;
        
        default:
          // Fallback for unknown types
          return (
            <View
              key={key}
              style={[styles.unknownPart, { backgroundColor: theme.bg, borderColor: theme.border }]}
            >
              <Text style={[styles.unknownPartText, { color: theme.textSecondary }]}>
                Unknown part type: {(part as any).type}
              </Text>
            </View>
          );
      }
    });
  };

  return (
    <>
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
          <>
            {message.content && (
              <Markdown style={markdownStyles}>
                {message.content}
              </Markdown>
            )}
            {renderParts()}
          </>
        )}
      </View>
      
      <CodeBottomSheet
        visible={codeModal.visible}
        code={codeModal.code}
        language={codeModal.language}
        onClose={handleCloseCodeModal}
      />
    </>
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
  unknownPart: {
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 4,
  },
  unknownPartText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
