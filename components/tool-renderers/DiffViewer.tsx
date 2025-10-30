import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

interface DiffLine {
  type: 'add' | 'remove' | 'context' | 'header';
  content: string;
  lineNumber?: number;
}

interface DiffViewerProps {
  diff: string;
  maxLines?: number;
}

const parseDiff = (diffText: string): DiffLine[] => {
  const lines = diffText.split('\n');
  const result: DiffLine[] = [];

  for (const line of lines) {
    if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('@@')) {
      result.push({ type: 'header', content: line });
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
      result.push({ type: 'add', content: line.slice(1) });
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      result.push({ type: 'remove', content: line.slice(1) });
    } else {
      result.push({ type: 'context', content: line.slice(1) || '' });
    }
  }

  return result;
};

export const DiffViewer: React.FC<DiffViewerProps> = ({ diff, maxLines = 500 }) => {
  const { colors } = useTheme();
  const isDark = colors.background === '#1E1E1E' || colors.background === '#000000';

  const { lines, isTruncated, totalLines } = useMemo(() => {
    const parsed = parseDiff(diff);
    if (parsed.length > maxLines) {
      return {
        lines: parsed.slice(0, maxLines),
        isTruncated: true,
        totalLines: parsed.length,
      };
    }
    return { lines: parsed, isTruncated: false, totalLines: parsed.length };
  }, [diff, maxLines]);

  const getLineColor = (type: DiffLine['type']) => {
    if (type === 'add') {
      return isDark ? '#1A3A1A' : '#E6FFED';
    } else if (type === 'remove') {
      return isDark ? '#3A1A1A' : '#FFEBE9';
    } else if (type === 'header') {
      return isDark ? '#2A2A3A' : '#F0F0F5';
    }
    return isDark ? '#282C34' : '#F6F8FA';
  };

  const getTextColor = (type: DiffLine['type']) => {
    if (type === 'add') {
      return isDark ? '#4FD96F' : '#28A745';
    } else if (type === 'remove') {
      return isDark ? '#F85149' : '#CB2431';
    } else if (type === 'header') {
      return isDark ? '#8B949E' : '#6A737D';
    }
    return isDark ? '#F8F8F2' : '#24292E';
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      style={styles.container}
    >
      <View>
        {lines.map((line, idx) => (
          <View
            key={idx}
            style={[
              styles.diffLine,
              { backgroundColor: getLineColor(line.type) },
            ]}
          >
            <Text
              style={[
                styles.diffText,
                {
                  color: getTextColor(line.type),
                  fontFamily: 'Menlo',
                  fontSize: 12,
                },
              ]}
            >
              {line.type === 'add' ? '+ ' : line.type === 'remove' ? '- ' : '  '}
              {line.content}
            </Text>
          </View>
        ))}
        {isTruncated && (
          <View style={styles.truncationWarning}>
            <Text
              style={[
                styles.truncationText,
                { color: isDark ? '#FF79C6' : '#9D0E4F' },
              ]}
            >
              ... ({totalLines} total lines, showing first {maxLines})
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  diffLine: {
    paddingVertical: 2,
    paddingHorizontal: 12,
  },
  diffText: {
    lineHeight: 18,
  },
  truncationWarning: {
    padding: 12,
  },
  truncationText: {
    fontStyle: 'italic',
    fontSize: 11,
  },
});
