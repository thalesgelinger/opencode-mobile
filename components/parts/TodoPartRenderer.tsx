import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../constants/colors';

interface Todo {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

interface TodoPartRendererProps {
  todos: Todo[];
}

const TodoPartRenderer: React.FC<TodoPartRendererProps> = ({ todos }) => {
   const colorScheme = useColorScheme();
   const theme = colorScheme === 'dark' ? colors.dark : colors.light;

   const getStatusIcon = (status: string) => {
     switch (status) {
       case 'completed':
         return <Ionicons name="checkmark-circle" size={16} color={theme.success} />;
       case 'in_progress':
         return <Ionicons name="time" size={16} color={theme.accent1} />;
       case 'cancelled':
         return <Ionicons name="close-circle" size={16} color={theme.error} />;
       default:
         return <Ionicons name="ellipse-outline" size={16} color={theme.textSecondary} />;
     }
   };

   return (
     <View style={[styles.container, { backgroundColor: theme.bgSecondary }]}>
       <View style={styles.header}>
         <Ionicons name="list" size={16} color={theme.textSecondary} />
         <Text style={[styles.headerText, { color: theme.textSecondary }]}>Tasks</Text>
       </View>
      {todos.map((todo) => (
        <View key={todo.id} style={styles.todoItem}>
          <View style={styles.statusContainer}>
            {getStatusIcon(todo.status)}
          </View>
          <View style={styles.contentContainer}>
             <Text
               style={[
                 styles.todoContent,
                 { color: theme.text },
                 todo.status === 'completed' && [styles.completedText, { color: theme.textSecondary }],
               ]}
             >
               {todo.content}
             </Text>
          </View>

        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
   container: {
     borderRadius: 8,
     padding: 12,
     marginVertical: 8,
   },
   header: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: 12,
     gap: 6,
   },
   headerText: {
     fontSize: 14,
     fontWeight: '600',
   },
   todoItem: {
     flexDirection: 'row',
     alignItems: 'flex-start',
     marginBottom: 8,
     gap: 8,
   },
   statusContainer: {
     paddingTop: 2,
   },
   contentContainer: {
     flex: 1,
   },
   todoContent: {
     fontSize: 14,
     lineHeight: 20,
   },
   completedText: {
     textDecorationLine: 'line-through',
   },

});

export default TodoPartRenderer;
