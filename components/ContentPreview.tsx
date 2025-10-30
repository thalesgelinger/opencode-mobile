import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface ContentPreviewProps {
  content: string;
  filename?: string;
  maxLines?: number;
  onExpand: () => void;
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({ 
  content, 
  filename,
  maxLines = 5,
  onExpand 
}) => {
  const lines = content.split('\n');
  const totalLines = lines.length;
  const needsTruncation = totalLines > maxLines + 2;

  const getPreviewContent = () => {
    if (!needsTruncation) return content;
    
    // Show first 5 lines + last 2 lines (typical diff preview)
    const firstLines = lines.slice(0, maxLines);
    const lastLines = lines.slice(-2);
    const hiddenCount = totalLines - maxLines - 2;
    
    return [
      ...firstLines,
      `... ${hiddenCount} more lines ...`,
      ...lastLines
    ].join('\n');
  };

  return (
    <View style={styles.container}>
      {filename && (
        <View style={styles.header}>
          <MaterialIcons name="insert-drive-file" size={16} color="#666" />
          <Text style={styles.filename}>{filename}</Text>
          <Text style={styles.lineCount}>{totalLines} lines</Text>
        </View>
      )}
      
      <View style={styles.codeContainer}>
        <Text style={styles.code} selectable>
          {getPreviewContent()}
        </Text>
      </View>

      {needsTruncation && (
        <TouchableOpacity style={styles.expandButton} onPress={onExpand}>
          <Text style={styles.expandText}>View full content</Text>
          <MaterialIcons name="expand-more" size={20} color="#007AFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.bg,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.light.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  filename: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
    flex: 1,
    color: colors.light.text,
  },
  lineCount: {
    fontSize: 11,
    color: colors.light.textSecondary,
    fontFamily: 'monospace',
  },
  codeContainer: {
    padding: 12,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
    color: colors.light.text,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    backgroundColor: colors.light.bgSecondary,
  },
  expandText: {
    color: colors.light.accent1,
    fontSize: 13,
    fontWeight: '600',
  },
});
