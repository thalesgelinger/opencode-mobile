import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
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
   const colorScheme = useColorScheme();
   const theme = colorScheme === 'dark' ? colors.dark : colors.light;
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
     <View style={[styles.container, { backgroundColor: theme.bg }]}>
       {filename && (
         <View style={[styles.header, { backgroundColor: theme.bgSecondary, borderBottomColor: theme.border }]}>
           <MaterialIcons name="insert-drive-file" size={16} color={theme.textSecondary} />
           <Text style={[styles.filename, { color: theme.text }]}>{filename}</Text>
           <Text style={[styles.lineCount, { color: theme.textSecondary }]}>{totalLines} lines</Text>
         </View>
       )}
       
       <View style={styles.codeContainer}>
         <Text style={[styles.code, { color: theme.text }]} selectable>
           {getPreviewContent()}
         </Text>
       </View>

       {needsTruncation && (
         <TouchableOpacity style={[styles.expandButton, { backgroundColor: theme.bgSecondary, borderTopColor: theme.border }]} onPress={onExpand}>
           <Text style={[styles.expandText, { color: theme.accent1 }]}>View full content</Text>
           <MaterialIcons name="expand-more" size={20} color={theme.accent1} />
         </TouchableOpacity>
       )}
     </View>
   );
};

const styles = StyleSheet.create({
   container: {
     borderRadius: 8,
     overflow: 'hidden',
   },
   header: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 8,
     paddingHorizontal: 12,
     paddingVertical: 8,
     borderBottomWidth: 1,
   },
   filename: {
     fontSize: 13,
     fontWeight: '600',
     fontFamily: 'monospace',
     flex: 1,
   },
   lineCount: {
     fontSize: 11,
     fontFamily: 'monospace',
   },
   codeContainer: {
     padding: 12,
   },
   code: {
     fontFamily: 'monospace',
     fontSize: 12,
     lineHeight: 18,
   },
   expandButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     gap: 4,
     paddingVertical: 8,
     borderTopWidth: 1,
   },
   expandText: {
     fontSize: 13,
     fontWeight: '600',
   },
});
