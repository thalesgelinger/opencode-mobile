import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { SyntaxHighlighter } from './tool-renderers/SyntaxHighlighter';
import { DiffViewer } from './tool-renderers/DiffViewer';
import { parseToolContent, ParsedToolContent } from './tool-renderers/utils/parseToolContent';

interface ToolDetailsBottomSheetProps {
  visible: boolean;
  tool: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  toolJson?: any;
  error?: string;
  onClose: () => void;
}

const ToolDetailsBottomSheet: React.FC<ToolDetailsBottomSheetProps> = ({
  visible,
  tool,
  status,
  toolJson,
  error,
  onClose,
}) => {
   const snapPoints = ['50%', '100%'];
   const modalRef = useRef<BottomSheetModal>(null);
   const scrollRef = useRef<ScrollView>(null);
   const { colors: themeColors } = useTheme();
   const colorScheme = useColorScheme();
   const theme = colorScheme === 'dark' ? colors.dark : colors.light;

    useEffect(() => {
      if (visible) {
        modalRef.current?.present();
      } else {
        modalRef.current?.dismiss();
      }
    }, [visible]);

    useEffect(() => {
      // Don't reset scroll on content updates - preserve user's scroll position
      scrollRef.current?.scrollToEnd({ animated: false });
    }, []);

   const getStatusColor = (s: string) => {
     const statusColors = {
       'pending': theme.textSecondary,
       'running': theme.accent1,
       'completed': theme.success,
       'error': theme.error,
     };
     return statusColors[s as keyof typeof statusColors] || theme.textSecondary;
   };

  const parsed: ParsedToolContent = useMemo(() => {
    if (!toolJson || status !== 'completed') {
      return { type: 'unknown' };
    }
    return parseToolContent(toolJson);
  }, [toolJson, status]);

  const statusColor = getStatusColor(status);

   return (
       <BottomSheetModal
         ref={modalRef}
         snapPoints={snapPoints}
         enablePanDownToClose
         onDismiss={onClose}
         animateOnMount
         detached={false}
       >
        <BottomSheetView style={{ backgroundColor: theme.bg, flex: 1 }}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.bgSecondary }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>{tool}</Text>
            <View style={styles.headerRight}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{status.toUpperCase()}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

           {/* Content: Input & Output */}
           <ScrollView ref={scrollRef} style={styles.content} showsVerticalScrollIndicator contentContainerStyle={styles.contentContainer} scrollEventThrottle={16} scrollsToTop={false}>
           {error && status === 'error' && (
             <View style={styles.section}>
               <Text style={[styles.sectionLabel, { color: theme.text }]}>Error</Text>
               <View style={[styles.errorBox, { backgroundColor: themeColors.notification }]}>
                 <Text style={styles.errorText}>{error}</Text>
               </View>
             </View>
           )}

           {parsed.input && (
             <View style={styles.section}>
               <Text style={[styles.sectionLabel, { color: theme.text }]}>{parsed.input.label}</Text>
               <SyntaxHighlighter
                 code={parsed.input.content}
                 language={parsed.input.language || 'text'}
               />
             </View>
           )}

           {parsed.output && (
             <View style={styles.section}>
               <Text style={[styles.sectionLabel, { color: theme.text }]}>{parsed.output.label}</Text>
               {parsed.output.language === 'diff' ? (
                 <DiffViewer diff={parsed.output.content} />
               ) : (
                 <SyntaxHighlighter
                   code={parsed.output.content}
                   language={parsed.output.language || 'text'}
                 />
               )}
             </View>
           )}

            {!parsed.input && !parsed.output && !error && (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No content available</Text>
            )}
          </ScrollView>
       </BottomSheetView>
     </BottomSheetModal>
   );
};

const styles = StyleSheet.create({

   header: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     paddingHorizontal: 16,
     paddingVertical: 12,
     borderBottomWidth: 1,
   },
   headerTitle: {
     fontSize: 18,
     fontWeight: '600',
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 16,
  },
   sectionLabel: {
     fontSize: 13,
     fontWeight: '600',
     marginBottom: 8,
   },
  errorBox: {
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#fff',
    lineHeight: 18,
  },
    emptyText: {
      fontSize: 14,
      textAlign: 'center',
      marginTop: 20,
    },
   headerRight: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 12,
   },
   closeButton: {
     padding: 8,
     width: 32,
     height: 32,
     justifyContent: 'center',
     alignItems: 'center',
   },
    closeButtonText: {
      fontSize: 18,
      fontWeight: '600',
    },
   contentContainer: {
     paddingBottom: 20,
   },
});

export default ToolDetailsBottomSheet;
