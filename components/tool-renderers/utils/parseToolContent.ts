import { detectLanguageFromPath, detectLanguageFromContent } from './detectLanguage';

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
    const output = toolJson.stdout || toolJson.stderr || toolJson.output || '';
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
  if (toolType === 'read' || (toolJson.filePath && toolJson.content)) {
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

  // Edit tool: show unified diff from oldString/newString
  if (toolType === 'edit' || (toolJson.filePath && (toolJson.oldString || toolJson.newString))) {
    const filePath = toolJson.filePath || 'file';
    const oldString = toolJson.oldString || '';
    const newString = toolJson.newString || '';
    
    // Generate simple unified diff
    const oldLines = oldString.split('\n');
    const newLines = newString.split('\n');
    
    const diff = [
      `--- a/${filePath}`,
      `+++ b/${filePath}`,
      `@@ -1,${oldLines.length} +1,${newLines.length} @@`,
      ...oldLines.map((line: string) => `-${line}`),
      ...newLines.map((line: string) => `+${line}`),
    ].join('\n');

    return {
      type: 'edit',
      input: {
        label: 'File',
        content: filePath,
        language: 'text',
      },
      output: {
        label: 'Changes',
        content: diff,
        language: 'diff',
      },
      metadata: {
        filePath,
      },
    };
  }

  // Grep tool: pattern and results
  if (toolType === 'grep' || (toolJson.pattern && (toolJson.matches !== undefined || toolJson.output))) {
    const matches = toolJson.matches || toolJson.output || [];
    let resultsText = '';
    
    if (typeof matches === 'string') {
      resultsText = matches;
    } else if (Array.isArray(matches)) {
      resultsText = matches
        .map((m: any) => {
          if (typeof m === 'string') return m;
          return `${m.file}:${m.line}`;
        })
        .join('\n');
    }

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
  if (toolType === 'glob' || (toolJson.pattern && (toolJson.files !== undefined || toolJson.output))) {
    const files = toolJson.files || toolJson.output || [];
    let resultsText = '';
    
    if (typeof files === 'string') {
      resultsText = files;
    } else if (Array.isArray(files)) {
      resultsText = files.join('\n');
    }

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
    const content = toolJson.content || toolJson.output || '';
    return {
      type: 'webfetch',
      input: {
        label: 'URL',
        content: toolJson.url || '',
        language: 'text',
      },
      output: {
        label: 'Content',
        content,
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
