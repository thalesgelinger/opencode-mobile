import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ReasoningPart } from '@opencode-ai/sdk';

interface ReasoningPartRendererProps {
  part: ReasoningPart;
}

const ReasoningPartRenderer: React.FC<ReasoningPartRendererProps> = ({ part }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { text } = part;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
        <Text style={styles.title}>Reasoning {isExpanded ? '[-]' : '[+]'}</Text>
      </TouchableOpacity>
      {isExpanded && <Text style={styles.reasoning}>{text}</Text>}
    </View>
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
    marginBottom: 4,
  },
  reasoning: {
    marginTop: 8,
  },
});

export default ReasoningPartRenderer;
