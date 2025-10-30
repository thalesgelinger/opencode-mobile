import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AgentPart } from '@opencode-ai/sdk';

interface AgentPartRendererProps {
  part: AgentPart;
}

const AgentPartRenderer: React.FC<AgentPartRendererProps> = ({ part }) => {
  const { name, source } = part;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤖 Agent: {name}</Text>
      {source && (
        <Text style={styles.source}>{source.value}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    marginVertical: 8,
    padding: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  source: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default AgentPartRenderer;
