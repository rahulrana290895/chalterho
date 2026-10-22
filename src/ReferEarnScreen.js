import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import {useTranslation} from 'react-i18next';
import {BASE_URL} from './config/config';

export default function ReferEarnScreen() {
  const {t} = useTranslation();

  const [loading, setLoading] = useState(true);
  const [referCode, setReferCode] = useState('');
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');

      const response = await fetch(
        `${BASE_URL}refer-earn.php?uid=${encodeURIComponent(uid || '')}`,
      );

      const result = await response.json();

      if (result.status) {
        setReferCode(result.refer_no || '');
        setBalance(String(result.balance ?? '0'));
      }
    } catch (error) {
      console.log('Referral data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    Clipboard.setString(referCode);

    Alert.alert(
      t('success'),
      t('referralCopied'),
    );
  };

  const shareReferral = async () => {
    try {
      await Share.share({
        message: t('referralShareMessage', {code: referCode}),
      });
    } catch (error) {
      console.log('Referral sharing error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="orangered" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        <View style={styles.content}>
          <View style={styles.topCard}>
            <Ionicons
              name="gift"
              size={70}
              color="orangered"
            />

            <Text style={styles.heading}>
              {t('share')}
            </Text>

            <Text style={styles.subHeading}>
              {t('inviteFriends')}
            </Text>
          </View>

          {/*
          <View style={styles.card}>
            <Text style={styles.balanceLabel}>
              {t('walletBalance')}
            </Text>

            <Text style={styles.balance}>
              ₹{balance}
            </Text>
          </View>
          */}

          <View style={styles.card}>
            {/*
            <Text style={styles.label}>
              {t('yourReferralCode')}
            </Text>

            <Text style={styles.code}>
              {referCode}
            </Text>

            <TouchableOpacity
              style={styles.copyBtn}
              onPress={copyCode}>
              <Text style={styles.btnText}>
                {t('copyCode')}
              </Text>
            </TouchableOpacity>
            */}

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={shareReferral}
              activeOpacity={0.8}>

              <Ionicons
                name="logo-whatsapp"
                size={20}
                color="#fff"
              />

              <Text style={styles.shareText}>
                {t('shareOnWhatsApp')}
              </Text>
            </TouchableOpacity>
          </View>

          {/*
          <View style={styles.card}>
            <Text style={styles.workTitle}>
              {t('howItWorks')}
            </Text>

            <Text style={styles.workText}>
              • {t('referralStep1')}
            </Text>

            <Text style={styles.workText}>
              • {t('referralStep2')}
            </Text>

            <Text style={styles.workText}>
              • {t('referralStep3')}
            </Text>

            <Text style={styles.workText}>
              • {t('referralStep4')}
            </Text>
          </View>
          */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f5f9',
  },

  scrollContent: {
    padding: 5,
    paddingBottom: 30,
  },

  content: {
    flex: 1,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  topCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 3,
    marginBottom: 15,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    marginBottom: 15,
  },

  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 10,
    color: '#222',
  },

  subHeading: {
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },

  balanceLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },

  balance: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
  },

  label: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },

  code: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    color: 'orangered',
    marginVertical: 15,
  },

  copyBtn: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  shareBtn: {
    backgroundColor: '#25D366',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
  },

  shareText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },

  workTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  workText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 8,
  },
});
