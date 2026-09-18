import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BASE_URL, ASSETS_URL } from './config/config';

export default function HomeScreen({ navigation }) {
  const [services, setServices] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices();
    getBalance();
  }, []);
  const getBalance = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');

      const response = await fetch(
        `${BASE_URL}get-balance.php?uid=${uid}`,
      );

      const result = await response.json();

      if (result.status) {
        setBalance(result.balance);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getServices = async () => {
    try {
      const response = await fetch(`${BASE_URL}services.php`);
      const data = await response.json();

      const vehicleTaxService = {
        id: 'vehicle_tax',
        name: 'Vehicle Tax',
        image: 'https://chalterho.com/app-assets/img/services/tax.png',
        isStatic: true,
      };

      setServices([vehicleTaxService, ...data]);
    } catch (error) {
      console.log('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderService = ({ item }) => (
    <TouchableOpacity
      style={styles.serviceItem}
      activeOpacity={0.8}
      onPress={() => {
        if (item.isStatic) {
          navigation.navigate('VehicleTexScreen');
        } else {
          navigation.navigate('ServiceDetailScreen', {
            service: item,
          });
        }
      }}
    >
      <Image
        source={{
          uri: item.isStatic
            ? item.image
            : `${ASSETS_URL}image/${item.image}`,
        }}
        style={styles.icon}
      />

      <Text numberOfLines={2} style={styles.serviceName}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="orangered" />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor="#ffffff"
        barStyle="dark-content"
      />

      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >

        {/* Header */}
<View style={styles.header}>
  <View style={styles.leftSection}>
    <Image
      source={require('./assets/logo.png')}
      style={styles.logo}
    />

    <Text style={styles.headerTitle}>
      ChalteRho
    </Text>
  </View>

  <View style={styles.rightSection}>
    <Text style={styles.balanceText}>
      ₹{balance}
    </Text>

    <TouchableOpacity
      onPress={() => navigation.navigate('MoreScreen')}>
      <Ionicons
        name="menu-outline"
        size={28}
        color="#000"
      />
    </TouchableOpacity>
  </View>
</View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={require('./assets/banner.jpg')}
            style={styles.banner}
          />
        </View>

        {/* Services */}
        <View style={styles.cardContainer}>
          <Text style={styles.sectionTitle}>
            Vehicle Services
          </Text>

          <FlatList
            data={services}
            renderItem={renderService}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 0,
            }}
          />
        </View>

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            This App is not affiliated with any government authority.
          </Text>
        </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
    bannerContainer: {
      marginHorizontal: 12,
      marginTop: 12,
      borderRadius: 15,
      overflow: 'hidden',
      backgroundColor: '#fff',
      elevation: 3,
    },

    banner: {
      width: '100%',
      height: 180,
      resizeMode: 'cover',
    },

  container: {
    flex: 1,
    backgroundColor: '#f3f5f9',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 3,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'orangered',
  },

  cardContainer: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 16,
    paddingVertical: 15,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginLeft: 15,
    marginBottom: 15,
  },

  serviceItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 22,
    paddingHorizontal: 5,
  },

  icon: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
    marginBottom: 1,
  },

  serviceName: {
    textAlign: 'center',
    fontSize: 12,
    color: '#222',
    fontWeight: '600',
    lineHeight: 16,
  },

  disclaimerContainer: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#FFE69C',
  },

  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#856404',
    fontWeight: '500',
  },
rightSection: {
  flexDirection: 'row',
  alignItems: 'center',
},

balanceText: {
  backgroundColor: '#E8F5E9',
  color: '#2E7D32',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 15,
  fontSize: 14,
  fontWeight: '700',
  marginRight: 10,
},

});