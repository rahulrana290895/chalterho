
import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ScrollView, Image, ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {BASE_URL} from './config/config';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [referBy, setReferBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleRegister = async () => {
    if (!acceptedTerms) {
      Alert.alert(t('termsRequired'), t('acceptTermsBeforeRegister'));
      return;
    }

    const cleanName = name.trim();
    const cleanMobile = mobile.trim();
    const cleanReferBy = referBy.trim();

    if (!cleanName || !cleanMobile || !password) {
      Alert.alert(t('error'), t('fillRequiredFields'));
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(cleanMobile)) {
      Alert.alert(t('error'), t('validMobileNumber'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('error'), t('passwordMinimum'));
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}send_otp.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: cleanName,
          number: cleanMobile,
          password,
          refer_by: cleanReferBy,
        }),
      });

      const rawResponse = await response.text();

      console.log('OTP API URL:', `${BASE_URL}send_otp.php`);
      console.log('OTP API status:', response.status);
      console.log('OTP API response:', rawResponse);

      let result;

      try {
        result = JSON.parse(rawResponse);
      } catch (error) {
        Alert.alert(t('serverError'), t('invalidServerResponse'));
        return;
      }

      if (response.ok && result.status === 'success') {
        if (!result.verification_token) {
          Alert.alert(t('serverError'), t('verificationTokenMissing'));
          return;
        }

        navigation.navigate('OTPVerificationScreen', {
          name: cleanName,
          mobile: cleanMobile,
          password,
          referBy: cleanReferBy,
          verificationToken: result.verification_token,
        });
      } else {
        Alert.alert(
          t('registrationFailed'),
          result.message || t('unableSendOTP'),
        );
      }
    } catch (error) {
      console.log('Registration error:', error);
      Alert.alert(t('connectionError'), t('serverNotResponding'));
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
            <Image
              source={require('./assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.appName}>{t('registration')}</Text>

            <TextInput
              placeholder={t('fullName')}
              placeholderTextColor="#888"
              style={styles.input}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />

            <TextInput
              placeholder={t('mobileNumber')}
              placeholderTextColor="#888"
              keyboardType="number-pad"
              maxLength={10}
              style={styles.input}
              value={mobile}
              onChangeText={text => setMobile(text.replace(/[^0-9]/g, ''))}
              editable={!loading}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder={t('passwordMinimumPlaceholder')}
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}>
                <Text style={styles.showText}>
                  {showPassword ? t('hide') : t('show')}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder={t('referralCodeOptional')}
              placeholderTextColor="#888"
              style={styles.input}
              value={referBy}
              onChangeText={setReferBy}
              autoCapitalize="characters"
              editable={!loading}
            />

            <TouchableOpacity
              style={styles.termsContainer}
              activeOpacity={0.8}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              disabled={loading}>
              <View style={[
                styles.checkbox,
                acceptedTerms && styles.checkboxChecked,
              ]}>
                {acceptedTerms && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>

              <Text style={styles.termsText}>
                {t('iAgreeTo')}{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => navigation.navigate('TermsConditionsScreen')}>
                  {t('termsConditions')}
                </Text>
                {' '}{t('and')}{' '}
                <Text
                  style={styles.termsLink}
                  onPress={() => navigation.navigate('PrivacyPolicyScreen')}>
                  {t('privacyPolicy')}
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}>
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.buttonText}>
                    {' '}{t('sendingOTP')}
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>{t('sendOTP')}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('LoginScreen')}
              disabled={loading}>
              <Text style={styles.loginText}>
                {t('alreadyHaveAccount')} {t('login')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#fff'},
  flex: {flex: 1},
  scrollContent: {flexGrow: 1},
  container: {
    flexGrow: 1, justifyContent: 'center', padding: 25,
    backgroundColor: '#fff',
  },
  logo: {
    width: 110, height: 110, alignSelf: 'center', marginBottom: 10,
  },
  appName: {
    fontSize: 28, fontWeight: 'bold', textAlign: 'center',
    marginBottom: 30, color: 'orangered',
  },
  input: {
    borderWidth: 2, borderColor: 'orangered', borderRadius: 8,
    padding: 14, marginBottom: 15, fontSize: 16, color: '#222',
  },
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 2,
    borderColor: 'orangered', borderRadius: 8, marginBottom: 15,
  },
  passwordInput: {flex: 1, padding: 14, fontSize: 16, color: '#222'},
  eyeButton: {paddingHorizontal: 12, paddingVertical: 14},
  showText: {color: 'orangered'},
  button: {
    backgroundColor: 'orangered', padding: 16,
    borderRadius: 8, marginTop: 10,
  },
  disabledButton: {opacity: 0.7},
  buttonText: {
    color: '#fff', textAlign: 'center', fontSize: 16,
    fontWeight: 'bold',
  },
  loadingRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  loginText: {
    marginTop: 20, textAlign: 'center',
    color: 'orangered', fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 5, marginBottom: 15,
  },
  checkbox: {
    width: 21, height: 21, borderWidth: 1.5,
    borderColor: 'orangered', borderRadius: 4,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  checkboxChecked: {backgroundColor: 'orangered'},
  checkmark: {color: '#fff', fontSize: 15, fontWeight: 'bold'},
  termsText: {flex: 1, fontSize: 12, color: '#555', lineHeight: 20},
  termsLink: {
    color: 'orangered', fontWeight: '700', textDecorationLine: 'underline',
  },
});
