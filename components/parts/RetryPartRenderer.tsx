import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RetryPart } from '@opencode-ai/sdk';
import ToolActionLine from '../ToolActionLine';

interface RetryPartRendererProps {
  part: RetryPart;
}

const RetryPartRenderer: React.FC<RetryPartRendererProps> = ({ part }) => {
  const { attempt, error } = part;
  const errorMsg = error?.data?.message || (typeof error === 'string' ? error : 'Unknown error');

  return (
    <View>
      <ToolActionLine
        icon="🔄"
        label={`Retry attempt ${attempt}`}
        status="error"
        onPress={() => {}}
      />
      <Text style={styles.errorText}>{errorMsg}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 12,
  },
});

export default RetryPartRenderer;
