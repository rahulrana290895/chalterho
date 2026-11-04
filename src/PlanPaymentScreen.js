
import React, {useState} from 'react';
import {View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

export default function PlanPaymentScreen({navigation, route}) {
  const {t} = useTranslation();

  const {
    planId,
    vehicleNumber = '',
    chassisNumber = '',
    state = '',
    duration = '',
    amount = 0,
    serviceFees = 0,
    payable = 0,
  } = route.params || {};

  const [additionalNote, setAdditionalNote] = useState('');

  const taxAmount = Number(amount) || 0;
  const fees = Number(serviceFees) || 0;
  const receivedPayable = Number(payable) || 0;
  const total = receivedPayable > 0 ? receivedPayable : taxAmount + fees;

  const handleContinue = () => {
    if (!vehicleNumber || !state || !planId) {
      Alert.alert(t('error'), t('planDetailsMissing'));
      return;
    }

    navigation.navigate('PlanPaymentGatewayScreen', {
      planId,
      vehicleNumber,
      chassisNumber,
      state,
      duration,
      amount: taxAmount,
      serviceFees: fees,
      payable: total,
      additionalNote,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.sectionTitle}>{t('selectedPlan')}</Text>

          <View style={styles.planHeader}>
            <View style={styles.planIcon}>
              <Text style={styles.clockIcon}>◷</Text>
            </View>

            <View style={styles.planInfo}>
              <Text style={styles.planTitle}>
                {t('planName', {duration: duration || t('vehicleTax')})}
              </Text>
              <Text style={styles.planSubtitle}>{t('selectedVehicleTaxPlan')}</Text>
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
          <Text style={styles.noteSubtitle}>{t('additionalNoteOptional')}</Text>

          <TextInput
            style={styles.noteInput}
            placeholder={t('enterNoteHere')}
            placeholderTextColor="#8992A3"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={additionalNote}
            onChangeText={setAdditionalNote}
            maxLength={500}
          />

          <Text style={styles.charCount}>{additionalNote.length}/500</Text>
        </View>

        <TouchableOpacity style={styles.payButton} activeOpacity={0.85} onPress={handleContinue}>
          <Text style={styles.payButtonText}>{t('continueToPayment')} →</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>{t('verifyDetailsBeforePayment')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#f5f6fa'},
  container: {padding: 16, paddingBottom: 30},
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e6eaf0',
    elevation: 2,
    shadowColor: '#001433',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  sectionTitle: {fontSize: 17, fontWeight: '900', color: '#001433', marginBottom: 16},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 12,
  },
  label: {fontSize: 13, color: '#687386', flex: 1},
  value: {fontSize: 13, color: '#001433', fontWeight: '800', flex: 1, textAlign: 'right'},
  planHeader: {flexDirection: 'row', alignItems: 'center'},
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#fff0e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clockIcon: {fontSize: 28, fontWeight: '700', color: 'orangered'},
  planInfo: {flex: 1},
  planTitle: {fontSize: 17, fontWeight: '900', color: '#001433'},
  planSubtitle: {fontSize: 12, color: '#858d9b', marginTop: 4},
  divider: {height: 1, backgroundColor: '#edf0f4', marginVertical: 18},
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff3ec',
    borderWidth: 1,
    borderColor: '#ffe1d2',
    borderRadius: 12,
    padding: 14,
    marginTop: 2,
  },
  totalLabel: {fontSize: 14, fontWeight: '800', color: '#001433'},
  totalSubtitle: {fontSize: 10, color: '#858d9b', marginTop: 4},
  totalAmount: {fontSize: 21, fontWeight: '900', color: 'orangered'},
  noteSubtitle: {fontSize: 12, color: '#778196', marginTop: -8, marginBottom: 12},
  noteInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#dfe4ec',
    borderRadius: 10,
    padding: 12,
    color: '#001433',
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  charCount: {textAlign: 'right', color: '#8992A3', fontSize: 11, marginTop: 6},
  payButton: {
    backgroundColor: '#001433',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  payButtonText: {color: '#ffffff', fontSize: 15, fontWeight: '900'},
  footerText: {textAlign: 'center', color: '#778196', fontSize: 11, lineHeight: 17, marginTop: 12},
});