
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BASE_URL} from './config/config';

export default function NotificationScreen({navigation, route}) {
const [notifications, setNotifications] = useState([]);

useEffect(() => {
  loadUserData();
}, []);

const loadUserData = async () => {
  try {
    const uid = await AsyncStorage.getItem('userId');
    const response = await fetch(
      `${BASE_URL}get_notifications.php?uid=${encodeURIComponent(uid)}`,
    );
    const result = await response.json();
    setNotifications(result.data || []);
  } catch (error) {
    console.log('User data error:', error);
  }
};

return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView>
          {notifications.map(item => (
            <View key={item.id} style={styles.card}>
              <Text>Plans ready for
                Vehicle Number{' '}
                <Text style={{fontWeight: 'bold'}}>
                  {item.vehicle_number}
                </Text>
                {' '}for State{' '}
                <Text style={{fontWeight: 'bold'}}>
                  {item.state}
                </Text>
                 {' '}please check And Pay.
              </Text>
    <TouchableOpacity
       style={styles.viewPlansButton}
          onPress={() =>
            navigation.navigate('VehiclePlansScreen', {
              vehicle_number: item.vehicle_number,
              state: item.state,
              chassis_number: item.chassis_number
            })
          }
        >
      <Text style={styles.viewPlansButtonText}>View Plans</Text>
    </TouchableOpacity>

            </View>
          ))}
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding:0,
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: 'orangered',
  },
  viewPlansButton: {
    backgroundColor: 'orangered',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  viewPlansButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
