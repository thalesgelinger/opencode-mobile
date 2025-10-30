import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToolPart, ToolStateError, ToolStateCompleted, ToolStateRunning } from '@opencode-ai/sdk';
import { ContentPreview } from '../ContentPreview';
import { TextBottomSheet } from '../TextBottomSheet';
import { FileBottomSheet } from '../FileBottomSheet';
import TodoPartRenderer from './TodoPartRenderer';

interface ToolPartRendererProps {
  part: ToolPart;
}

const ToolPartRenderer: React.FC<ToolPartRendererProps> = ({ part }) => {
  const { state } = part;
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetContent, setBottomSheetContent] = useState('');
  const [bottomSheetTitle, setBottomSheetTitle] = useState('');
  const [bottomSheetType, setBottomSheetType] = useState<'text' | 'file'>('text');

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.pending;
      case 'running':
        return styles.running;
      case 'completed':
        return styles.completed;
      case 'error':
        return styles.error;
      default:
        return styles.default;
    }
  };

  const handleExpand = (content: string, title: string, type: 'text' | 'file' = 'text') => {
    setBottomSheetContent(content);
    setBottomSheetTitle(title);
    setBottomSheetType(type);
    setBottomSheetVisible(true);
  };

  const isFileReadTool = (tool: string) => {
    return tool === 'read' || tool === 'Read';
  };

  const isTodoTool = (tool: string) => {
    return tool === 'todowrite' || tool === 'todoread';
  };

  const shouldShowPreview = (content: string) => {
    return content.split('\n').length > 7;
  };

  const renderContent = () => {
    switch (state.status) {
      case 'pending':
        return <Text>Pending...</Text>;
      case 'running':
        const runningState = state as ToolStateRunning;
        return <Text style={styles.code}>{JSON.stringify(runningState.input, null, 2)}</Text>;
      case 'completed':
        const completedState = state as ToolStateCompleted;
        const output = completedState.output || '';
        const input = JSON.stringify(completedState.input, null, 2);
        
        // Handle todo tools specially
        if (isTodoTool(part.tool)) {
          try {
            const parsedInput = completedState.input as any;
            const todos = parsedInput?.todos || [];
            
            if (todos.length > 0) {
              return <TodoPartRenderer todos={todos} />;
            }
          } catch (e) {
            // Fall through to default rendering
          }
        }
        
        if (shouldShowPreview(output)) {
          const filename = isFileReadTool(part.tool) 
            ? (completedState.input as any)?.filePath?.split('/').pop() || 'Output'
            : `${part.tool} Output`;
          
          return (
            <>
              <Text style={styles.title}>Input</Text>
              <Text style={styles.code}>{input}</Text>
              <Text style={styles.title}>Output</Text>
              <ContentPreview
                content={output}
                filename={filename}
                onExpand={() => handleExpand(
                  output, 
                  filename,
                  isFileReadTool(part.tool) ? 'file' : 'text'
                )}
              />
            </>
          );
        }
        
        return (
          <>
            <Text style={styles.title}>Input</Text>
            <Text style={styles.code}>{input}</Text>
            <Text style={styles.title}>Output</Text>
            <Text style={styles.code}>{output}</Text>
          </>
        );
      case 'error':
        const errorState = state as ToolStateError;
        return (
          <>
            <Text style={styles.title}>Input</Text>
            <Text style={styles.code}>{JSON.stringify(errorState.input, null, 2)}</Text>
            <Text style={styles.title}>Error</Text>
            <Text style={[styles.code, styles.errorText]}>{errorState.error}</Text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={[styles.statusContainer, getStatusStyle(state.status)]}>
          <Text style={styles.statusText}>{part.tool} - {state.status.toUpperCase()}</Text>
        </View>
        <View style={styles.contentContainer}>{renderContent()}</View>
      </View>

      {bottomSheetType === 'file' ? (
        <FileBottomSheet
          visible={bottomSheetVisible}
          content={bottomSheetContent}
          filename={bottomSheetTitle}
          onClose={() => setBottomSheetVisible(false)}
        />
      ) : (
        <TextBottomSheet
          visible={bottomSheetVisible}
          content={bottomSheetContent}
          title={bottomSheetTitle}
          icon="terminal"
          onClose={() => setBottomSheetVisible(false)}
        />
      )}
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
  statusContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  contentContainer: {
    marginTop: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
  },
  errorText: {
    color: 'red',
  },
  pending: {
    backgroundColor: 'gray',
  },
  running: {
    backgroundColor: 'blue',
  },
  completed: {
    backgroundColor: 'green',
  },
  error: {
    backgroundColor: 'red',
  },
  default: {
    backgroundColor: 'black',
  },
});

export default ToolPartRenderer;
