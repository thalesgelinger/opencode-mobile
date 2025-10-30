import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { colors } from '../constants/colors';

interface ToolDetailsBottomSheetProps {
  visible: boolean;
  tool: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  input?: any;
  output?: string;
  error?: string;
  onClose: () => void;
}

const ToolDetailsBottomSheet: React.FC<ToolDetailsBottomSheetProps> = ({
  visible,
  tool,
  status,
  input,
  output,
  error,
  onClose,
}) => {
  const snapPoints = [300, 500, 800];
  const [activeTab, setActiveTab] = useState<'input' | 'output' | 'error'>('output');
  const modalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

  const getStatusColor = (s: string) => {
    const statusColors = {
      'pending': '#94a3b8',
      'running': '#3b82f6',
      'completed': '#10b981',
      'error': '#ef4444',
    };
    return statusColors[s as keyof typeof statusColors] || colors.light.textSecondary;
  };

  const shouldShowTab = (tab: 'input' | 'output' | 'error') => {
    if (tab === 'input') return input !== undefined;
    if (tab === 'output') return output !== undefined && status === 'completed';
    if (tab === 'error') return error !== undefined && status === 'error';
    return false;
  };

  const getTabContent = () => {
    if (activeTab === 'input' && input !== undefined) {
      return typeof input === 'string' ? input : JSON.stringify(input, null, 2);
    }
    if (activeTab === 'output' && output !== undefined) {
      return output;
    }
    if (activeTab === 'error' && error !== undefined) {
      return error;
    }
    return '';
  };

  const tabColor = getStatusColor(status);

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
    >
      <BottomSheetView style={[styles.container, { backgroundColor: colors.light.bg }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{tool}</Text>
          <View style={[styles.statusBadge, { backgroundColor: tabColor }]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {shouldShowTab('input') && (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'input' && [styles.activeTab, { borderBottomColor: tabColor }],
              ]}
              onPress={() => setActiveTab('input')}
            >
              <Text style={[styles.tabText, activeTab === 'input' && { color: tabColor, fontWeight: '600' }]}>
                Input
              </Text>
            </TouchableOpacity>
          )}
          {shouldShowTab('output') && (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'output' && [styles.activeTab, { borderBottomColor: tabColor }],
              ]}
              onPress={() => setActiveTab('output')}
            >
              <Text style={[styles.tabText, activeTab === 'output' && { color: tabColor, fontWeight: '600' }]}>
                Output
              </Text>
            </TouchableOpacity>
          )}
          {shouldShowTab('error') && (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'error' && [styles.activeTab, { borderBottomColor: tabColor }],
              ]}
              onPress={() => setActiveTab('error')}
            >
              <Text style={[styles.tabText, activeTab === 'error' && { color: '#ef4444', fontWeight: '600' }]}>
                Error
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          <Text style={styles.code}>{getTabContent()}</Text>
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.bgSecondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.light.bgSecondary,
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.light.text,
    backgroundColor: colors.light.bgSecondary,
    padding: 12,
    borderRadius: 4,
    lineHeight: 18,
  },
});

export default ToolDetailsBottomSheet;
