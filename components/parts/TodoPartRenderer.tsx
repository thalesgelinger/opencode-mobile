import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Todo {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

interface TodoPartRendererProps {
  todos: Todo[];
}

const TodoPartRenderer: React.FC<TodoPartRendererProps> = ({ todos }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />;
      case 'in_progress':
        return <Ionicons name="time" size={16} color="#2196F3" />;
      case 'cancelled':
        return <Ionicons name="close-circle" size={16} color="#F44336" />;
      default:
        return <Ionicons name="ellipse-outline" size={16} color="#9E9E9E" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="list" size={16} color="#666" />
        <Text style={styles.headerText}>Tasks</Text>
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
                todo.status === 'completed' && styles.completedText,
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
    backgroundColor: '#f8f9fa',
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
    color: '#666',
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
    color: '#333',
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },

});

export default TodoPartRenderer;
