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
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

interface DiffBottomSheetProps {
  visible: boolean;
  diff: string;
  filename: string;
  onClose: () => void;
}

export function DiffBottomSheet({ visible, diff, filename, onClose }: DiffBottomSheetProps) {
  const colorScheme = useColorScheme() || 'light';
  const theme = colors[colorScheme];
  const { height } = Dimensions.get('window');

  const handleCopy = async () => {
    await Clipboard.setStringAsync(diff);
    Alert.alert('Copied', 'Diff copied to clipboard');
  };

   const renderDiffLine = (line: string, index: number) => {
     let lineStyle = styles.diffNormal;
     let textColor = theme.text;
     
     if (line.startsWith('+')) {
       lineStyle = styles.diffAdd;
       textColor = theme.success;
     } else if (line.startsWith('-')) {
       lineStyle = styles.diffRemove;
       textColor = theme.error;
     } else if (line.startsWith('@@')) {
       lineStyle = styles.diffHunk;
       textColor = theme.accent1;
     }

    return (
      <Text 
        key={index} 
        style={[styles.diffLine, lineStyle, { color: textColor }]}
      >
        {line}
      </Text>
    );
  };

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
              <MaterialIcons name="difference" size={20} color={theme.accent1} />
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                {filename}
              </Text>
              <Text style={[styles.lineCount, { color: theme.textSecondary }]}>
                {diff.split('\n').length} lines
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleCopy} style={styles.iconButton}>
                <MaterialIcons name="content-copy" size={20} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                <MaterialIcons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={[styles.diffContainer, { backgroundColor: theme.bgSecondary }]}>
                {diff.split('\n').map(renderDiffLine)}
              </View>
            </ScrollView>
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
    flex: 1,
  },
  headerRight: {
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
  iconButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  diffContainer: {
    borderRadius: 8,
    padding: 12,
  },
  diffLine: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  diffNormal: {
    opacity: 0.7,
  },
  diffAdd: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    opacity: 1,
  },
  diffRemove: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    opacity: 1,
  },
  diffHunk: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    fontWeight: '600',
    opacity: 1,
  },
});
