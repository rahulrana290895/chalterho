import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';

export default function MoreScreen({ navigation }) {

  const logout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            await AsyncStorage.clear();

            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScreen' }],
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>

      <View style={styles.profileCard}>
        <Ionicons
          name="person-circle"
          size={80}
          color="orangered"
        />

        <Text style={styles.title}>
          ChalteRho
        </Text>

        <Text style={styles.subtitle}>
          Manage your account settings
        </Text>
      </View>

      <View style={styles.menuCard}>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('AboutUs')}
      >
        <Ionicons
          name="information-circle-outline"
          size={22}
        />

        <Text style={styles.menuText}>
          About Us
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('ReferEarnScreen')}
      >
        <Ionicons
          name="gift-outline"
          size={22}
        />

        <Text style={styles.menuText}>
          Refer & Earn
        </Text>
      </TouchableOpacity>


      </View>



      <TouchableOpacity
        style={styles.logoutBtn}
        activeOpacity={0.8}
        onPress={logout}
      >
        <Ionicons
          name="log-out-outline"
          size={22}
          color="#fff"
        />

        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 16,
  },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 25,
    elevation: 3,
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  menuText: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },

  logoutBtn: {
    backgroundColor: '#ff4d4f',
    height: 55,
    borderRadius: 14,
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    elevation: 3,
  },

  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});