import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, SafeAreaView, StatusBar, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { tasks } from '../Data/TodoSet';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Task } from '../types';
import SidePanel from './SidePanel';
import { BlurView } from 'expo-blur';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const Home: React.FC<Props> = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState('2025-06-06');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const calendarDates = [
    { day: 'WED', date: 5, fullDate: '2025-06-05' },
    { day: 'THU', date: 6, fullDate: '2025-06-06' },
    { day: 'FRI', date: 7, fullDate: '2025-06-07' },
    { day: 'SAT', date: 8, fullDate: '2025-06-08' },
    { day: 'SUN', date: 9, fullDate: '2025-06-09' },
    { day: 'MON', date: 10, fullDate: '2025-06-10' },
  ];

  useEffect(() => {
    const filtered = tasks.filter(task => {
      const matchesDate = task.date === selectedDate;
      const matchesSearch =
        task.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.taskDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesSearch;
    });
    setFilteredTasks(filtered);
  }, [selectedDate, searchQuery]);

  const toggleTaskCompletion = (taskId: string) => {
    const index = tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      tasks[index].completed = !tasks[index].completed;
      setFilteredTasks([...filteredTasks]); 
    }
  };

  const deleteTask = (taskId: string) => {
    const newTasks = tasks.filter(task => task.id !== taskId);
    tasks.splice(0, tasks.length, ...newTasks);
    setFilteredTasks(filteredTasks.filter(task => task.id !== taskId));
    setSelectedTaskId(null);
  };

  const renderCalendarDate = ({ item }: { item: { day: string; date: number; fullDate: string } }) => (
    <TouchableOpacity
      style={[styles.dateItem, selectedDate === item.fullDate && styles.selectedDateItem]}
      onPress={() => setSelectedDate(item.fullDate)}
    >
      <Text style={[styles.dayText, selectedDate === item.fullDate && styles.selectedDayText]}>
        {item.day}
      </Text>
      <Text style={[styles.dateText, selectedDate === item.fullDate && styles.selectedDateText]}>
        {item.date}
      </Text>
    </TouchableOpacity>
  );

  const renderTask = ({ item }: { item: Task }) => (
    <View>
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => {
          navigation.navigate('TaskDetails', { task: item });
          setSelectedTaskId(null);
        }}
      >
        <TouchableOpacity
          style={[styles.circle, item.completed && styles.completedCircle]}
          onPress={() => toggleTaskCompletion(item.id)}
        >
          {item.completed && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </TouchableOpacity>

        <View style={styles.taskTextContainer}>
          <Text style={[styles.taskTitle, item.completed && styles.completedTaskTitle]}>
            {item.taskTitle}
          </Text>
          <Text style={styles.taskTime}>{item.time}</Text>
        </View>

        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() =>
            setSelectedTaskId(prev => (prev === item.id ? null : item.id))
          }
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </TouchableOpacity>

      {selectedTaskId === item.id && (
        <View style={styles.optionsPopup}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => {
              navigation.navigate('EditScreen', { task: item });
              setSelectedTaskId(null);
            }}
          >
            <Ionicons name="create-outline" size={20} color="#6366f1" />
            <Text style={styles.optionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => deleteTask(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={[styles.optionText, { color: '#ef4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={() => {
      setSelectedTaskId(null);
      setIsSidePanelOpen(false);
    }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
        <LinearGradient colors={["#6366f1", "#8b5cf6", "#a855f7"]} style={styles.gradient}>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsSidePanelOpen(true)}>
              <Ionicons name="menu" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.logo}>Miodo Logo</Text>
            <TouchableOpacity>
              <View style={styles.profilePicture}>
                <Ionicons name="person" size={20} color="#6366f1" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.taskCounterContainer}>
            <Text style={styles.taskCountText}>
              you have <Text style={styles.taskNumber}>{filteredTasks.length}</Text> tasks today!
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tasks"
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.calendarContainer}>
            <FlatList
              data={calendarDates}
              renderItem={renderCalendarDate}
              keyExtractor={item => item.fullDate}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateList}
            />
          </View>

          <ScrollView style={styles.tasksContainer} showsVerticalScrollIndicator={false}>
            {filteredTasks.map(task => (
              <View key={task.id}>{renderTask({ item: task })}</View>
            ))}
            {filteredTasks.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No tasks found</Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddTask')}>
            <Ionicons name="add" size={24} color="#6366f1" />
          </TouchableOpacity>

          {isSidePanelOpen && (
            <BlurView
              intensity={20}
              style={styles.blurOverlay}
              tint="dark"
            />
          )}

          <SidePanel 
            isOpen={isSidePanelOpen}
            onClose={() => setIsSidePanelOpen(false)}
          />
        </LinearGradient>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  logo: { fontSize: 18, fontWeight: '600', color: 'white' },
  profilePicture: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCounterContainer: { paddingHorizontal: 20, marginBottom: 20 },
  taskCountText: { fontSize: 20, color: 'rgba(255,255,255,0.9)', fontWeight: '300' },
  taskNumber: { fontWeight: '700', color: 'white' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#374151' },
  calendarContainer: { marginBottom: 20 },
  dateList: { paddingHorizontal: 15 },
  dateItem: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    minWidth: 60,
  },
  selectedDateItem: { backgroundColor: 'rgba(255,255,255,0.9)' },
  dayText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  selectedDayText: { color: '#6366f1' },
  dateText: { fontSize: 16, fontWeight: '700', color: 'white' },
  selectedDateText: { color: '#6366f1' },
  tasksContainer: { flex: 1, paddingHorizontal: 20 },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  completedCircle: { backgroundColor: '#10b981', borderColor: '#10b981' },
  taskTextContainer: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: '600', color: 'white', marginBottom: 4 },
  completedTaskTitle: { textDecorationLine: 'line-through', opacity: 0.7 },
  taskTime: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  optionsButton: { padding: 8 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontStyle: 'italic',
  },
  optionsPopup: {
    position: 'absolute',
    right: 40,
    top: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    minWidth: 100,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
});
