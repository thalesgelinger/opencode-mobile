import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  TextInput,
} from 'react-native';
import { colors } from '@/constants/colors';
import { useAppStore, Model } from '@/store/useAppStore';
import { ExpandableBottomSheet } from './ExpandableBottomSheet';

interface ModelBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

export function ModelBottomSheet({ isVisible, onClose }: ModelBottomSheetProps) {
  const colorScheme = useColorScheme() || 'light';
  const theme = colors[colorScheme];

  const models = useAppStore(s => s.models);
  const currentModel = useAppStore(s => s.currentModel);
  const setCurrentModel = useAppStore(s => s.setCurrentModel);
  const recentModels = useAppStore(s => s.recentModels);

  const [searchQuery, setSearchQuery] = useState('');

  // Filter and group models
  const { recentModelsList, groupedModels } = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    // Filter models by search query
    const filteredModels = query
      ? models.filter(m => 
          m.name.toLowerCase().includes(query) || 
          m.provider.toLowerCase().includes(query)
        )
      : models;

    // Group filtered models by provider
    const grouped: { [key: string]: Model[] } = {};
    filteredModels.forEach(model => {
      if (!grouped[model.provider]) {
        grouped[model.provider] = [];
      }
      grouped[model.provider].push(model);
    });

    // Get recent models that exist and match search
    const recents = recentModels
      .map(id => models.find(m => m.id === id))
      .filter((m): m is Model => m !== undefined && (
        !query || 
        m.name.toLowerCase().includes(query) || 
        m.provider.toLowerCase().includes(query)
      ));

    return { recentModelsList: recents, groupedModels: grouped };
  }, [models, recentModels, searchQuery]);

  const handleSelectModel = async (modelId: string) => {
    await setCurrentModel(modelId);
    onClose();
  };

  return (
    <ExpandableBottomSheet isVisible={isVisible} onClose={onClose} title="Select Model">
      <View style={styles.container}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: theme.bgSecondary, 
            color: theme.text,
            borderColor: theme.border,
          }]}
          placeholder="Search models or providers..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />

        <ScrollView style={styles.scrollView}>
          {recentModelsList.length > 0 && (
            <View style={styles.providerSection}>
              <Text style={[styles.providerTitle, { color: theme.textSecondary }]}>
                RECENT
              </Text>
              {recentModelsList.map(model => (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.modelItem,
                    { 
                      backgroundColor: theme.bgSecondary,
                      borderColor: currentModel === model.id ? theme.accent1 : theme.border,
                    }
                  ]}
                  onPress={() => handleSelectModel(model.id)}
                >
                  <View style={styles.modelContent}>
                    <Text style={[styles.modelName, { color: theme.text }]}>
                      {model.name}
                    </Text>
                    <Text style={[styles.modelProvider, { color: theme.textSecondary }]}>
                      {model.provider}
                    </Text>
                    {currentModel === model.id && (
                      <View style={[styles.selectedBadge, { backgroundColor: theme.accent1 }]}>
                        <Text style={styles.selectedText}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {Object.entries(groupedModels).map(([provider, providerModels]) => (
            <View key={provider} style={styles.providerSection}>
              <Text style={[styles.providerTitle, { color: theme.textSecondary }]}>
                {provider.toUpperCase()}
              </Text>
              {providerModels.map(model => (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.modelItem,
                    { 
                      backgroundColor: theme.bgSecondary,
                      borderColor: currentModel === model.id ? theme.accent1 : theme.border,
                    }
                  ]}
                  onPress={() => handleSelectModel(model.id)}
                >
                  <View style={styles.modelContent}>
                    <Text style={[styles.modelName, { color: theme.text }]}>
                      {model.name}
                    </Text>
                    {currentModel === model.id && (
                      <View style={[styles.selectedBadge, { backgroundColor: theme.accent1 }]}>
                        <Text style={styles.selectedText}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </ExpandableBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  providerSection: {
    marginBottom: 24,
  },
  providerTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  modelItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
  },
  modelContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  modelProvider: {
    fontSize: 13,
    fontWeight: '400',
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
