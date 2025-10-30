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

interface FileBottomSheetProps {
  visible: boolean;
  content: string;
  filename: string;
  onClose: () => void;
}

export function FileBottomSheet({ visible, content, filename, onClose }: FileBottomSheetProps) {
  const colorScheme = useColorScheme() || 'light';
  const theme = colors[colorScheme];
  const { height } = Dimensions.get('window');

  const handleCopy = async () => {
    await Clipboard.setStringAsync(content);
    Alert.alert('Copied', 'File content copied to clipboard');
  };

  const renderLineNumbers = () => {
    const lines = content.split('\n');
    return lines.map((_, index) => (
      <Text key={index} style={[styles.lineNumber, { color: theme.textSecondary }]}>
        {index + 1}
      </Text>
    ));
  };

  const renderContent = () => {
    return (
      <Text style={[styles.fileContent, { color: theme.text }]} selectable>
        {content}
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
              <MaterialIcons name="insert-drive-file" size={20} color={theme.accent1} />
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                {filename}
              </Text>
              <Text style={[styles.lineCount, { color: theme.textSecondary }]}>
                {content.split('\n').length} lines
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
             <View style={[styles.fileContainer, { backgroundColor: theme.bgSecondary }]}>
               <View style={[styles.lineNumbersContainer, { borderRightColor: theme.border }]}>
                {renderLineNumbers()}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={styles.contentWrapper}>
                  {renderContent()}
                </View>
              </ScrollView>
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
  fileContainer: {
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
  },
   lineNumbersContainer: {
     paddingRight: 12,
     borderRightWidth: 1,
   },
  lineNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
    textAlign: 'right',
    minWidth: 30,
  },
  contentWrapper: {
    flex: 1,
  },
  fileContent: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
