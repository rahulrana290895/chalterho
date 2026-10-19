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

import {BASE_URL} from './config/config';

const OTPVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

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
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP.');
      return;
    }

    if (
      !/^[6-9][0-9]{9}$/.test(cleanMobile) ||
      !verificationToken ||
      !name ||
      !password
    ) {
      Alert.alert(
        'Missing Details',
        'Registration details are missing. Please go back and register again.',
      );
      return;
    }

    setLoading(true);

    try {
      // STEP 1: VERIFY OTP
      const verifyURL = `${BASE_URL}verify_otp.php`;

      console.log('VERIFY API URL:', verifyURL);
      console.log('VERIFY MOBILE:', cleanMobile);
      console.log('VERIFY TOKEN EXISTS:', !!verificationToken);

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

      console.log('VERIFY HTTP STATUS:', verifyResponse.status);
      console.log('VERIFY RAW RESPONSE:', verifyText);

      let verifyResult;

      try {
        verifyResult = JSON.parse(verifyText);
      } catch (parseError) {
        throw new Error(
          `OTP API returned an invalid response. HTTP ${verifyResponse.status}`,
        );
      }

      console.log('VERIFY RESULT:', verifyResult);

      if (
        !verifyResponse.ok ||
        verifyResult.status !== 'success'
      ) {
        Alert.alert(
          'OTP Verification Failed',
          verifyResult.message ||
            `OTP verification failed. HTTP ${verifyResponse.status}`,
        );
        return;
      }

      // STEP 2: REGISTER USER AFTER OTP VERIFICATION
      const registerURL = `${BASE_URL}register.php`;

      console.log('REGISTER API URL:', registerURL);

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

      console.log('REGISTER HTTP STATUS:', registerResponse.status);
      console.log('REGISTER RAW RESPONSE:', registerText);

      let registerResult;

      try {
        registerResult = JSON.parse(registerText);
      } catch (parseError) {
        throw new Error(
          `Registration API returned an invalid response. HTTP ${registerResponse.status}`,
        );
      }

      console.log('REGISTER RESULT:', registerResult);

      if (
        !registerResponse.ok ||
        registerResult.status !== 'success'
      ) {
        Alert.alert(
          'Registration Failed',
          registerResult.message ||
            `Account registration failed. HTTP ${registerResponse.status}`,
        );
        return;
      }

      // STEP 3: LOGIN AFTER SUCCESSFUL REGISTRATION
      const loginURL = `${BASE_URL}login.php`;

      console.log('LOGIN API URL:', loginURL);

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

      console.log('LOGIN HTTP STATUS:', loginResponse.status);
      console.log('LOGIN RAW RESPONSE:', loginText);

      let loginResult;

      try {
        loginResult = JSON.parse(loginText);
      } catch (parseError) {
        throw new Error(
          `Login API returned an invalid response. HTTP ${loginResponse.status}`,
        );
      }

      console.log('LOGIN RESULT:', loginResult);

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
          'Registration Successful',
          'Your account has been created. Please login to continue.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('LoginScreen'),
            },
          ],
        );
      }
    } catch (error) {
      console.log('OTP / REGISTRATION NETWORK ERROR:', error);
      console.log('ERROR MESSAGE:', error?.message);

      Alert.alert(
        'Connection Error',
        error?.message ||
          'Could not connect to the server. Please try again.',
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

            <Text style={styles.title}>Verify Mobile Number</Text>

            <Text style={styles.subtitle}>
              Enter the 6-digit OTP sent to
            </Text>

            <Text style={styles.mobileText}>
              +91 {mobile || ''}
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="Enter OTP"
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
              accessibilityLabel="6-digit OTP"
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
                    {' '}Please wait...
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  Verify OTP & Register
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.note}>
              OTP expires in 5 minutes.
            </Text>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              disabled={loading}>
              <Text style={styles.backText}>
                Back to Registration
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