import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  useColorScheme,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Alert,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

interface MessageInputProps {
  onSendMessage?: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export function MessageInput({ onSendMessage, isLoading = false }: MessageInputProps) {
  const colorScheme = useColorScheme() || 'light';
  const theme = colors[colorScheme];
  
  // Use direct selectors to ensure re-render on state changes
  const baseURL = useAppStore(s => s.baseURL);
  const getCurrentSession = useAppStore(s => s.getCurrentSession);
  const cycleAgent = useAppStore(s => s.cycleAgent);
  const currentAgentIndex = useAppStore(s => s.currentAgentIndex);
  const agents = useAppStore(s => s.agents);
  
  const [message, setMessage] = useState('');
  const currentAgent = agents[currentAgentIndex] || null;
  
  console.log('MessageInput render:', { agentsCount: agents.length, currentAgentIndex, currentAgent: currentAgent?.name });

  const agentColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const getAgentColor = () => {
    if (!currentAgent) return theme.accent1;
    return agentColors[currentAgentIndex % agentColors.length];
  };

  const handleCycleAgent = () => {
    cycleAgent();
  };

  const handleSend = async () => {
    if (!message.trim()) {
      return;
    }

    if (!baseURL) {
      Alert.alert('Error', 'Please set a base URL in settings first');
      return;
    }

    const session = getCurrentSession();
    if (!session) {
      Alert.alert('Error', 'Please create or select a session first');
      return;
    }

    if (onSendMessage) {
      try {
        await onSendMessage(message);
        setMessage('');
      } catch {
        Alert.alert('Error', 'Failed to send message');
      }
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
      <View style={[styles.inputContainer, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Type your message..."
          placeholderTextColor={theme.textTertiary}
          value={message}
          onChangeText={setMessage}
          onKeyPress={handleKeyPress}
          returnKeyType="send"
          multiline
          maxLength={1000}
          editable={!isLoading}
          blurOnSubmit={false}
        />
      </View>

      <View style={styles.bottomRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.agentPill, { backgroundColor: getAgentColor() }]}
          onPress={handleCycleAgent}
          disabled={isLoading}
        >
          <Text style={[styles.agentText, { color: '#ffffff' }]} numberOfLines={1}>
            {currentAgent?.name || 'No Agent'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontSize: 14,
    maxHeight: 100,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
