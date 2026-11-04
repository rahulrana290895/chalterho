import React, {useState} from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {BASE_URL} from './config/config';

export default function PlanPaymentGatewayScreen({navigation, route}) {
  const {t} = useTranslation();
  const {planId, vehicleNumber = '', chassisNumber = '', state = '', duration = '', amount = 0, serviceFees = 0, payable = 0, additionalNote = ''} = route.params || {};

  const [loading, setLoading] = useState(false);

  const taxAmount = Number(amount) || 0;
  const fees = Number(serviceFees) || 0;
  const total = Number(payable) || taxAmount + fees;

  const createRazorpayOrder = async () => {
    if (loading) return;

    if (!vehicleNumber || !state || !planId) {
      Alert.alert(t('error'), t('planDetailsMissing'));
      return;
    }

    if (total <= 0) {
      Alert.alert(t('error'), t('invalidPaymentAmount'));
      return;
    }

    try {
      setLoading(true);

      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        Alert.alert(t('error'), t('userNotFound'));
        return;
      }

      // Create Razorpay Order
      const formData = new FormData();
      formData.append('uid', userId);
      formData.append('plan_id', String(planId));
      formData.append('vehicle_number', vehicleNumber);
      formData.append('chassis_number', chassisNumber || '');
      formData.append('state', state);
      formData.append('duration', duration);
      formData.append('additional_note', additionalNote || '');

      const baseUrl = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;

      const response = await fetch(`${baseUrl}create_plan_razorpay_order.php`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('PLAN CREATE ORDER RESPONSE:', result);

      if (!result.status || !result.order_id || !result.amount_paise || !result.key_id) {
        Alert.alert(t('paymentError'), result.message || t('unableToCreateOrder'));
        return;
      }

      if (Number(result.amount_paise) !== Math.round(total * 100)) {
        Alert.alert(t('paymentError'), t('planAmountMismatch'));
        return;
      }

      await openRazorpayCheckout(result.order_id, Number(result.amount_paise), result.key_id, userId, baseUrl);
    } catch (error) {
      console.log('PLAN CREATE ORDER ERROR:', error);
      Alert.alert(t('paymentError'), error.message || t('unableToCreatePaymentOrder'));
    } finally {
      setLoading(false);
    }
  };

  const openRazorpayCheckout = async (orderId, amountInPaise, keyId, userId, baseUrl) => {
    try {
      const paymentResult = await RazorpayCheckout.open({
        description: t('vehicleTaxPaymentDescription', {duration}),
        currency: 'INR',
        key: keyId,
        amount: Number(amountInPaise),
        name: 'ChalteRho',
        order_id: orderId,
        prefill: {contact: '', email: ''},
        theme: {color: '#001433'},
      });

      // Verify Payment
      const verifyForm = new FormData();
      verifyForm.append('uid', String(userId));
      verifyForm.append('razorpay_payment_id', paymentResult.razorpay_payment_id);
      verifyForm.append('razorpay_order_id', paymentResult.razorpay_order_id || orderId);
      verifyForm.append('razorpay_signature', paymentResult.razorpay_signature);
      verifyForm.append('phone_number', '');
      verifyForm.append('vehicle_number', vehicleNumber || '');
      verifyForm.append('chassis_number', chassisNumber || '');
      verifyForm.append('state', state || '');
      verifyForm.append('category', '');
      verifyForm.append('sub_category',);
      verifyForm.append('duration', duration || '');
      verifyForm.append('amount', String(taxAmount));
      verifyForm.append('service_fees', String(fees));
      verifyForm.append('payable', String(total));
      verifyForm.append('additional_note', additionalNote || '');

      const verifyResponse = await fetch(`${baseUrl}verify_plan_razorpay_payment.php`, {
        method: 'POST',
        body: verifyForm,
      });

      const verifyData = await verifyResponse.json();
      console.log('PLAN VERIFY RESPONSE:', verifyData);

      if (!verifyResponse.ok || verifyData.status !== true) {
        Alert.alert(
          t('verificationPending'),
          verifyData.message || t('paymentStatusNotVerified'),
        );
        return;
      }

      Alert.alert(
        t('paymentSuccessful'),
        verifyData.message || t('paymentSavedSuccessfully'),
        [{text: t('ok'), onPress: () => {
          if (navigation.canGoBack()) navigation.popToTop();
        }}],
      );
    } catch (error) {
      console.log('PLAN RAZORPAY ERROR:', error);

      if (error?.code === 0) {
        Alert.alert(t('paymentCancelled'), t('youCancelledPayment'));
      } else {
        Alert.alert(
          t('paymentFailed'),
          error?.description || error?.message || t('paymentProcessFailed'),
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>{t('securePayment')}</Text>
        <Text style={styles.subtitle}>{t('reviewSelectedPlan')}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('vehicleDetails')}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>{t('vehicleNumber')}</Text>
            <Text style={styles.value}>{vehicleNumber || 'N/A'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('state')}</Text>
            <Text style={styles.value}>{state || 'N/A'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('chassisNumber')}</Text>
            <Text style={styles.value}>{chassisNumber || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('planSummary')}</Text>

          <View style={styles.planHeader}>
            <View style={styles.planIcon}>
              <Text style={styles.planIconText}>◷</Text>
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>
                {t('planName', {duration: duration || t('vehicleTax')})}
              </Text>
              <Text style={styles.planSubtitle}>{t('vehicleTaxPayment')}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>{t('taxAmount')}</Text>
            <Text style={styles.value}>₹{taxAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{t('serviceFees')}</Text>
            <Text style={styles.value}>₹{fees.toFixed(2)}</Text>
          </View>

          <View style={styles.totalBox}>
            <View>
              <Text style={styles.totalLabel}>{t('totalPayable')}</Text>
              <Text style={styles.totalSubtitle}>{t('includingServiceFees')}</Text>
            </View>
            <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('additionalNote')}</Text>
          <Text style={styles.noteText}>
            {additionalNote.trim() || t('noAdditionalNote')}
          </Text>
        </View>

        <View style={styles.gatewayBox}>
          <Text style={styles.gatewayIcon}>🔒</Text>
          <View style={styles.gatewayInfo}>
            <Text style={styles.gatewayTitle}>{t('razorpaySecureCheckout')}</Text>
            <Text style={styles.gatewaySubtitle}>{t('payAvailableMethods')}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.payButton, loading && styles.disabledButton]}
          activeOpacity={0.85}
          disabled={loading}
          onPress={createRazorpayOrder}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.payButtonText}>
              {t('payAmount', {amount: total.toFixed(2)})} →
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>{t('paymentServerVerification')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#f5f6fa'},
  container: {padding: 16, paddingBottom: 30},
  heading: {fontSize: 25, fontWeight: '900', color: '#001433'},
  subtitle: {fontSize: 13, color: '#778196', marginTop: 5, marginBottom: 20},
  card: {backgroundColor: '#ffffff', borderRadius: 16, padding: 17, marginBottom: 16, borderWidth: 1, borderColor: '#e6eaf0', elevation: 2, shadowColor: '#001433', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: {width: 0, height: 2}},
  sectionTitle: {fontSize: 17, fontWeight: '900', color: '#001433', marginBottom: 16},
  row: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15, gap: 12},
  label: {flex: 1, fontSize: 13, color: '#687386'},
  value: {flex: 1, fontSize: 13, fontWeight: '800', color: '#001433', textAlign: 'right'},
  planHeader: {flexDirection: 'row', alignItems: 'center'},
  planIcon: {width: 48, height: 48, borderRadius: 13, backgroundColor: '#fff0e8', alignItems: 'center', justifyContent: 'center', marginRight: 12},
  planIconText: {fontSize: 28, fontWeight: '700', color: 'orangered'},
  planInfo: {flex: 1},
  planTitle: {fontSize: 17, fontWeight: '900', color: '#001433'},
  planSubtitle: {fontSize: 12, color: '#858d9b', marginTop: 4},
  divider: {height: 1, backgroundColor: '#edf0f4', marginVertical: 18},
  totalBox: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff3ec', borderWidth: 1, borderColor: '#ffe1d2', borderRadius: 12, padding: 14},
  totalLabel: {fontSize: 14, fontWeight: '800', color: '#001433'},
  totalSubtitle: {fontSize: 10, color: '#858d9b', marginTop: 4},
  totalAmount: {fontSize: 21, fontWeight: '900', color: 'orangered'},
  noteText: {fontSize: 13, lineHeight: 20, color: '#687386'},
  gatewayBox: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12, padding: 15, marginBottom: 16, borderWidth: 1, borderColor: '#e6eaf0'},
  gatewayIcon: {fontSize: 25, marginRight: 12},
  gatewayInfo: {flex: 1},
  gatewayTitle: {fontSize: 14, fontWeight: '800', color: '#001433'},
  gatewaySubtitle: {fontSize: 11, color: '#778196', marginTop: 4, lineHeight: 16},
  payButton: {backgroundColor: 'orangered', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center'},
  disabledButton: {opacity: 0.65},
  payButtonText: {color: '#ffffff', fontSize: 16, fontWeight: '900'},
  footerText: {textAlign: 'center', color: '#778196', fontSize: 11, lineHeight: 17, marginTop: 12},
});
