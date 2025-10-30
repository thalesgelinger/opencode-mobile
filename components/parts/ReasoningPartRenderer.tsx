import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { ReasoningPart } from '@opencode-ai/sdk';
import { colors } from '../../constants/colors';
import ToolActionLine from '../ToolActionLine';

interface ReasoningPartRendererProps {
  part: ReasoningPart;
}

const ReasoningPartRenderer: React.FC<ReasoningPartRendererProps> = ({ part }) => {
   const [isExpanded, setIsExpanded] = useState(false);
   const { text } = part;
   const colorScheme = useColorScheme();
   const theme = colorScheme === 'dark' ? colors.dark : colors.light;

   return (
     <View>
       <ToolActionLine
         icon="💭"
         label="Reasoning"
         status="completed"
         onPress={() => setIsExpanded(!isExpanded)}
       />
       
       {isExpanded && (
         <ScrollView style={[styles.content, { backgroundColor: theme.bgSecondary }]}>
           <Text style={[styles.text, { color: theme.text }]}>{text}</Text>
         </ScrollView>
       )}
     </View>
   );
};

const styles = StyleSheet.create({
   content: {
     marginTop: 8,
     maxHeight: 300,
     paddingHorizontal: 12,
     paddingVertical: 8,
     borderRadius: 8,
   },
   text: {
     fontSize: 14,
     lineHeight: 20,
   },
});

export default ReasoningPartRenderer;
