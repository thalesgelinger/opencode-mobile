import React from 'react';
import { View } from 'react-native';
import { AgentPart } from '@opencode-ai/sdk';
import ToolActionLine from '../ToolActionLine';

interface AgentPartRendererProps {
  part: AgentPart;
}

const AgentPartRenderer: React.FC<AgentPartRendererProps> = ({ part }) => {
  const { name } = part;

  return (
    <View>
      <ToolActionLine
        icon="🤖"
        label={name}
        status="running"
      />
    </View>
  );
};

export default AgentPartRenderer;
