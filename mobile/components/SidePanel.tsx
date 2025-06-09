import { StyleSheet, Text, View, Animated, TouchableOpacity, Image } from 'react-native';
import React, { useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: any;
}

const SidePanel = ({ isOpen, onClose, navigation }: SidePanelProps) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const handleEditProfile = () => {
    onClose();
    navigation.navigate('EditProfile');
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.profileImage}
          />
          <View style={styles.headerText}>
            <Text style={styles.userName}>Hello User</Text>
            <Text style={styles.userEmail}>user@example.com</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <Text>
            <Ionicons name="person-outline" size={22} color="#6366f1" />
          </Text>
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text>
            <Ionicons name="grid-outline" size={22} color="#6366f1" />
          </Text>
          <Text style={styles.menuText}>Categories</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text>
            <Ionicons name="star-outline" size={22} color="#6366f1" />
          </Text>
          <Text style={styles.menuText}>Important Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text>
            <Ionicons name="checkmark-done-outline" size={22} color="#6366f1" />
          </Text>
          <Text style={styles.menuText}>Done Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logout]}>
          <Text>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          </Text>
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default SidePanel;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: 'white',
    zIndex: 999,
    elevation: 999,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerGradient: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  headerText: {
    marginLeft: 15,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuText: {
    color: '#374151',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  logout: {
    marginTop: 'auto',
    marginBottom: 30,
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  logoutText: {
    color: '#ef4444',
  },
});