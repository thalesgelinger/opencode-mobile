import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ToolPart, ToolStateError, ToolStateCompleted } from '@opencode-ai/sdk';
import ToolActionLine from '../ToolActionLine';
import ToolDetailsBottomSheet from '../ToolDetailsBottomSheet';
import TodoPartRenderer from './TodoPartRenderer';

interface ToolPartRendererProps {
    part: ToolPart;
}

const ToolPartRenderer: React.FC<ToolPartRendererProps> = ({ part }) => {
    const { state } = part;
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

    const isTodoTool = (tool: string) => {
        return tool === 'todowrite' || tool === 'todoread';
    };

    const getToolLabel = (): string => {
        const inputData = (state as any).input ?? {};
        
        switch (part.tool.toLowerCase()) {
            case 'read':
                const filePath = inputData?.filePath;
                return `Read ${filePath ? filePath.split('/').pop() : 'file'}`;
            case 'edit':
                const editPath = inputData?.filePath;
                return `Edit ${editPath ? editPath.split('/').pop() : 'file'}`;
            case 'write':
                const writePath = inputData?.filePath;
                return `Write ${writePath ? writePath.split('/').pop() : 'file'}`;
            case 'bash':
                const cmd = inputData?.command || inputData?.description;
                const cmdStr = typeof cmd === 'string' ? cmd : '';
                return `Bash: ${cmdStr.slice(0, 30)}${cmdStr.length > 30 ? '...' : ''}`;
            case 'grep':
                const pattern = inputData?.pattern || '';
                return `Grep: ${pattern}`;
            case 'glob':
                const globPattern = inputData?.pattern || '';
                return `Glob: ${globPattern}`;
            case 'webfetch':
                const url = inputData?.url || '';
                try {
                    const domain = new URL(url).hostname;
                    return `Fetch: ${domain}`;
                } catch {
                    return `Fetch: ${url.slice(0, 20)}`;
                }
            default:
                return `${part.tool}`;
        }
    };

    const getToolIcon = (): string => {
        switch (part.tool.toLowerCase()) {
            case 'read': return '📖';
            case 'edit': return '✏️';
            case 'write': return '✍️';
            case 'bash': return '💻';
            case 'grep': return '🔍';
            case 'glob': return '📁';
            case 'webfetch': return '🌐';
            default: return '🔧';
        }
    };

    const renderContent = () => {
        // Handle todo tools specially
        if (isTodoTool(part.tool) && state.status === 'completed') {
            try {
                const inputData = (state as ToolStateCompleted).input;
                const todos = Array.isArray(inputData?.todos) ? inputData.todos : [];
                if (todos.length > 0) {
                    return <TodoPartRenderer todos={todos} />;
                }
            } catch {
                // Fall through
            }
        }

        // Collapsed view for all tools
        return (
            <ToolActionLine
                icon={getToolIcon()}
                label={getToolLabel()}
                status={state.status as 'pending' | 'running' | 'completed' | 'error'}
                onPress={() => setBottomSheetVisible(true)}
            />
        );
    };

    // Get details for bottom sheet
    const getBottomSheetProps = () => {
        const completedState = state as ToolStateCompleted;
        const errorState = state as ToolStateError;

        let errorMsg = '';
        if (state.status === 'error' && errorState.error) {
            const err = errorState.error;
            if (typeof err === 'string') {
                errorMsg = err;
            } else if (typeof err === 'object') {
                errorMsg = (err as any).message || (err as any).data?.message || JSON.stringify(err);
            }
        }

        return {
            tool: part.tool,
            status: state.status as 'pending' | 'running' | 'completed' | 'error',
            input: (state as any).input,
            output: completedState.output,
            error: errorMsg,
        };
    };

    return (
        <>
            <View style={styles.container}>
                {renderContent()}
            </View>

            <ToolDetailsBottomSheet
                visible={bottomSheetVisible}
                {...getBottomSheetProps()}
                onClose={() => setBottomSheetVisible(false)}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
    },
});

export default ToolPartRenderer;
