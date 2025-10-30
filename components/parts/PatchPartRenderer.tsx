import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PatchPart } from '@opencode-ai/sdk';
import { DiffBottomSheet } from '../DiffBottomSheet';
import { ContentPreview } from '../ContentPreview';

interface PatchPartRendererProps {
  part: PatchPart;
}

const PatchPartRenderer: React.FC<PatchPartRendererProps> = ({ part }) => {
  const { hash, files: patchFiles } = part;
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState('');

  const handleFilePress = (filename: string) => {
    setSelectedFile(filename);
    setBottomSheetVisible(true);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Patch ({hash.substring(0, 7)})</Text>
        {patchFiles.map((file, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => handleFilePress(file)}
            style={styles.fileSection}
          >
            <Text style={styles.file}>{file}</Text>
          </TouchableOpacity>
        ))}
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
  container: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 8,
    padding: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  fileSection: {
    marginVertical: 4,
  },
  file: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginVertical: 2,
  },
});

export default PatchPartRenderer;
