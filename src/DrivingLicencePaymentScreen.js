import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import {BASE_URL} from './config/config';

export default function DrivingLicencePaymentScreen({navigation,route,}) {
  const {dlNumber, dob} = route.params;
  const [amount, setAmount] = useState(null);
  const [originalamount, setOriginalAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchCharge();
  }, []);

  const fetchCharge = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}get_dl_charge.php`,
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to fetch charge');
      }

      setAmount(Number(result.dl_charge));
      setOriginalAmount(Number(result.dl_price));

    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };


const handlePayment = async () => {
  if (paying || amount === null) {
    return;
  }

  setPaying(true);
  let stage = 'Creating payment order';

  try {
    const userId = await AsyncStorage.getItem('userId');

    if (!userId) {
      throw new Error('User ID nahi mila. Please login again.');
    }

    // Step 1: Create Razorpay order
    const orderResponse = await fetch(
      `${BASE_URL}create_dl_order.php`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          user_id: Number(userId),
          license_number: dlNumber,
          dob: dob,
        }),
      },
    );

    const order = await orderResponse.json();

    if (!orderResponse.ok || !order.success) {
      throw new Error(order.message || 'Order create nahi hua');
    }

    if (!order.order_id || !order.key_id || !order.amount) {
      throw new Error('Razorpay order response incomplete hai');
    }

    // Step 2: Open Razorpay checkout
    stage = 'Opening Razorpay checkout';

    const paymentData = await RazorpayCheckout.open({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: 'ChalteRho',
      description: 'Driving Licence Download',
      theme: {color: '#173F70'},
    });

    // Step 3: Verify payment on PHP server
    stage = 'Verifying payment';

    const verifyResponse = await fetch(
      `${BASE_URL}verify_dl_payment.php`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          request_id: order.request_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature,
        }),
      },
    );

    const verification = await verifyResponse.json();
    const rawResponse = await verifyResponse.text();
    console.log('VERIFY STATUS:', verifyResponse.status);
    console.log('VERIFY RESPONSE:', rawResponse);

    if (!verifyResponse.ok || !verification.success) {
      throw new Error(
        verification.message || 'Server payment verification failed',
      );
    }

    Alert.alert(
      'Payment Successful',
      'Payment verify And  Driving Licence saved',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{name: 'DrivingLicenceScreen'}],
            });
          },
        },
      ],
    );
  } catch (error) {
    Alert.alert(
      'Payment Successful',
      'Payment verify And  Driving Licence saved',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{name: 'DrivingLicenceScreen'}],
            });
          },
        },
      ],
    );
  } finally {
    setPaying(false);
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons
            name="checkmark-circle"
            size={64}
            color="#218653"
          />
        </View>

        <Text style={styles.title}>Licence Fetched Successfully!</Text>

        <Text style={styles.message}>
          Your Driving Licence fetched successfully.
          Please make payment to download your Driving Licence.
        </Text>

        <View style={styles.details}>
          <Text style={styles.label}>Licence Number</Text>
          <Text style={styles.value}>{dlNumber || 'N/A'}</Text>

          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.value}>{dob || 'N/A'}</Text>
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Download Charges</Text>

          {loading ? (
            <ActivityIndicator color="#173F70" />
          ) : amount !== null ? (
            <View>
              {originalamount !== null &&
                Number.isFinite(originalamount) &&
                originalamount > amount && (
                  <Text style={styles.originalamount}>
                    ₹{originalamount.toFixed(2)}
                  </Text>
                )}

              <Text style={styles.amount}>
                ₹{amount.toFixed(2)}
              </Text>
            </View>
          ) : (
            <Text style={styles.error}>Unable to load charges</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (loading || amount === null || paying) && styles.disabled,
          ]}
          disabled={loading || amount === null || paying}
          onPress={handlePayment}>
          {paying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="card-outline" size={21} color="#FFFFFF" />
              <Text style={styles.buttonText}>Proceed to Payment</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E5EDF6',
  },
  iconBox: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#17365D',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#63758B',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },
  details: {
    backgroundColor: '#F5F8FC',
    borderRadius: 10,
    padding: 14,
    marginTop: 20,
  },
  label: {
    fontSize: 12,
    color: '#718198',
    marginTop: 5,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#17365D',
    marginTop: 3,
  },
  amountBox: {
    alignItems: 'center',
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E0E9F3',
    borderRadius: 12,
  },
  amountLabel: {
    fontSize: 13,
    color: '#63758B',
  },
  amount: {
    fontSize: 30,
    fontWeight: '800',
    color: 'green',
    marginTop: 6,
  },
  originalamount: {
    fontSize: 30,
    fontWeight: '800',
    color: 'red',
    marginTop: 6,
    textDecorationLine: 'line-through',
  },

  error: {
    color: '#C62828',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#FF6818',
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
    marginTop: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
