import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

interface HighlightedSegment {
  text: string;
  type: 'keyword' | 'string' | 'number' | 'comment' | 'operator' | 'function' | 'default';
}

interface SyntaxHighlighterProps {
  code: string;
  language?: 'javascript' | 'typescript' | 'python' | 'shell' | 'json' | 'diff' | 'text';
  maxLines?: number;
}

const KEYWORDS = {
  javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super', 'extends', 'static', 'get', 'set'],
  typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'super', 'extends', 'static', 'get', 'set', 'interface', 'type', 'enum', 'namespace', 'declare', 'as', 'is', 'keyof', 'typeof', 'instanceof'],
  python: ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'pass', 'break', 'continue', 'yield', 'lambda', 'assert', 'del', 'global', 'nonlocal', 'async', 'await'],
  shell: ['if', 'then', 'else', 'elif', 'fi', 'for', 'in', 'do', 'done', 'while', 'case', 'esac', 'function', 'return', 'export', 'source'],
};

const tokenizeCode = (code: string, language?: string): HighlightedSegment[] => {
  if (!language || language === 'text') {
    return [{ text: code, type: 'default' }];
  }

  const segments: HighlightedSegment[] = [];
  let remaining = code;
  const keywordList = KEYWORDS[language as keyof typeof KEYWORDS] || [];

  // Pattern: strings (single/double/backtick), comments, numbers, keywords, operators, functions, rest
  const patterns = [
    { regex: /^"(?:\\.|[^"\\])*"/, type: 'string' as const },
    { regex: /^'(?:\\.|[^'\\])*'/, type: 'string' as const },
    { regex: /^`(?:\\.|[^`\\])*`/, type: 'string' as const },
    { regex: /^\/\/.*$/, type: 'comment' as const },
    { regex: /^\/\*[\s\S]*?\*\//, type: 'comment' as const },
    { regex: /^#.*$/, type: 'comment' as const },
    { regex: /^\b\d+\.?\d*\b/, type: 'number' as const },
    { regex: /^true\b|^false\b|^null\b|^undefined\b|^None\b|^True\b|^False\b/, type: 'keyword' as const },
  ];

  while (remaining.length > 0) {
    let matched = false;

    // Try string/comment/number patterns
    for (const { regex, type } of patterns) {
      const match = remaining.match(regex);
      if (match) {
        segments.push({ text: match[0], type });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }

    if (matched) continue;

    // Try keywords and function names
    const wordMatch = remaining.match(/^\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/);
    if (wordMatch) {
      const word = wordMatch[0];
      if (keywordList.includes(word)) {
        segments.push({ text: word, type: 'keyword' });
      } else if (remaining.slice(word.length).match(/^\s*\(/)) {
        segments.push({ text: word, type: 'function' });
      } else {
        segments.push({ text: word, type: 'default' });
      }
      remaining = remaining.slice(word.length);
      continue;
    }

    // Try operators
    const opMatch = remaining.match(/^[=+\-*/%&|^!<>?:;,.()[\]{}]/);
    if (opMatch) {
      segments.push({ text: opMatch[0], type: 'operator' });
      remaining = remaining.slice(1);
      continue;
    }

    // Fallback: take single character
    segments.push({ text: remaining[0], type: 'default' });
    remaining = remaining.slice(1);
  }

  return segments;
};

const getColorForType = (type: HighlightedSegment['type'], isDark: boolean) => {
  const colors = {
    keyword: isDark ? '#FF79C6' : '#9D0E4F',
    string: isDark ? '#F1FA8C' : '#C7B700',
    number: isDark ? '#BD93F9' : '#7B3FF2',
    comment: isDark ? '#6272A4' : '#6A737D',
    operator: isDark ? '#F8F8F2' : '#24292E',
    function: isDark ? '#50FA7B' : '#6F42C1',
    default: isDark ? '#F8F8F2' : '#24292E',
  };
  return colors[type];
};

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  code,
  language = 'text',
  maxLines = 1000,
}) => {
  const { colors } = useTheme();
  const isDark = colors.background === '#1E1E1E' || colors.background === '#000000';

  const { displayCode, isTruncated, lineCount } = useMemo(() => {
    const lines = code.split('\n');
    const count = lines.length;
    if (count > maxLines) {
      return {
        displayCode: lines.slice(0, maxLines).join('\n'),
        isTruncated: true,
        lineCount: count,
      };
    }
    return { displayCode: code, isTruncated: false, lineCount: count };
  }, [code, maxLines]);

  const segments = useMemo(() => tokenizeCode(displayCode, language), [displayCode, language]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      style={styles.container}
    >
      <View style={[styles.codeBlock, { backgroundColor: isDark ? '#282C34' : '#F6F8FA' }]}>
        <Text
          style={[
            styles.code,
            {
              color: isDark ? '#F8F8F2' : '#24292E',
              fontFamily: 'Menlo',
              fontSize: 12,
            },
          ]}
        >
          {segments.map((segment, idx) => (
            <Text
              key={idx}
              style={{
                color: getColorForType(segment.type, isDark),
              }}
            >
              {segment.text}
            </Text>
          ))}
        </Text>
        {isTruncated && (
          <Text style={[styles.truncationWarning, { color: isDark ? '#FF79C6' : '#9D0E4F' }]}>
            {'\n'}... ({lineCount} total lines, showing first {maxLines})
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  codeBlock: {
    padding: 12,
    borderRadius: 8,
  },
  code: {
    lineHeight: 18,
  },
  truncationWarning: {
    marginTop: 8,
    fontStyle: 'italic',
    fontSize: 11,
  },
});
