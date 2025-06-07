import { StyleSheet, Text, View, Animated, TouchableOpacity, Image } from 'react-native';
import React, { useRef, useEffect } from 'react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SidePanel = ({ isOpen, onClose }: SidePanelProps) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
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

      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}>Categories</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}>Important Tasks</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <Text style={styles.menuText}>Done Tasks</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, styles.logout]}>
        <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>
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
    backgroundColor: '#DCC6F9',
    padding: 20,
    zIndex: 999,
    elevation: 999,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    marginLeft: 15,
  },
  userName: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    color: 'gray',
    fontSize: 14,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '',
  },
  menuText: {
    color: '',
    fontSize: 16,
  },
  logout: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  logoutText: {
    color: '#ff6b6b',
  },
});