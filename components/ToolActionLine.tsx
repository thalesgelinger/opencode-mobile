import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { colors } from '../constants/colors';

interface ToolActionLineProps {
  icon: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  onPress?: () => void;
}

const ToolActionLine: React.FC<ToolActionLineProps> = ({ icon, label, status, onPress }) => {
   const colorScheme = useColorScheme();
   const theme = colorScheme === 'dark' ? colors.dark : colors.light;

   const getStatusColor = (s: string) => {
     const statusColors = {
       'pending': theme.textSecondary,
       'running': theme.accent1,
       'completed': theme.success,
       'error': theme.error,
     };
     return statusColors[s as keyof typeof statusColors] || theme.textSecondary;
   };

  const getStatusIcon = (s: string) => {
    const icons = {
      'pending': '○',
      'running': '◐',
      'completed': '✓',
      'error': '✕',
    };
    return icons[s as keyof typeof icons] || '○';
  };

  const statusColor = getStatusColor(status);

   return (
     <TouchableOpacity 
       style={[styles.container, { borderLeftColor: statusColor, borderBottomColor: theme.border }]}
       onPress={onPress}
       disabled={status === 'running'}
     >
       <Text style={styles.icon}>{icon}</Text>
       <View style={styles.content}>
         <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>{label}</Text>
       </View>
       {status === 'running' ? (
         <ActivityIndicator size="small" color={statusColor} />
       ) : (
         <Text style={[styles.statusIcon, { color: statusColor }]}>
           {getStatusIcon(status)}
         </Text>
       )}
     </TouchableOpacity>
   );
};

const styles = StyleSheet.create({
   container: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 12,
     paddingVertical: 8,
     paddingHorizontal: 12,
     backgroundColor: 'transparent',
     borderRadius: 0,
     marginVertical: 2,
     borderLeftWidth: 2,
     borderBottomWidth: 1,
   },
   icon: {
     fontSize: 18,
   },
   content: {
     flex: 1,
   },
   label: {
     fontSize: 14,
     fontFamily: 'monospace',
   },
  statusIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ToolActionLine;
