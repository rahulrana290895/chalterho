import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BASE_URL} from './config/config';
import {useTranslation} from 'react-i18next';

export default function NotificationScreen({navigation, route}) {
  const {t} = useTranslation();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');

      if (!uid) {
        setNotifications([]);
        return;
      }

      const response = await fetch(
        `${BASE_URL}get_notifications.php?uid=${encodeURIComponent(uid)}`,
      );

      const result = await response.json();
      setNotifications(result.data || []);
    } catch (error) {
      console.log('User data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="orangered"
            style={{marginTop: 30}}
          />
        ) : notifications.length === 0 ? (
          <Text style={styles.emptyText}>{t('noNotifications')}</Text>
        ) : (
          notifications.map(item => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.message}>
                {t('plansReadyFor')}
                {'\n'}
                {t('vehicleNumber')}{' '}
                <Text style={styles.bold}>{item.vehicle_number}</Text>
                {'\n'}
                {t('forState')}{' '}
                <Text style={styles.bold}>{item.state}</Text>
                {'\n'}
                {t('pleaseCheckAndPay')}
              </Text>

              <TouchableOpacity
                style={styles.viewPlansButton}
                onPress={() =>
                  navigation.navigate('VehiclePlansScreen', {
                    vehicle_number: item.vehicle_number,
                    state: item.state,
                    chassis_number: item.chassis_number,
                  })
                }>
                <Text style={styles.viewPlansButtonText}>
                  {t('viewPlans')}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 0,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 10,
    elevation: 2,
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 23,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
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
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 15,
    color: '#777',
  },
});
