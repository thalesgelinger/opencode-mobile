import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { RetryPart } from '@opencode-ai/sdk';
import { colors } from '../../constants/colors';
import ToolActionLine from '../ToolActionLine';

interface RetryPartRendererProps {
  part: RetryPart;
}

const RetryPartRenderer: React.FC<RetryPartRendererProps> = ({ part }) => {
   const { attempt, error } = part;
   const errorMsg = error?.data?.message || (typeof error === 'string' ? error : 'Unknown error');
   const colorScheme = useColorScheme();
   const theme = colorScheme === 'dark' ? colors.dark : colors.light;

   return (
     <View>
       <ToolActionLine
         icon="🔄"
         label={`Retry attempt ${attempt}`}
         status="error"
         onPress={() => {}}
       />
       <Text style={[styles.errorText, { color: theme.error }]}>{errorMsg}</Text>
     </View>
   );
};

const styles = StyleSheet.create({
   errorText: {
     fontSize: 12,
     marginTop: 6,
     marginLeft: 12,
   },
});

export default RetryPartRenderer;
