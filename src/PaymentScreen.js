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

import {BASE_URL} from './config/config';

export default function PaymentScreen({route, navigation}) {
  const vehicleData = route.params || {};

  const [taxData, setTaxData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTax();
    getWalletBalance();
  }, []);

  // =========================================================
  // GET WALLET BALANCE
  // =========================================================

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

  // =========================================================
  // CALCULATE PAYABLE AMOUNT
  // =========================================================

  const payableAmount = taxData
    ? walletBalance > 50
      ? Math.max(
          Number(taxData.total) - walletBalance,
          0,
        )
      : Number(taxData.total)
    : 0;

  // =========================================================
  // GET TAX
  // =========================================================

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

    // TAX NOT AVAILABLE
    if (
      !data ||
      data.status === false ||
      data.status === 'false' ||
      data.status === 0 ||
      data.status === '0' ||
      data.amount === null ||
      data.amount === undefined
    ) {
      setTaxData({
        taxAvailable: false,
      });
      return;
    }

    // TAX AVAILABLE
    setTaxData({
      ...data,
      taxAvailable: true,
    });

  } catch (e) {
    console.log('TAX ERROR:', e);

    setTaxData({
      taxAvailable: false,
    });
  }
};



  // =========================================================
  // CREATE RAZORPAY ORDER
  // =========================================================

  const createRazorpayOrder = async () => {
    try {
      if (loading) {
        return;
      }

      const userId =
        await AsyncStorage.getItem('userId');

      if (!userId) {
        Alert.alert(
          'Error',
          'User not found. Please login again.',
        );
        return;
      }

      if (!payableAmount || payableAmount <= 0) {
        Alert.alert(
          'Error',
          'Invalid payable amount.',
        );
        return;
      }

      setLoading(true);

      const formData = new FormData();

      formData.append(
        'amount',
        payableAmount.toString(),
      );

      formData.append(
        'uid',
        userId,
      );

      console.log(
        'CREATING RAZORPAY ORDER:',
        payableAmount,
      );

      const response = await fetch(
        `${BASE_URL}create-order.php`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const result = await response.json();

      console.log(
        'CREATE ORDER RESPONSE:',
        result,
      );

      if (!result.status) {
        setLoading(false);

        Alert.alert(
          'Payment Error',
          result.message ||
            'Unable to create payment order.',
        );

        return;
      }

      /*
       * result.amount_paise comes from create-order.php
       *
       * Example:
       *
       * ₹100
       * =
       * 10000 paise
       */

      openRazorpayCheckout(
        result.order_id,
        result.amount_paise,
      );
    } catch (error) {
      console.log(
        'CREATE ORDER ERROR:',
        error,
      );

      setLoading(false);

      Alert.alert(
        'Error',
        'Unable to create payment order.',
      );
    }
  };

  // =========================================================
  // OPEN RAZORPAY CHECKOUT
  // =========================================================

  const openRazorpayCheckout = (
    orderId,
    amountInPaise,
  ) => {
    try {
      const options = {
        description:
          'ChalteRho Vehicle Tax Payment',

        currency: 'INR',

        /*
         * IMPORTANT:
         * Put ONLY your Razorpay KEY ID here.
         *
         * Example:
         *
         * key: 'rzp_live_xxxxxxxxxxxx',
         *
         * NEVER put Key Secret here.
         */

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

      console.log(
        'RAZORPAY OPTIONS:',
        {
          order_id: orderId,
          amount: amountInPaise,
        },
      );

       RazorpayCheckout.open(options)
         .then(async data => {

           console.log('RAZORPAY SUCCESS:', data);

           try {

             const userId =
               await AsyncStorage.getItem('userId');

             const formData = new URLSearchParams();

             formData.append(
               'razorpay_payment_id',
               data.razorpay_payment_id
             );

             formData.append(
               'razorpay_order_id',
               data.razorpay_order_id
             );

             formData.append(
               'razorpay_signature',
               data.razorpay_signature
             );

             formData.append(
               'uid',
               userId || ''
             );

             formData.append(
               'phone_number',
               vehicleData.phone_number || ''
             );

             formData.append(
               'vehicle_number',
               vehicleData.vehicle_number || ''
             );

             formData.append(
               'chassis_number',
               vehicleData.chassis_number || ''
             );

             formData.append(
               'state',
               vehicleData.state || ''
             );

             formData.append(
               'category',
               vehicleData.category || ''
             );

             formData.append(
               'sub_category',
               vehicleData.sub_category || ''
             );

             formData.append(
               'start_date',
               vehicleData.start_date || ''
             );

             formData.append(
               'end_date',
               vehicleData.end_date || ''
             );

             formData.append(
               'no_of_seats',
               vehicleData.no_of_seats || ''
             );

             formData.append(
               'ac_type',
               vehicleData.ac_type || ''
             );

             formData.append(
               'amount',
               String(taxData?.amount || 0)
             );

             formData.append(
               'service_fees',
               String(taxData?.service_fees || 0)
             );

             formData.append(
               'payable',
               String(payableAmount || 0)
             );

             console.log(
               'VERIFYING RAZORPAY PAYMENT...'
             );

             const response = await fetch(
               `${BASE_URL}verify-payment.php`,
               {
                 method: 'POST',

                 headers: {
                   'Content-Type':
                     'application/x-www-form-urlencoded',
                 },

                 body: formData.toString(),
               }
             );

             const result =
               await response.json();

             console.log(
               'VERIFY PAYMENT RESPONSE:',
               result
             );

             setLoading(false);

             if (result.status === true) {

               Alert.alert(
                 'Payment Successful',
                 'Payment completed and saved successfully.',
                 [
                   {
                     text: 'OK',
                     onPress: () => {

                       navigation.replace(
                         'PaymentProcessingScreen',
                         {
                           paymentId:
                             result.payment_id,
                         }
                       );

                     }
                   }
                 ]
               );

             } else {

               Alert.alert(
                 'Payment Verification Failed',
                 result.message ||
                   'Payment verification failed.'
               );

             }

           } catch (error) {

             console.log(
               'VERIFY PAYMENT ERROR:',
               error
             );

             setLoading(false);

             Alert.alert(
               'Error',
               'Payment completed but verification failed. Please contact support.'
             );
           }

         })


        .catch(error => {
          console.log(
            'RAZORPAY ERROR:',
            error,
          );

          setLoading(false);

          /*
           * Error code 0 generally means
           * user cancelled the checkout.
           */

          if (
            error &&
            error.code === 0
          ) {
            Alert.alert(
              'Payment Cancelled',
              'You cancelled the payment.',
            );
          } else {
            Alert.alert(
              'Payment Failed',
              error?.description ||
                'Payment was cancelled or failed.',
            );
          }
        });
    } catch (error) {
      console.log(
        'RAZORPAY CHECKOUT ERROR:',
        error,
      );

      setLoading(false);

      Alert.alert(
        'Error',
        'Unable to open Razorpay.',
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}>

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }>

        {/* ================================
            HEADING
        ================================= */}

        <Text style={styles.heading}>
          Payment Details
        </Text>

        {/* ================================
            TAX DETAILS
        ================================= */}

        {taxData && taxData.taxAvailable === true && (
          <View style={styles.card}>

            <Text style={styles.title}>
              Tax Details
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Tax
              </Text>

              <Text style={styles.priceValue}>
                ₹{Number(taxData.amount || 0)}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Service Fees
              </Text>

              <Text style={styles.priceValue}>
                ₹
                {Number(
                  taxData.service_fees || 0,
                )}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                Sub Total
              </Text>

              <Text style={styles.priceValue}>
                ₹
                {Number(
                  taxData.total || 0,
                )}
              </Text>
            </View>

            {/* WALLET */}

            {walletBalance > 50 && (
              <View style={styles.walletBox}>

                <View>
                  <Text style={styles.walletTitle}>
                    Wallet Balance
                  </Text>

                  <Text style={styles.walletText}>
                    ₹{walletBalance}
                  </Text>
                </View>

                <Text style={styles.walletApplied}>
                  Applied
                </Text>

              </View>
            )}

            {/* PAYABLE */}

            <View style={styles.payableBox}>

              <Text style={styles.payableLabel}>
                Payable Amount
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
              Tax Calculation Unavailable
            </Text>

            <Text style={styles.taxNotAvailableText}>
              We are unable to calculate the vehicle tax
              for the details provided.
            </Text>

            <Text style={styles.contactText}>
              Please contact us on WhatsApp or call us
              to know the applicable tax amount.
            </Text>

            <View style={styles.contactBox}>

              <Text style={styles.contactLabel}>
                WhatsApp / Contact
              </Text>

              <Text style={styles.contactNumber}>
                +91-9625065008
              </Text>

            </View>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => {
                // WhatsApp / call action yahan laga sakte hain
              }}
            >
              <Text style={styles.contactButtonText}>
                Contact Us
              </Text>
            </TouchableOpacity>

          </View>
        )}

        {/* ================================
            PAYMENT INFORMATION
        ================================= */}

        <View style={styles.card}>

          <Text style={styles.title}>
            Secure Payment
          </Text>

          <Text style={styles.infoText}>
            Pay securely using Razorpay.
            You can choose an available payment
            method such as UPI, Card or Net Banking
            on the Razorpay payment screen.
          </Text>

          <View style={styles.secureBox}>

            <Text style={styles.secureIcon}>
              🔒
            </Text>

            <View style={styles.secureContent}>

              <Text style={styles.secureTitle}>
                Secure Payment
              </Text>

              <Text style={styles.secureText}>
                Your payment is securely processed
                through Razorpay.
              </Text>

            </View>

          </View>

        </View>

        {/* ================================
            PAY BUTTON
        ================================= */}

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
            {
              marginLeft: 10,
            },
          ]}
        >
          Processing...
        </Text>
      </>
    ) : (
      <Text style={styles.payText}>
        Pay ₹{payableAmount}
      </Text>
    )}
  </TouchableOpacity>
)}

      </ScrollView>
    </SafeAreaView>
  );
}

// =========================================================
// STYLES
// =========================================================

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