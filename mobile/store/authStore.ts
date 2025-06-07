import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean }>;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
}

const API_URL = 'http://192.168.99.42:3000/api'; 0

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  
  register: async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('token', data.token);

      set({ user: data.user, token: data.token });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false };
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('token', data.token);

      set({ user: data.user, token: data.token });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      set({ user: null, token: null });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}));