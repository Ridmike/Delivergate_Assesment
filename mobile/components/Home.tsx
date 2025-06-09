import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, SafeAreaView, StatusBar, ScrollView, TouchableWithoutFeedback, Alert, ActivityIndicator, Platform, Modal, Animated, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Task } from '../types';
// import SidePanel from './SidePanel';
import { BlurView } from 'expo-blur';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const ShimmerCard = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
      animatedValue.setValue(0);
    };
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.taskCard}>
      <Animated.View style={[styles.shimmerCircle, { opacity }]} />
      <View style={styles.taskTextContainer}>
        <Animated.View style={[styles.shimmerTitle, { opacity }]} />
        <Animated.View style={[styles.shimmerTime, { opacity }]} />
      </View>
    </View>
  );
};

const Home: React.FC<Props> = ({ navigation, route }) => {
  const { user, token } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [calendarDates, setCalendarDates] = useState<Array<{ day: string; date: number; fullDate: string }>>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const API_URL = Platform.select({
    android: 'http://192.168.1.11:3000/api',     // Android Emulator
    ios: 'http://localhost:3000/api',         // iOS Simulator
    default: 'http://192.168.1.11:3000/api'  // Your current IP
  });
  const fetchTasks = async (date?: string) => {
    if (!token) {
      navigation.replace('SignIn');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching tasks for date:', date);
      const url = `${API_URL}/todos${date ? `?date=${date}` : ''}`;
      console.log('Fetch URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tasks');
      }

      console.log('Fetched tasks:', data);
      setTasks(data);
      setFilteredTasks(data);
      return data;
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', error.message || 'Failed to fetch tasks');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Generate calendar dates dynamically
  const generateCalendarDates = () => {
    const today = new Date();
    const dates = [];
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    // Generate 7 days starting from today
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const day = dayNames[date.getDay()];
      const dateNum = date.getDate();
      const fullDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      dates.push({
        day,
        date: dateNum,
        fullDate
      });
    }
    
    return dates;
  };

  // Initialize calendar and fetch initial tasks
  useEffect(() => {
    const generatedDates = generateCalendarDates();
    setCalendarDates(generatedDates);
    
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  // Fetch tasks when selected date changes
  useEffect(() => {
    if (!selectedDate || !token) return;
    
    fetchTasks(selectedDate).then(fetchedTasks => {
      if (fetchedTasks) {
        setFilteredTasks(fetchedTasks);
      }
    });
  }, [selectedDate, token]);

  // Handle search filtering
  useEffect(() => {
    if (!tasks.length) return;
    
    const filtered = tasks.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTasks(filtered);
  }, [searchQuery, tasks]);

  const toggleTaskCompletion = async (taskId: string) => {
    if (!token) {
      navigation.replace('SignIn');
      return;
    }

    try {
      const task = filteredTasks.find(t => t._id === taskId);
      if (!task) return;

      const response = await fetch(`${API_URL}/todos/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !task.completed
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update task');
      }

      // Update local state
      const updateTask = (taskList: Task[]) =>
        taskList.map(t => t._id === taskId ? { ...t, completed: !t.completed } : t);
      
      setTasks(prev => updateTask(prev));
      setFilteredTasks(prev => updateTask(prev));
    } catch (error: any) {
      console.error('Error updating task:', error);
      Alert.alert('Error', error.message || 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!token) {
      navigation.replace('SignIn');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/todos/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete task');
      }

      // Update local state
      setTasks(prev => prev.filter(task => task._id !== taskId));
      setFilteredTasks(prev => prev.filter(task => task._id !== taskId));
      setSelectedTaskId(null);
    } catch (error: any) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', error.message || 'Failed to delete task');
    }
  };

  // Function to refresh calendar dates (useful for date changes)
  const refreshCalendar = () => {
    const generatedDates = generateCalendarDates();
    setCalendarDates(generatedDates);
    
    // If selected date is not in the new range, select today
    const today = new Date().toISOString().split('T')[0];
    const isSelectedDateInRange = generatedDates.some(date => date.fullDate === selectedDate);
    if (!isSelectedDateInRange) {
      setSelectedDate(today);
    }
  };

  const renderCalendarDate = ({ item }: { item: { day: string; date: number; fullDate: string } }) => {
    const isToday = item.fullDate === new Date().toISOString().split('T')[0];
    
    return (
      <TouchableOpacity
        style={[
          styles.dateItem, 
          selectedDate === item.fullDate && styles.selectedDateItem,
          isToday && !selectedDate && styles.todayDateItem
        ]}
        onPress={() => setSelectedDate(item.fullDate)}
      >
        <Text style={[
          styles.dayText, 
          selectedDate === item.fullDate && styles.selectedDayText,
          isToday && styles.todayDayText
        ]}>
          {item.day}
        </Text>
        <Text style={[
          styles.dateText, 
          selectedDate === item.fullDate && styles.selectedDateText,
          isToday && styles.todayDateText
        ]}>
          {item.date}
        </Text>
        {isToday && (
          <View style={styles.todayIndicator} />
        )}
      </TouchableOpacity>
    );
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskContainer}>
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => handleTaskPress(item)}
      >
        <TouchableOpacity
          style={[styles.circle, item.completed && styles.completedCircle]}
          onPress={(e) => {
            e.stopPropagation();
            toggleTaskCompletion(item._id);
          }}
        >
          {item.completed && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </TouchableOpacity>

        <View style={styles.taskTextContainer}>
          <Text 
            style={[styles.taskTitle, item.completed && styles.completedTaskTitle]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
          <Text 
            style={styles.taskTime}
            numberOfLines={1}
          >
            {item.timePosted}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => setSelectedTaskId(prev => (prev === item._id ? null : item._id))}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </TouchableOpacity>

      {selectedTaskId === item._id && (
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
            onPress={() => deleteTask(item._id)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={[styles.optionText, { color: '#ef4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const handleProfilePress = () => {
    if (user) {
      navigation.navigate('Profile');
    } else {
      navigation.replace('SignIn');
    }
  };

  // Add this new function to handle task selection
  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
  };

  const renderTaskDetails = () => {
    if (!selectedTask) return null;

    return (
      <Modal
        visible={!!selectedTask}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTask(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedTask(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalDate}>{selectedTask.datePosted}</Text>
                  <Text style={styles.modalTime}>{selectedTask.timePosted}</Text>
                </View>

                <Text style={styles.modalTitle}>{selectedTask.title}</Text>
                <Text style={styles.modalDescription}>{selectedTask.description}</Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setSelectedTask(null);
                      navigation.navigate('EditScreen', { task: selectedTask });
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color="#6366f1" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={() => {
                      deleteTask(selectedTask._id);
                      setSelectedTask(null);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  // Effect to handle refresh from navigation params
  useEffect(() => {
    if (route.params?.refresh) {
      fetchTasks(selectedDate);
    }
  }, [route.params?.refresh, route.params?.timestamp]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTasks(selectedDate);
    setIsRefreshing(false);
  }, [selectedDate]);

  return (
    <TouchableWithoutFeedback onPress={() => {
      setSelectedTaskId(null);
      setIsSidePanelOpen(false);
    }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
        <LinearGradient colors={["#6366f1", "#8b5cf6", "#a855f7"]} style={styles.gradient}>

          <View style={styles.header}>
            {/* <TouchableOpacity onPress={() => setIsSidePanelOpen(true)}>
              <Ionicons name="menu" size={24} color="white" />
            </TouchableOpacity> */}
            <Text style={styles.logo}>Tidy Doc</Text>
            <TouchableOpacity onPress={handleProfilePress}>
              <View style={styles.profilePicture}>
                <Ionicons name={user ? "person" : "person-outline"} size={20} color="#6366f1" />
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

          <FlatList
            style={styles.tasksContainer}
            contentContainerStyle={{ flexGrow: 1 }}
            data={isLoading ? Array(4).fill({}) : filteredTasks}
            renderItem={isLoading ? () => <ShimmerCard /> : renderTask}
            keyExtractor={(item, index) => isLoading ? index.toString() : item._id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor="#6366f1"
              />
            }
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No tasks found</Text>
                </View>
              ) : null
            }
          />

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

          {/* <SidePanel 
            isOpen={isSidePanelOpen}
            onClose={() => setIsSidePanelOpen(false)}
            navigation={navigation}
          /> */}

          {renderTaskDetails()}
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
  logo: { fontSize: 22, fontWeight: '600', color: 'white' },
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
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
  searchIcon: { 
    marginRight: 10 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    color: '#374151',
    height: '100%',
  },
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
    position: 'relative',
  },
  selectedDateItem: { backgroundColor: 'rgba(255,255,255,0.9)' },
  todayDateItem: { 
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  dayText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  selectedDayText: { color: '#6366f1' },
  todayDayText: { color: 'white', fontWeight: '700' },
  dateText: { fontSize: 16, fontWeight: '700', color: 'white' },
  selectedDateText: { color: '#6366f1' },
  todayDateText: { color: 'white', fontWeight: '800' },
  todayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
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
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 20,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    minHeight: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99,102,241,0.1)',
  },
  modalDate: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  modalTime: {
    fontSize: 15,
    color: '#6366f1',
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 32,
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  shimmerCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: 15,
  },
  shimmerTitle: {
    width: '60%',
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 8,
  },
  shimmerTime: {
    width: '40%',
    height: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  taskContainer: {
    width: '100%',
    marginBottom: 8,
  },
});