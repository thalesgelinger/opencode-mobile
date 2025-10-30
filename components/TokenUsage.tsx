import React from 'react';
import { Text, View, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

export const TokenUsage = () => {
    const colorScheme = useColorScheme() || 'light';
    const theme = colors[colorScheme];
    const sessionTokens = useAppStore(s => s.getSessionTokens());
    const modelDetails = useAppStore(s => s.getCurrentModelDetails());

    // Show 0 if no session tokens yet
    if (!sessionTokens) {
        return (
            <View style={styles.container}>
                <Text style={[styles.text, { color: theme.textSecondary }]}>
                    0
                </Text>
            </View>
        );
    }

    const { input, output, reasoning, cache } = sessionTokens.tokens;
    const totalTokens = input + output + reasoning + cache.read + cache.write;

    // Format tokens: 1000 -> 1K, 1500 -> 1.5K, 12345 -> 12.3K
    const formatTokens = (n: number) => {
        if (n < 1000) return n.toString();
        return `${(n / 1000).toFixed(1)}K`;
    };

    // Show cost if > 0, otherwise use context %
    const hasCost = sessionTokens.cost > 0;

    if (hasCost) {
        const costStr = `$${sessionTokens.cost.toFixed(2)}`;
        return (
            <View style={styles.container}>
                <Text style={[styles.text, { color: theme.textSecondary }]}>
                    {formatTokens(totalTokens)} | {costStr}
                </Text>
            </View>
        );
    }

    // Context % fallback
    if (modelDetails?.limit?.context) {
        console.log('[TokenUsage] totalTokens:', totalTokens);
        console.log('[TokenUsage] context limit:', modelDetails.limit.context);
        const pct = Math.min(100, ((totalTokens / modelDetails.limit.context) * 100)).toFixed(1);
        console.log('[TokenUsage] calculated %:', pct);
        return (
            <View style={styles.container}>
                <Text style={[styles.text, { color: theme.textSecondary }]}>
                    {formatTokens(totalTokens)} | {pct}%
                </Text>
            </View>
        );
    }

    // No cost/limit - just show tokens
    return (
        <View style={styles.container}>
            <Text style={[styles.text, { color: theme.textSecondary }]}>
                {formatTokens(totalTokens)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: 16,
    },
    text: {
        fontSize: 13,
        fontFamily: 'monospace',
    },
});
