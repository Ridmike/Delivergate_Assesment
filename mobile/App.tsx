import { StyleSheet, Text, View } from 'react-native';
import Home from './components/Home';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import TaskDetails from './Screens/TaskDetails';
import { Task } from './types';
import AddTask from './components/AddTask';
import EditScreen from './Screens/EditScreen';
import SignUp from './Screens/SignUp';
import SignIn from './Screens/SignIn';
import Profile from './Screens/ProfileScreen';

export type RootStackParamList = {
  Home: undefined;
  TaskDetails: { task: Task };
  AddTask: undefined;
  EditScreen: { task: Task };
  SignUp: undefined;
  SignIn: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="TaskDetails" component={TaskDetails} options={{ headerShown: false }} />
            <Stack.Screen name="AddTask" component={AddTask} options={{ headerShown: false }} />
            <Stack.Screen name="EditScreen" component={EditScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
            <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

