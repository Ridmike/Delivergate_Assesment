import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetails'>;

const TaskDetails: React.FC<Props> = ({ route }) => {
  const { task } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.taskTitle}</Text>
      <Text style={styles.description}>{task.taskDescription}</Text>
      <Text style={styles.meta}>Date: {task.date}</Text>
      <Text style={styles.meta}>Time: {task.time}</Text>
    </View>
  );
};

export default TaskDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  meta: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
});
