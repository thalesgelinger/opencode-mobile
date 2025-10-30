import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FilePart } from '@opencode-ai/sdk';
import { FileBottomSheet } from '../FileBottomSheet';
import { ContentPreview } from '../ContentPreview';
import { readFileFromURL } from '@/services';

interface FilePartRendererProps {
  part: FilePart;
}

const FilePartRenderer: React.FC<FilePartRendererProps> = ({ part }) => {
  const { filename, mime, source, url } = part;
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExpand = async () => {
    if (!url) {
      setError('No URL available for this file');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const content = await readFileFromURL(url);
      setFileContent(content);
      setBottomSheetVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
      console.error('Failed to fetch file:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isTextFile = mime?.startsWith('text/') || 
    mime === 'application/json' || 
    mime === 'application/javascript';

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.icon}>📎</Text>
          <View style={styles.info}>
            <Text style={styles.title}>{filename || 'File'}</Text>
            <Text style={styles.meta}>Type: {mime}</Text>
            {source && 'path' in source && (
              <Text style={styles.meta}>Path: {source.path}</Text>
            )}
          </View>
        </View>
        
        {isTextFile && url && (
          <>
            <TouchableOpacity 
              style={[styles.viewButton, isLoading && styles.viewButtonDisabled]}
              onPress={handleExpand}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.viewButtonText}>View File</Text>
              )}
            </TouchableOpacity>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </>
        )}
      </View>

      <FileBottomSheet
        visible={bottomSheetVisible}
        content={fileContent}
        filename={filename || 'File'}
        onClose={() => setBottomSheetVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 8,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginVertical: 2,
  },
  viewButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    alignSelf: 'flex-start',
    minWidth: 80,
    alignItems: 'center',
  },
  viewButtonDisabled: {
    backgroundColor: '#999',
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export default FilePartRenderer;
