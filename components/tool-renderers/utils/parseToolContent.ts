import { detectLanguageFromPath, detectLanguageFromContent } from './detectLanguage';
import { generateDiffFromOperations } from './generateDiff';

export interface ParsedToolContent {
  type: 'bash' | 'read' | 'write' | 'edit' | 'grep' | 'glob' | 'webfetch' | 'patch' | 'unknown';
  input?: {
    label: string;
    content: string;
    language?: 'javascript' | 'typescript' | 'python' | 'shell' | 'json' | 'text';
  };
  output?: {
    label: string;
    content: string;
    language?: 'javascript' | 'typescript' | 'python' | 'shell' | 'json' | 'diff' | 'text';
  };
  metadata?: Record<string, any>;
}

/**
 * Parse raw tool JSON into a structured format suitable for rendering.
 */
export const parseToolContent = (toolJson: any): ParsedToolContent => {
  if (!toolJson || typeof toolJson !== 'object') {
    return { type: 'unknown' };
  }

  const toolType = toolJson.type?.toLowerCase();

  // Bash tool: command input, stdout/stderr output
  if (toolType === 'bash' || toolJson.command) {
    const output = toolJson.stdout || toolJson.stderr || '';
    return {
      type: 'bash',
      input: {
        label: 'Command',
        content: toolJson.command || '',
        language: 'shell',
      },
      output: {
        label: 'Output',
        content: output,
        language: 'shell',
      },
    };
  }

  // Read tool: file path input, content output (strip line numbers)
  if (toolType === 'read' || toolJson.filePath) {
    let content = toolJson.content || '';

    // Strip line numbers (format: spaces + 5-digit number + pipe + content)
    content = content.replace(/^\s*\d{5}\|\s?/gm, '');

    const language = detectLanguageFromPath(toolJson.filePath || '');
    return {
      type: 'read',
      input: {
        label: 'File Path',
        content: toolJson.filePath || '',
        language: 'text',
      },
      output: {
        label: 'Content',
        content,
        language: language !== 'text' ? language : detectLanguageFromContent(content),
      },
    };
  }

  // Write tool: file path and content
  if (toolType === 'write' || (toolJson.filePath && toolJson.content && !toolJson.oldString)) {
    const language = detectLanguageFromPath(toolJson.filePath || '');
    return {
      type: 'write',
      input: {
        label: 'Write to File',
        content: toolJson.filePath || '',
        language: 'text',
      },
      output: {
        label: 'Content',
        content: toolJson.content || '',
        language: language !== 'text' ? language : detectLanguageFromContent(toolJson.content || ''),
      },
    };
  }

  // Edit tool: show unified diff from operations
  if (toolType === 'edit' || (toolJson.id && toolJson.updates)) {
    const filePath = toolJson.filePath || `file_${toolJson.id}`;
    const diff = generateDiffFromOperations(toolJson.updates || [], filePath);

    return {
      type: 'edit',
      input: {
        label: 'Work Item ID',
        content: toolJson.id?.toString() || '',
        language: 'text',
      },
      output: {
        label: 'Changes',
        content: diff,
        language: 'diff',
      },
      metadata: {
        id: toolJson.id,
        updateCount: toolJson.updates?.length || 0,
      },
    };
  }

  // Grep tool: pattern and results
  if (toolType === 'grep' || (toolJson.pattern && toolJson.matches !== undefined)) {
    const matches = toolJson.matches || [];
    const resultsText = Array.isArray(matches)
      ? matches.map((m: any) => `${m.file}:${m.line}`).join('\n')
      : matches;

    return {
      type: 'grep',
      input: {
        label: 'Search Pattern',
        content: toolJson.pattern || '',
        language: 'text',
      },
      output: {
        label: 'Results',
        content: resultsText || 'No matches found',
        language: 'text',
      },
      metadata: {
        matchCount: Array.isArray(matches) ? matches.length : 0,
      },
    };
  }

  // Glob tool: pattern and results
  if (toolType === 'glob' || (toolJson.pattern && toolJson.files !== undefined)) {
    const files = toolJson.files || [];
    const resultsText = Array.isArray(files) ? files.join('\n') : files;

    return {
      type: 'glob',
      input: {
        label: 'Glob Pattern',
        content: toolJson.pattern || '',
        language: 'text',
      },
      output: {
        label: 'Files',
        content: resultsText || 'No files found',
        language: 'text',
      },
      metadata: {
        fileCount: Array.isArray(files) ? files.length : 0,
      },
    };
  }

  // WebFetch tool: URL input, content output
  if (toolType === 'webfetch' || toolJson.url) {
    const format = toolJson.format || 'text';
    return {
      type: 'webfetch',
      input: {
        label: 'URL',
        content: toolJson.url || '',
        language: 'text',
      },
      output: {
        label: 'Content',
        content: toolJson.content || '',
        language: format === 'markdown' ? 'text' : format === 'html' ? 'text' : 'text',
      },
      metadata: {
        format,
      },
    };
  }

  // Patch tool (if it exists separately)
  if (toolType === 'patch' || toolJson.patch) {
    return {
      type: 'patch',
      output: {
        label: 'Patch',
        content: toolJson.patch || '',
        language: 'diff',
      },
    };
  }

  return { type: 'unknown' };
};
