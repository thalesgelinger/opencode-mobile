import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { FilePart } from '@opencode-ai/sdk';
import { FileBottomSheet } from '../FileBottomSheet';
import ToolActionLine from '../ToolActionLine';
import { readFileFromURL } from '@/services';

interface FilePartRendererProps {
  part: FilePart;
}

const FilePartRenderer: React.FC<FilePartRendererProps> = ({ part }) => {
  const { filename, mime, url } = part;
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExpand = async () => {
    if (!url) return;

    setIsLoading(true);
    try {
      const content = await readFileFromURL(url);
      setFileContent(content);
      setBottomSheetVisible(true);
    } catch (err) {
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
      <View>
        {isLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          <ToolActionLine
            icon="📎"
            label={filename || 'File'}
            status={isTextFile && url ? 'completed' : 'pending'}
            onPress={isTextFile && url ? handleExpand : undefined}
          />
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

export default FilePartRenderer;
