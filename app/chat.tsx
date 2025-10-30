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
    ActivityIndicator,
    Text,
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

  const { getCurrentSession, addMessage, baseURL, createSession, sessions, isLoadingMessages, currentSessionId, fetchSessionMessages } = useAppStore();
  const agents = useAppStore(s => s.agents);
  const currentAgentIndex = useAppStore(s => s.currentAgentIndex);
  const currentModel = useAppStore(s => s.currentModel);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const currentSession = getCurrentSession();
  const currentAgent = agents[currentAgentIndex] || null;

  // Load sessions from SDK when baseURL is set
  useEffect(() => {
    if (baseURL && sessions.length === 0) {
      useAppStore.getState().syncSessionsFromSDK();
    }
  }, [baseURL]);

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      fetchSessionMessages(currentSessionId);
    }
  }, [currentSessionId, fetchSessionMessages]);

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
            
            // Parse model string "provider/model" into object
            let modelObj;
            if (currentModel) {
                const [providerID, modelID] = currentModel.split('/');
                modelObj = { providerID, modelID };
            }

            const result = await client.session.prompt({
                path: { id: currentSession.id },
                body: {
                    parts: [{ type: "text", text: messageText }],
                    ...(currentAgent && { agent: currentAgent.name }),
                    ...(modelObj && { model: modelObj }),
                },
            });

            if (result.data) {
                const textParts = result.data.parts.filter((p: any) => p.type === 'text');
                
                const assistantMessage: ChatMessageType = {
                    id: result.data.info.id,
                    role: 'assistant',
                    content: textParts.map((p: any) => p.text).join('\n') || '',
                    parts: result.data.parts,
                    timestamp: Date.now(),
                };

                addMessage(currentSession.id, assistantMessage);

                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        } catch (error: any) {
            Alert.alert('Error', `Failed to send message: ${error.message || error}`);

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
            {isLoadingMessages ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.accent1} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                        Loading messages...
                    </Text>
                </View>
            ) : (
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
            )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        marginTop: 12,
    },
});
