import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { PatchPart } from '@opencode-ai/sdk';
import { DiffBottomSheet } from '../DiffBottomSheet';
import ToolActionLine from '../ToolActionLine';

interface PatchPartRendererProps {
  part: PatchPart;
}

const PatchPartRenderer: React.FC<PatchPartRendererProps> = ({ part }) => {
  const { hash, files: patchFiles } = part;
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilePress = (filename: string) => {
    setSelectedFile(filename);
    setBottomSheetVisible(true);
  };

  return (
    <>
      <View>
        <ToolActionLine
          icon="✏️"
          label={`Patch: ${hash.substring(0, 7)} (${patchFiles.length} files)`}
          status="completed"
          onPress={() => setIsExpanded(!isExpanded)}
        />
        
        {isExpanded && (
          <View style={styles.fileList}>
            <ScrollView>
              {patchFiles.map((file, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleFilePress(file)}
                  style={styles.fileItem}
                >
                  <Text style={styles.fileName}>{file}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <DiffBottomSheet
        visible={bottomSheetVisible}
        diff=""
        filename={selectedFile}
        onClose={() => setBottomSheetVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  fileList: {
    marginTop: 8,
    maxHeight: 200,
    paddingHorizontal: 12,
  },
  fileItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  fileName: {
    color: '#2563eb',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});

export default PatchPartRenderer;
