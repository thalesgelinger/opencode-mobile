import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ReasoningPart } from '@opencode-ai/sdk';
import ToolActionLine from '../ToolActionLine';

interface ReasoningPartRendererProps {
  part: ReasoningPart;
}

const ReasoningPartRenderer: React.FC<ReasoningPartRendererProps> = ({ part }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { text } = part;

  return (
    <View>
      <ToolActionLine
        icon="💭"
        label="Reasoning"
        status="completed"
        onPress={() => setIsExpanded(!isExpanded)}
      />
      
      {isExpanded && (
        <ScrollView style={styles.content}>
          <Text style={styles.text}>{text}</Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    marginTop: 8,
    maxHeight: 300,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
});

export default ReasoningPartRenderer;
