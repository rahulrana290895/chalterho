import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL, ASSETS_URL } from './config/config';

export default function ServiceDetailScreen({ route, navigation }) {
  const { service } = route.params;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServiceDetail();
  }, []);

  const getServiceDetail = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}get_services.php?id=${service.id}`
      );

      const json = await response.json();

      if (json.status && json.data.length > 0) {
        setDetail(json.data[0]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const callNow = () => {
    Linking.openURL('tel:+919625065008');
  };

  const whatsappNow = () => {
    Linking.openURL(
      'https://wa.me/919625065008'
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="orangered" />
      </View>
    );
  }

  return (
  <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
    <ScrollView style={styles.container}>


      {/* Image */}
      <Image
        source={{
          uri: `${ASSETS_URL}image/${detail?.image}`,
        }}
        style={styles.image}
      />

      {/* Name */}
      <Text style={styles.title}>
        {detail?.name}
      </Text>

      {/* Detail */}
      <View style={styles.card}>
        <Text style={styles.detailText}>
          {detail?.detail}
        </Text>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.callBtn}
        onPress={callNow}
      >
        <Ionicons
          name="call"
          size={20}
          color="#fff"
        />

        <Text style={styles.btnText}>
          Call : +91-9625065008
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.whatsappBtn}
        onPress={whatsappNow}
      >
        <Ionicons
          name="logo-whatsapp"
          size={20}
          color="#fff"
        />

        <Text style={styles.btnText}>
          WhatsApp : +91-9625065008
        </Text>
      </TouchableOpacity>

    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    backgroundColor: 'orangered',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  image: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 20,
  },

  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 10,
  },

  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
  },

  detailText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
  },

  callBtn: {
    backgroundColor: '#ff5722',
    marginHorizontal: 15,
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  whatsappBtn: {
    backgroundColor: '#25D366',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});