import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { MaterialIcons } from '@expo/vector-icons';

interface MessageInputProps {
  onSendMessage?: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export function MessageInput({ onSendMessage, isLoading = false }: MessageInputProps) {
  const colorScheme = useColorScheme() || 'light';
  const theme = colors[colorScheme];
  const { baseURL, getCurrentSession } = useAppStore();
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
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

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, borderTopColor: theme.border }]}>
      <View style={[styles.inputContainer, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
            },
          ]}
          placeholder="Type your message..."
          placeholderTextColor={theme.textTertiary}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: theme.accent1,
              opacity: isLoading || !message.trim() ? 0.5 : 1,
            },
          ]}
          onPress={handleSend}
          disabled={isLoading || !message.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.bg} />
          ) : (
            <MaterialIcons name="send" size={20} color={theme.bg} />
          )}
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
