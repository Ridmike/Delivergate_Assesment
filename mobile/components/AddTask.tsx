import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { useAuthStore } from '../store/authStore';

type AddTaskScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddTask = () => {
  const navigation = useNavigation<AddTaskScreenNavigationProp>();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);


  const API_URL = 'http://192.168.1.11:3000/api';
  const { token } = useAuthStore(); // Get token from auth store

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
  try {
    if (!title.trim() || !description.trim() || !time) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Please sign in to add tasks');
      navigation.navigate('SignIn');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      datePosted: formatDate(date),
      timePosted: time,
      important: false,
      completed: false,
    };

    console.log('Sending request to:', `${API_URL}/todos`);
    console.log('Request data:', taskData);
    console.log('Auth token:', token ? 'Present' : 'Missing');

    const response = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        datePosted: formatDate(date),
        timePosted: time,
        important: false,
        completed: false,
      }),
    });    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(
        data.error || data.message || `Server error (${response.status})`
      );
    }
    
    Alert.alert('Success', 'Task added successfully!');
    setDate(new Date());
    setTime('');
    setTitle('');
    setDescription('');
    navigation.goBack(); 
  } catch (error: any) {
    console.error('Error adding task:', error);
    
    if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please check your internet connection.'
      );
    } else {
      Alert.alert('Error', error.message || 'Failed to add task');
    }
  }
};

  return (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6', '#a855f7']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.header}>Add Today's Task</Text>

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
            <Ionicons name="add" size={16} color="white" />
            <Text style={styles.addButtonText}>Add</Text>
         </TouchableOpacity>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default AddTask;

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
