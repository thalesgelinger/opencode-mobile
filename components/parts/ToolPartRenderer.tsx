import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToolPart, ToolStateError, ToolStateCompleted, ToolStateRunning } from '@opencode-ai/sdk';
import { ContentPreview } from '../ContentPreview';
import { TextBottomSheet } from '../TextBottomSheet';
import { FileBottomSheet } from '../FileBottomSheet';
import TodoPartRenderer from './TodoPartRenderer';
import { colors } from '../../constants/colors';

interface ToolPartRendererProps {
  part: ToolPart;
}

const ToolPartRenderer: React.FC<ToolPartRendererProps> = ({ part }) => {
  const { state } = part;
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetContent, setBottomSheetContent] = useState('');
  const [bottomSheetTitle, setBottomSheetTitle] = useState('');
  const [bottomSheetType, setBottomSheetType] = useState<'text' | 'file'>('text');

  

  const getToolColor = (tool: string) => {
    const toolColors = {
      'bash': '#4ade80',      // Green for bash
      'edit': '#3b82f6',       // Blue for edit
      'read': '#f59e0b',       // Orange for read
      'search': '#8b5cf6',     // Blue for search
      'webfetch': '#06b6d4',   // Cyan for webfetch
      'figma': '#a855f7',       // Purple for figma
      'maestro': '#ef4444',     // Red for maestro
      'wezterm': '#6b7280',    // Gray for wezterm
      'linear': '#10b981',      // Green for linear
      'shortcut': '#f59e0b',     // Orange for shortcut
      'leaf': '#22c55e',        // Red for leaf
      'playwright': '#8b5cf6',    // Blue for playwright
    };
    return toolColors[tool as keyof typeof toolColors] || colors.light.textSecondary;
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

  const isCollapsed = (content: string) => {
    return content.split('\n').length <= 3;
  };

const renderContent = () => {
    switch (state.status) {
      case 'pending':
        return <Text style={styles.statusText}>Pending...</Text>;
      case 'running':
        const runningState = state as ToolStateRunning;
        return <Text style={styles.code}>{JSON.stringify(runningState.input, null, 2)}</Text>;
      case 'completed':
        const completedState = state as ToolStateCompleted;
        const output = completedState.output || '';
        const input = JSON.stringify(completedState.input ? completedState.input : {}, null, 2);
        
        // Handle todo tools specially
        if (isTodoTool(part.tool)) {
          try {
            const parsedInput = completedState.input || {};
            const todos = Array.isArray(parsedInput?.todos) ? parsedInput.todos : [];
            
            if (todos.length > 0) {
              return <TodoPartRenderer todos={todos} />;
            }
          } catch (e) {
            // Fall through to default rendering
          }
        }
        
        if (isCollapsed(output)) {
          // Collapsed view - show simple status lines
          const lines = output.split('\n').slice(0, 3);
          const totalLines = output.split('\n').length;
          return (
            <>
              <Text style={styles.title}>Input</Text>
              <Text style={styles.code}>{input}</Text>
              <Text style={styles.title}>Output</Text>
              {lines.map((line, index) => (
                <Text key={index} style={styles.code}>{line}</Text>
              ))}
              {totalLines > 3 && (
                <Text style={styles.collapsedIndicator}>... ({totalLines - 3} more lines)</Text>
              )}
            </>
          );
        }
        
        if (shouldShowPreview(output)) {
          const filename = isFileReadTool(part.tool) 
            ? (completedState.input?.filePath && typeof completedState.input.filePath === 'string' 
              ? completedState.input.filePath.split('/').pop() || 'Output'
              : 'Output')
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
        <View style={[styles.statusContainer, { backgroundColor: getToolColor(part.tool) }]}>
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
    backgroundColor: colors.light.bg,
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
    color: colors.light.text,
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
    backgroundColor: colors.light.bgSecondary,
    padding: 8,
    borderRadius: 4,
  },
  errorText: {
    color: colors.light.error,
  },
  pending: {
    backgroundColor: colors.light.textSecondary,
  },
  running: {
    backgroundColor: colors.light.accent1,
  },
  completed: {
    backgroundColor: colors.light.success,
  },
  error: {
    backgroundColor: colors.light.error,
  },
  default: {
    backgroundColor: colors.light.text,
  },
  collapsedIndicator: {
    color: colors.light.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default ToolPartRenderer;
