import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface CodeBottomSheetProps {
  visible: boolean;
  code: string;
  language: string;
  onClose: () => void;
}

export function CodeBottomSheet({ visible, code, language, onClose }: CodeBottomSheetProps) {
  const colorScheme = useColorScheme() || 'light';
  const theme = colors[colorScheme];
  const { height } = Dimensions.get('window');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <View style={{ height: height * 0.3 }} />
        </TouchableOpacity>
        
        <View style={[styles.sheet, { backgroundColor: theme.bg }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerLeft}>
              <MaterialIcons name="code" size={20} color={theme.accent1} />
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                {language}
              </Text>
              <Text style={[styles.lineCount, { color: theme.textSecondary }]}>
                {code.split('\n').length} lines
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            <View style={[styles.codeContainer, { backgroundColor: theme.bgSecondary }]}>
              <Text style={[styles.codeText, { color: theme.text }]} selectable>
                {code}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  lineCount: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  codeContainer: {
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
