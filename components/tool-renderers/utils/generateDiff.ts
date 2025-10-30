interface EditOperation {
  op: 'add' | 'replace' | 'remove';
  path: string;
  value?: string;
}

/**
 * Generate a unified diff from an edit operation's oldString and newString.
 * If the operation doesn't have explicit old/new strings, returns a placeholder.
 */
export const generateDiffFromOperation = (
  operation: EditOperation & { oldString?: string; newString?: string },
  filePath: string = 'file'
): string => {
  const { oldString = '', newString = '' } = operation;

  const oldLines = oldString.split('\n');
  const newLines = newString.split('\n');

  // Header
  const diff = [
    `--- a/${filePath}`,
    `+++ b/${filePath}`,
    `@@ -1,${oldLines.length} +1,${newLines.length} @@`,
  ];

  // Compute a simple diff: remove old, add new
  for (const line of oldLines) {
    if (line.trim()) {
      diff.push(`-${line}`);
    }
  }

  for (const line of newLines) {
    if (line.trim()) {
      diff.push(`+${line}`);
    }
  }

  return diff.join('\n');
};

/**
 * Generate a unified diff from multiple edit operations.
 */
export const generateDiffFromOperations = (
  operations: (EditOperation & { oldString?: string; newString?: string })[],
  filePath: string = 'file'
): string => {
  const diffs = operations
    .filter((op) => op.oldString || op.newString)
    .map((op) => generateDiffFromOperation(op, filePath));

  return diffs.join('\n\n');
};

/**
 * Simple Myers' diff algorithm for character-level or line-level diff.
 * Returns arrays of added/removed lines.
 */
export const computeLineDiff = (
  oldText: string,
  newText: string
): { added: string[]; removed: string[] } => {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const added: string[] = [];
  const removed: string[] = [];

  // Simple approach: find common lines and diff the rest
  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);

  for (const line of oldLines) {
    if (!newSet.has(line)) {
      removed.push(line);
    }
  }

  for (const line of newLines) {
    if (!oldSet.has(line)) {
      added.push(line);
    }
  }

  return { added, removed };
};
