import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {BASE_URL} from './config/config';

export default function PaymentProcessingScreen({
  navigation,
  route,
}) {
  const [time, setTime] = useState(300);

  const paymentId = route?.params?.paymentId;

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Payment Status Check
  useEffect(() => {
    if (!paymentId) {
      console.log('Payment ID Missing');
      return;
    }

    console.log('Payment ID:', paymentId);

    const interval = setInterval(async () => {
      try {
        const url =
          `${BASE_URL}check-status.php?id=${paymentId}`;

        console.log('Checking:', url);

        const response = await fetch(url);

        const result = await response.json();

        if (result.payment_status === 'Completed') {
          clearInterval(interval);

          navigation.replace(
            'PaymentCompletedScreen',
            {
              paymentId: result.docs,
            },
          );
        }

        if (
          result.payment_status === 'Reject'
        ) {
          clearInterval(interval);

          navigation.replace(
            'PaymentRejectedScreen',
            {
              paymentId: paymentId,
            },
          );
        }
      } catch (error) {
        console.log(
          'Status Check Error:',
          error,
        );

        Alert.alert(
          'Error',
          error.message,
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentId, navigation]);

  const minutes = String(
    Math.floor(time / 60),
  ).padStart(2, '0');

  const seconds = String(
    time % 60,
  ).padStart(2, '0');

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri: 'https://chalterho.com/app-assets/img/process.png',
          }}
          style={styles.image}
        />

        <Text style={styles.message}>
          Request Successful! Your request is in
          process. It may take few minutes for
          approval.
        </Text>

        <Text style={styles.timer}>
          {time > 0
            ? `${minutes}:${seconds}`
            : 'Time Completed'}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate('MainTabs')
          }>
          <Text style={styles.buttonText}>
            Back To Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },

  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },

  message: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },

  timer: {
    marginTop: 20,
    fontSize: 32,
    fontWeight: 'bold',
    color: 'red',
  },

  button: {
    marginTop: 25,
    backgroundColor: '#ffc107',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },

  buttonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});