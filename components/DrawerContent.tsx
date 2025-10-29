import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  useColorScheme,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';
import { MaterialIcons } from '@expo/vector-icons';
import { getOpencodeClient } from '@/services';

interface DrawerContentProps {
  navigation: any;
}

export function DrawerContent({ navigation }: DrawerContentProps) {
  const colorScheme = useColorScheme() || 'light';
  const theme = colors[colorScheme];
  const { baseURL, setBaseURL, isBaseURLValid, sessions, setCurrentSessionId, deleteSession } =
    useAppStore();

  const [isEditingURL, setIsEditingURL] = useState(!baseURL);
  const [urlInput, setUrlInput] = useState(baseURL);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSaveURL = async () => {
    if (!urlInput.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    if (!isBaseURLValid(urlInput)) {
      Alert.alert('Invalid URL', 'Please enter a valid URL format (e.g., https://api.example.com)');
      return;
    }

    setIsConnecting(true);
    try {
      await setBaseURL(urlInput);
      setIsEditingURL(false);
      Alert.alert('Success', 'Connected and sessions loaded');
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleNewSession = async () => {
    if (!baseURL) {
      Alert.alert('Error', 'Please configure base URL first');
      return;
    }
    
    try {
      const client = getOpencodeClient();
      
      const result = await client.session.create({
        body: { title: `Chat ${new Date().toLocaleTimeString()}` }
      });
      
      if (result.data) {
        // Refresh sessions from SDK
        await useAppStore.getState().syncSessionsFromSDK();
        setCurrentSessionId(result.data.id);
        navigation.closeDrawer();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create session');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Settings Section */}
      <View style={[styles.settingsSection, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => setIsEditingURL(!isEditingURL)}
        >
          <MaterialIcons name="settings" size={24} color={theme.text} />
          <Text style={[styles.settingText, { color: theme.text }]}>Settings</Text>
        </TouchableOpacity>

        {isEditingURL && (
          <View style={[styles.urlInputContainer, { backgroundColor: theme.bgSecondary, borderColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Base URL</Text>
            <TextInput
              style={[
                styles.urlInput,
                {
                  backgroundColor: theme.bg,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="https://api.example.com"
              placeholderTextColor={theme.textTertiary}
              value={urlInput}
              onChangeText={setUrlInput}
            />
            <View style={styles.urlButtonGroup}>
              <TouchableOpacity
                style={[styles.urlButton, { backgroundColor: theme.accent1, opacity: isConnecting ? 0.5 : 1 }]}
                onPress={handleSaveURL}
                disabled={isConnecting}
              >
                <Text style={[styles.urlButtonText, { color: theme.bg }]}>
                  {isConnecting ? 'Connecting...' : 'Save'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.urlButton, { backgroundColor: theme.accent2 }]}
                onPress={() => {
                  setIsEditingURL(false);
                  setUrlInput(baseURL);
                }}
                disabled={isConnecting}
              >
                <Text style={[styles.urlButtonText, { color: theme.bg }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {baseURL && !isEditingURL && (
          <View style={[styles.baseURLDisplay, { backgroundColor: theme.bgSecondary }]}>
            <Text style={[styles.baseURLLabel, { color: theme.textSecondary }]}>Current URL:</Text>
            <Text style={[styles.baseURLValue, { color: theme.text }]} numberOfLines={1}>
              {baseURL}
            </Text>
          </View>
        )}
      </View>

      {/* Sessions Section */}
      <View style={styles.sessionsSection}>
        <View style={[styles.sessionHeader, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sessionTitle, { color: theme.text }]}>Sessions</Text>
          <TouchableOpacity
            style={[styles.newSessionButton, { backgroundColor: theme.accent1 }]}
            onPress={handleNewSession}
          >
            <MaterialIcons name="add" size={20} color={theme.bg} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          scrollEnabled={true}
          style={styles.sessionList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.sessionItem, { borderBottomColor: theme.border }]}
              onPress={() => {
                setCurrentSessionId(item.id);
                navigation.closeDrawer();
              }}
            >
              <View style={styles.sessionItemContent}>
                <Text style={[styles.sessionItemTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.sessionItemMeta, { color: theme.textSecondary }]}>
                  {item.messages.length} messages
                </Text>
              </View>
              <TouchableOpacity
                onPress={async () => {
                  Alert.alert(
                    'Delete Session',
                    'Are you sure you want to delete this session?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        onPress: async () => {
                          try {
                            const client = getOpencodeClient();
                            await client.session.delete({ path: { id: item.id } });
                            await useAppStore.getState().syncSessionsFromSDK();
                          } catch (error) {
                            Alert.alert('Error', 'Failed to delete session');
                          }
                        },
                        style: 'destructive',
                      },
                    ]
                  );
                }}
              >
                <MaterialIcons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  urlInputContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  urlInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  urlButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  urlButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  urlButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  baseURLDisplay: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  baseURLLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  baseURLValue: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  sessionsSection: {
    flex: 1,
    paddingTop: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  newSessionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionList: {
    flex: 1,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sessionItemContent: {
    flex: 1,
  },
  sessionItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  sessionItemMeta: {
    fontSize: 12,
  },
});
