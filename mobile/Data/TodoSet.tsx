import { Task } from '../types';

export const tasks: Task[] = [
  {
    id: '1',
    taskTitle: 'Meeting with kaluu',
    taskDescription: 'Discuss project progress',
    date: '2025-06-05',
    time: '11:40',
    userId: 'user_001',
    completed: false,
  },
  {
    id: '2',
    taskTitle: 'Meeting with kaluu',
    taskDescription: 'Design update review',
    date: '2025-06-06',
    time: '13:40',
    userId: 'user_001',
    completed: true,
  },
  {
    id: '3',
    taskTitle: 'Meeting with kaluu',
    taskDescription: 'QA feedback',
    date: '2025-06-06',
    time: '15:40',
    userId: 'user_001',
    completed: false,
  },
  {
    id: '4',
    taskTitle: 'Meeting with kaluu',
    taskDescription: 'Client approval check-in',
    date: '2025-06-07',
    time: '09:40',
    userId: 'user_001',
    completed: false,
  },
];
