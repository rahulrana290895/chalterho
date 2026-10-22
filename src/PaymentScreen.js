import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

import {BASE_URL} from './config/config';

export default function PaymentScreen({route, navigation}) {
  const {t} = useTranslation();
  const vehicleData = route.params || {};

  const [taxData, setTaxData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTax();
    getWalletBalance();
  }, []);

  const getWalletBalance = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        console.log('User ID not found');
        return;
      }

      const formData = new FormData();
      formData.append('uid', userId);

      const response = await fetch(
        `${BASE_URL}wallet-balance.php`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const result = await response.json();
      console.log('WALLET RESPONSE:', result);

      if (result.status) {
        setWalletBalance(Number(result.balance) || 0);
      } else {
        setWalletBalance(0);
      }
    } catch (e) {
      console.log('WALLET ERROR:', e);
      setWalletBalance(0);
    }
  };

  const payableAmount = taxData
    ? walletBalance > 50
      ? Math.max(Number(taxData.total) - walletBalance, 0)
      : Number(taxData.total)
    : 0;

  const getTax = async () => {
    try {
      const formData = new FormData();

      formData.append('state', vehicleData.state || '');
      formData.append('category', vehicleData.category || '');
      formData.append('sub_category', vehicleData.sub_category || '');
      formData.append('duration', vehicleData.duration || '');
      formData.append('no_of_seats', vehicleData.no_of_seats || '');
      formData.append('ac_type', vehicleData.ac_type || '');
      formData.append(
        'vehicleNumber',
        vehicleData.vehicle_number || '',
      );

      const response = await fetch(
        `${BASE_URL}calculate-tax.php`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = await response.json();
      console.log('TAX RESPONSE:', data);

      if (
        !data ||
        data.status === false ||
        data.status === 'false' ||
        data.status === 0 ||
        data.status === '0' ||
        data.amount === null ||
        data.amount === undefined
      ) {
        setTaxData({taxAvailable: false});
        return;
      }

      setTaxData({
        ...data,
        taxAvailable: true,
      });
    } catch (e) {
      console.log('TAX ERROR:', e);
      setTaxData({taxAvailable: false});
    }
  };

  const createRazorpayOrder = async () => {
    try {
      if (loading) {
        return;
      }

      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        Alert.alert(t('error'), t('userNotFound'));
        return;
      }

      if (!payableAmount || payableAmount <= 0) {
        Alert.alert(t('error'), t('invalidPayableAmount'));
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append('amount', payableAmount.toString());
      formData.append('uid', userId);

      console.log('CREATING RAZORPAY ORDER:', payableAmount);

      const response = await fetch(
        `${BASE_URL}create-order.php`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const result = await response.json();
      console.log('CREATE ORDER RESPONSE:', result);

      if (!result.status) {
        setLoading(false);

        Alert.alert(
          t('paymentError'),
          result.message || t('unableToCreateOrder'),
        );

        return;
      }

      openRazorpayCheckout(
        result.order_id,
        result.amount_paise,
      );
    } catch (error) {
      console.log('CREATE ORDER ERROR:', error);
      setLoading(false);

      Alert.alert(t('error'), t('unableToCreateOrder'));
    }
  };

  const openRazorpayCheckout = (orderId, amountInPaise) => {
    try {
      const options = {
        description: 'ChalteRho Vehicle Tax Payment',
        currency: 'INR',
        key: 'rzp_live_Ti9VSv6hnwIfKs',
        amount: Number(amountInPaise),
        name: 'ChalteRho',
        order_id: orderId,

        prefill: {
          name: vehicleData.name || 'ChalteRho User',
          email: vehicleData.email || 'test@example.com',
          contact: vehicleData.phone_number || '',
        },

        theme: {
          color: '#ff4500',
        },
      };

      console.log('RAZORPAY OPTIONS:', {
        order_id: orderId,
        amount: amountInPaise,
      });

      RazorpayCheckout.open(options)
        .then(async data => {
          console.log('RAZORPAY SUCCESS:', data);

          try {
            const userId = await AsyncStorage.getItem('userId');
            const formData = new URLSearchParams();

            formData.append(
              'razorpay_payment_id',
              data.razorpay_payment_id,
            );

            formData.append(
              'razorpay_order_id',
              data.razorpay_order_id,
            );

            formData.append(
              'razorpay_signature',
              data.razorpay_signature,
            );

            formData.append('uid', userId || '');
            formData.append(
              'phone_number',
              vehicleData.phone_number || '',
            );
            formData.append(
              'vehicle_number',
              vehicleData.vehicle_number || '',
            );
            formData.append(
              'chassis_number',
              vehicleData.chassis_number || '',
            );
            formData.append('state', vehicleData.state || '');
            formData.append('category', vehicleData.category || '');
            formData.append(
              'sub_category',
              vehicleData.sub_category || '',
            );
            formData.append(
              'start_date',
              vehicleData.start_date || '',
            );
            formData.append(
              'end_date',
              vehicleData.end_date || '',
            );
            formData.append(
              'no_of_seats',
              vehicleData.no_of_seats || '',
            );
            formData.append('ac_type', vehicleData.ac_type || '');
            formData.append(
              'amount',
              String(taxData?.amount || 0),
            );
            formData.append(
              'service_fees',
              String(taxData?.service_fees || 0),
            );
            formData.append(
              'payable',
              String(payableAmount || 0),
            );

            console.log('VERIFYING RAZORPAY PAYMENT...');

            const response = await fetch(
              `${BASE_URL}verify-payment.php`,
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
              },
            );

            const result = await response.json();

            console.log('VERIFY PAYMENT RESPONSE:', result);
            setLoading(false);

            if (result.status === true) {
              Alert.alert(
                t('paymentSuccessful'),
                t('paymentSavedSuccessfully'),
                [
                  {
                    text: t('ok'),
                    onPress: () => {
                      navigation.replace(
                        'PaymentProcessingScreen',
                        {
                          paymentId: result.payment_id,
                        },
                      );
                    },
                  },
                ],
              );
            } else {
              Alert.alert(
                t('paymentVerificationFailed'),
                result.message ||
                  t('paymentVerificationFailedMessage'),
              );
            }
          } catch (error) {
            console.log('VERIFY PAYMENT ERROR:', error);
            setLoading(false);

            Alert.alert(
              t('error'),
              t('verificationFailedContactSupport'),
            );
          }
        })
        .catch(error => {
          console.log('RAZORPAY ERROR:', error);
          setLoading(false);

          if (error && error.code === 0) {
            Alert.alert(
              t('paymentCancelled'),
              t('youCancelledPayment'),
            );
          } else {
            Alert.alert(
              t('paymentFailed'),
              error?.description ||
                t('paymentCancelledOrFailed'),
            );
          }
        });
    } catch (error) {
      console.log('RAZORPAY CHECKOUT ERROR:', error);
      setLoading(false);

      Alert.alert(t('error'), t('unableToOpenRazorpay'));
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.heading}>
          {t('paymentDetails')}
        </Text>

        {taxData && taxData.taxAvailable === true && (
          <View style={styles.card}>
            <Text style={styles.title}>
              {t('taxDetails')}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {t('tax')}
              </Text>

              <Text style={styles.priceValue}>
                ₹{Number(taxData.amount || 0)}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {t('serviceFees')}
              </Text>

              <Text style={styles.priceValue}>
                ₹{Number(taxData.service_fees || 0)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {t('subTotal')}
              </Text>

              <Text style={styles.priceValue}>
                ₹{Number(taxData.total || 0)}
              </Text>
            </View>

            {walletBalance > 50 && (
              <View style={styles.walletBox}>
                <View>
                  <Text style={styles.walletTitle}>
                    {t('walletBalance')}
                  </Text>

                  <Text style={styles.walletText}>
                    ₹{walletBalance}
                  </Text>
                </View>

                <Text style={styles.walletApplied}>
                  {t('applied')}
                </Text>
              </View>
            )}

            <View style={styles.payableBox}>
              <Text style={styles.payableLabel}>
                {t('payableAmount')}
              </Text>

              <Text style={styles.payableAmount}>
                ₹{payableAmount}
              </Text>
            </View>
          </View>
        )}

        {taxData && taxData.taxAvailable === false && (
          <View style={styles.taxNotAvailableCard}>
            <View style={styles.taxIconCircle}>
              <Text style={styles.taxIcon}>!</Text>
            </View>

            <Text style={styles.taxNotAvailableTitle}>
              {t('taxCalculationUnavailable')}
            </Text>

            <Text style={styles.taxNotAvailableText}>
              {t('unableToCalculateTax')}
            </Text>

            <Text style={styles.contactText}>
              {t('contactForTaxAmount')}
            </Text>

            <View style={styles.contactBox}>
              <Text style={styles.contactLabel}>
                {t('whatsappContact')}
              </Text>

              <Text style={styles.contactNumber}>
                +91-9625065008
              </Text>
            </View>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => {}}
            >
              <Text style={styles.contactButtonText}>
                {t('contactUs')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.title}>
            {t('securePayment')}
          </Text>

          <Text style={styles.infoText}>
            {t('securePaymentInfo')}
          </Text>

          <View style={styles.secureBox}>
            <Text style={styles.secureIcon}>🔒</Text>

            <View style={styles.secureContent}>
              <Text style={styles.secureTitle}>
                {t('securePayment')}
              </Text>

              <Text style={styles.secureText}>
                {t('paymentProcessedSecurely')}
              </Text>
            </View>
          </View>
        </View>

        {taxData && taxData.taxAvailable !== false && (
          <TouchableOpacity
            style={[
              styles.payBtn,
              loading && styles.payBtnDisabled,
            ]}
            onPress={createRazorpayOrder}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#fff"
                />

                <Text
                  style={[
                    styles.payText,
                    {marginLeft: 10},
                  ]}
                >
                  {t('processing')}
                </Text>
              </>
            ) : (
              <Text style={styles.payText}>
                {t('pay')} ₹{payableAmount}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },

  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 15,
    color: '#222',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#222',
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  priceLabel: {
    fontSize: 16,
    color: '#555',
  },

  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 10,
  },

  walletBox: {
    backgroundColor: '#eef9f0',
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  walletTitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },

  walletText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'green',
  },

  walletApplied: {
    backgroundColor: 'green',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },

  payableBox: {
    backgroundColor: '#fff4ed',
    borderRadius: 10,
    padding: 15,
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  payableLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },

  payableAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: 'orangered',
  },

  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },

  secureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    padding: 12,
    marginTop: 15,
  },

  secureIcon: {
    fontSize: 28,
    marginRight: 12,
  },

  secureContent: {
    flex: 1,
  },

  secureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginBottom: 3,
  },

  secureText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  payBtn: {
    backgroundColor: 'orangered',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 30,
    elevation: 3,
  },

  payBtnDisabled: {
    opacity: 0.7,
  },

  payText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  taxNotAvailableCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  taxIconCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#fff1e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  taxIcon: {
    fontSize: 30,
    fontWeight: '800',
    color: 'orangered',
  },

  taxNotAvailableTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
    textAlign: 'center',
    marginBottom: 10,
  },

  taxNotAvailableText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 10,
  },

  contactText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 15,
  },

  contactBox: {
    width: '100%',
    backgroundColor: 'green',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 15,
  },

  contactLabel: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 5,
  },

  contactNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },

  contactButton: {
    width: '100%',
    backgroundColor: 'orangered',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },

  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});