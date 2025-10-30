export type Language = 'javascript' | 'typescript' | 'python' | 'shell' | 'json' | 'diff' | 'text';

const extensionMap: Record<string, Language> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.fish': 'shell',
  '.json': 'json',
  '.jsonc': 'json',
  '.diff': 'diff',
  '.patch': 'diff',
};

export const detectLanguageFromPath = (filePath: string): Language => {
  const ext = filePath.toLowerCase().split('.').pop();
  if (!ext) return 'text';
  const mapped = extensionMap[`.${ext}`];
  return mapped || 'text';
};

export const detectLanguageFromContent = (content: string): Language => {
  const trimmed = content.trim();

  // Check for JSON
  if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && trimmed.match(/[{}[\]]/)) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {}
  }

  // Check for diff/patch
  if (trimmed.match(/^(---|@@|\+\+\+)/m)) {
    return 'diff';
  }

  // Check for shell
  if (trimmed.startsWith('#!') || trimmed.match(/^(if|then|else|for|while)\b/m)) {
    return 'shell';
  }

  // Check for Python
  if (trimmed.match(/^(import|from|def|class|if __name__)/m)) {
    return 'python';
  }

  // Check for TypeScript
  if (trimmed.match(/^(interface|type|enum|namespace|declare|as const|satisfies)\b/m)) {
    return 'typescript';
  }

  // Default to JavaScript for code-like content
  if (trimmed.match(/^(const|let|var|function|class|export|import|async|await)\b/m)) {
    return 'javascript';
  }

  return 'text';
};
