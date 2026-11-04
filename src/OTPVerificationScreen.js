import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

import {BASE_URL} from './config/config';

const OTPVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {t} = useTranslation();

  const {
    name,
    mobile,
    password,
    referBy,
    verificationToken,
  } = route.params || {};

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    const cleanOTP = otp.trim();
    const cleanMobile = String(mobile || '').trim();

    if (!/^[0-9]{6}$/.test(cleanOTP)) {
      Alert.alert(t('invalidOTP'), t('enterSixDigitOTP'));
      return;
    }

    if (
      !/^[6-9][0-9]{9}$/.test(cleanMobile) ||
      !verificationToken ||
      !name ||
      !password
    ) {
      Alert.alert(
        t('missingDetails'),
        t('registrationDetailsMissing'),
      );
      return;
    }

    setLoading(true);

    try {
      // STEP 1: VERIFY OTP
      const verifyURL = `${BASE_URL}verify_otp.php`;

      const verifyResponse = await fetch(verifyURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          mobile: cleanMobile,
          otp: cleanOTP,
          verification_token: verificationToken,
        }),
      });

      const verifyText = await verifyResponse.text();
      let verifyResult;

      try {
        verifyResult = JSON.parse(verifyText);
      } catch (parseError) {
        throw new Error(
          `${t('invalidOTPResponse')} HTTP ${verifyResponse.status}`,
        );
      }

      if (
        !verifyResponse.ok ||
        verifyResult.status !== 'success'
      ) {
        Alert.alert(
          t('otpVerificationFailed'),
          verifyResult.message ||
            `${t('otpFailed')} HTTP ${verifyResponse.status}`,
        );
        return;
      }

      // STEP 2: REGISTER USER
      const registerURL = `${BASE_URL}register.php`;

      const registerResponse = await fetch(registerURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          number: cleanMobile,
          password: password,
          refer_by: referBy || '',
          verification_token: verificationToken,
        }),
      });

      const registerText = await registerResponse.text();
      let registerResult;

      try {
        registerResult = JSON.parse(registerText);
      } catch (parseError) {
        throw new Error(
          `${t('invalidRegisterResponse')} HTTP ${registerResponse.status}`,
        );
      }

      if (
        !registerResponse.ok ||
        registerResult.status !== 'success'
      ) {
        Alert.alert(
          t('registrationFailed'),
          registerResult.message ||
            `${t('accountRegistrationFailed')} HTTP ${registerResponse.status}`,
        );
        return;
      }

      // STEP 3: LOGIN AFTER REGISTRATION
      const loginURL = `${BASE_URL}login.php`;

      const loginResponse = await fetch(loginURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          mobile: cleanMobile,
          password: password,
        }),
      });

      const loginText = await loginResponse.text();
      let loginResult;

      try {
        loginResult = JSON.parse(loginText);
      } catch (parseError) {
        throw new Error(
          `${t('invalidLoginResponse')} HTTP ${loginResponse.status}`,
        );
      }

      if (
        loginResponse.ok &&
        loginResult.status === 'success' &&
        loginResult.user?.id != null
      ) {
        await AsyncStorage.setItem(
          'userId',
          String(loginResult.user.id),
        );

        navigation.reset({
          index: 0,
          routes: [{name: 'MainTabs'}],
        });
      } else {
        Alert.alert(
          t('registrationSuccessful'),
          t('loginToContinue'),
          [
            {
              text: t('ok'),
              onPress: () => navigation.navigate('LoginScreen'),
            },
          ],
        );
      }
    } catch (error) {
      console.log('OTP / REGISTRATION ERROR:', error);

      Alert.alert(
        t('connectionError'),
        error?.message || t('serverConnectionFailed'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">

          <View style={styles.container}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>OTP</Text>
            </View>

            <Text style={styles.title}>
              {t('verifyMobileNumber')}
            </Text>

            <Text style={styles.subtitle}>
              {t('enterOTPsentTo')}
            </Text>

            <Text style={styles.mobileText}>
              +91 {mobile || ''}
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder={t('enterOTP')}
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={text =>
                setOtp(text.replace(/[^0-9]/g, ''))
              }
              editable={!loading}
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              accessibilityLabel={t('sixDigitOTP')}
            />

            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.disabledButton,
              ]}
              onPress={handleVerifyOTP}
              disabled={loading}
              activeOpacity={0.8}>

              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.buttonText}>
                    {' '}{t('pleaseWait')}
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  {t('verifyOTPRegister')}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.note}>
              {t('otpExpiresIn')}
            </Text>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              disabled={loading}>
              <Text style={styles.backText}>
                {t('backToRegistration')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OTPVerificationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#fff',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF0E8',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  iconText: {
    color: 'orangered',
    fontSize: 25,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'orangered',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  mobileText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: 'orangered',
    borderRadius: 8,
    padding: 15,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    color: '#222',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'orangered',
    padding: 16,
    borderRadius: 8,
    marginTop: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  note: {
    textAlign: 'center',
    color: '#777',
    marginTop: 18,
    fontSize: 13,
  },
  backText: {
    textAlign: 'center',
    color: 'orangered',
    fontWeight: '600',
    marginTop: 20,
  },
});
