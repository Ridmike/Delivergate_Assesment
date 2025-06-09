import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useAuthStore } from '../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'EditScreen'>;

const EditScreen: React.FC<Props> = ({ route, navigation }) => {
  const { task } = route.params;
  const { token } = useAuthStore();
  const API_URL = Platform.select({
    android: 'http://192.168.1.11:3000/api',
    ios: 'http://localhost:3000/api',
    default: 'http://192.168.1.11:3000/api'
  });

  // Initialize state with existing task data
  const [date, setDate] = useState(() => {
    if (task?.datePosted) {
      const [year, month, day] = task.datePosted.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(task?.timePosted || '');
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Handle date selection
  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedTime = `${formattedHours.toString().padStart(2, '0')} : ${minutes
        .toString()
        .padStart(2, '0')} ${ampm}`;
      setTime(formattedTime);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !time) {
      Alert.alert('Error', 'Please fill in all fields before saving the task.');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Please sign in to update tasks');
      navigation.navigate('SignIn');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/todos/${task._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          datePosted: formatDate(date),
          timePosted: time
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task');
      }

      Alert.alert(
        'Success', 
        'Task updated successfully!', 
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Navigate to home screen and force a refresh
              navigation.navigate('Home', {
                refresh: true,
                timestamp: new Date().getTime() // Force refresh by passing new timestamp
              });
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error updating task:', error);
      Alert.alert('Error', error.message || 'Failed to update task');
    }
  };

  return (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6', '#a855f7']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.header}>Edit Task</Text>

        <View style={styles.card}>
          <Text style={styles.label}>SELECT DATE</Text>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)} 
            style={styles.input}
          >
            <Text style={styles.timeText}>{formatDate(date)}</Text>
            <Ionicons name="calendar-outline" size={18} color="gray" style={styles.timeIcon} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          <Text style={styles.label}>SELECT TIME</Text>
          <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
            <Text style={styles.timeText}>{time || '00 : 00  PM'}</Text>
            <Ionicons name="time-outline" size={18} color="gray" style={styles.timeIcon} />
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}

          <Text style={styles.label}>TASK TITLE</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Task Title"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>TASK DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter Task Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
            <Ionicons name="checkmark" size={16} color="white" />
            <Text style={styles.addButtonText}>Save</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default EditScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gradient: {
    flex: 1,
  },
  backButton: {
    marginTop: 10,
  },
  header: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    marginVertical: 20,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 14,
    color: '#374151',
  },
  timeIcon: {
    marginLeft: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: 20,
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
});
