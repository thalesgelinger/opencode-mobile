import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { colors } from '@/constants/colors';
import { useAppStore, ChatMessage as ChatMessageType } from '@/store/useAppStore';
import { ChatMessage } from '@/components/ChatMessage';
import { MessageInput } from '@/components/MessageInput';
import { MaterialIcons } from '@expo/vector-icons';
import { getOpencodeClient } from '@/services';

type DrawerNavigation = DrawerNavigationProp<any>;

export default function ChatScreen() {
  const colorScheme = useColorScheme() || 'light';
  const theme = colors[colorScheme];
  const navigation = useNavigation<DrawerNavigation>();

  const { getCurrentSession, addMessage, baseURL, createSession, sessions } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const currentSession = getCurrentSession();

  // Load sessions from SDK when baseURL is set
  useEffect(() => {
    if (baseURL && sessions.length === 0) {
      useAppStore.getState().syncSessionsFromSDK();
    }
  }, [baseURL]);

  // Set up header with hamburger menu
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.openDrawer();
          }}
          style={{ marginLeft: 16 }}
        >
          <MaterialIcons name="menu" size={28} color={theme.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme.text]);

  const handleSendMessage = async (messageText: string) => {
    if (!currentSession) {
      Alert.alert('Error', 'No session selected');
      return;
    }

    if (!baseURL) {
      Alert.alert('Error', 'Please configure base URL in settings');
      return;
    }

    // Add user message to state
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    addMessage(currentSession.id, userMessage);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    setIsLoading(true);

    try {
      const client = getOpencodeClient();
      
      const result = await client.session.prompt({
        path: { id: currentSession.id },
        body: {
          model: { 
            providerID: "anthropic", 
            modelID: "claude-3-5-sonnet-20241022" 
          },
          parts: [{ type: "text", text: messageText }],
        },
      });

      if (result.data) {
        const assistantMessage: ChatMessageType = {
          id: result.data.info.id,
          role: 'assistant',
          content: result.data.parts
            .filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join('\n') || 'No response received',
          timestamp: Date.now(),
        };

        addMessage(currentSession.id, assistantMessage);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to send message: ${error}`);

      // Add error message to chat
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };

      addMessage(currentSession.id, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentSession) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.emptyState}>
          <MaterialIcons name="chat" size={64} color={theme.textSecondary} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={currentSession.messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessage message={item} />}
        contentContainerStyle={styles.messageList}
        scrollEnabled={true}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="chat-bubble-outline" size={64} color={theme.textSecondary} />
          </View>
        }
      />
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
});
