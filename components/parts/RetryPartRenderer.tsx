import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RetryPart } from '@opencode-ai/sdk';

interface RetryPartRendererProps {
  part: RetryPart;
}

const RetryPartRenderer: React.FC<RetryPartRendererProps> = ({ part }) => {
  const { attempt, error } = part;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔄 Retry Attempt {attempt}</Text>
      <Text style={styles.error}>{error.data.message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    marginVertical: 8,
    padding: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  error: {
    color: '#856404',
    fontSize: 14,
  },
});

export default RetryPartRenderer;
