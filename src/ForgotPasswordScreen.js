import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';

import {useTranslation} from 'react-i18next';
import {BASE_URL} from './config/config';
import {changeAppLanguage} from './i18n';

const LANGUAGES = [
  {code: 'en', label: 'English'},
  {code: 'hi', label: 'हिंदी'},
  {code: 'pa', label: 'ਪੰਜਾਬੀ'},
];

const ForgotPasswordScreen = ({navigation}) => {
  const {t, i18n} = useTranslation();

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [step, setStep] = useState('mobile');
  const [verificationToken, setVerificationToken] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  const selectedLanguage =
    LANGUAGES.find(item => item.code === i18n.language)?.label ||
    'English';

  const selectLanguage = async language => {
    try {
      await changeAppLanguage(language);
      setShowLanguages(false);
    } catch (error) {
      console.log('Language change error:', error);
    }
  };

  const postRequest = async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    let result;

    try {
      result = JSON.parse(responseText);
    } catch (error) {
      console.log('PHP API RAW RESPONSE:', responseText);
      throw new Error(t('serverInvalidResponse'));
    }

    if (!response.ok && result.status !== 'error') {
      throw new Error(result.message || t('requestFailed'));
    }

    return result;
  };

  // Step 1: Send OTP
  const sendOtp = async () => {
    const cleanMobile = mobile.trim();

    if (!/^[6-9][0-9]{9}$/.test(cleanMobile)) {
      Alert.alert(
        t('invalidMobile'),
        t('validMobileMessage'),
      );
      return;
    }

    setLoading(true);

    try {
      const result = await postRequest('send_reset_otp.php', {
        mobile: cleanMobile,
      });

      if (
        result.status === 'success' &&
        result.verification_token
      ) {
        setVerificationToken(result.verification_token);
        setStep('otp');

        Alert.alert(
          t('otpSent'),
          result.message || t('otpSentMessage'),
        );
      } else {
        Alert.alert(
          t('otpError'),
          result.message || t('otpCouldNotSend'),
        );
      }
    } catch (error) {
      Alert.alert(
        t('serverError'),
        error.message || t('serverNotResponding'),
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async () => {
    if (!/^[0-9]{6}$/.test(otp.trim())) {
      Alert.alert(
        t('invalidOtp'),
        t('enterSixDigitOtp'),
      );
      return;
    }

    if (!verificationToken) {
      Alert.alert(
        t('otpError'),
        t('verificationTokenMissing'),
      );
      setStep('mobile');
      return;
    }

    setLoading(true);

    try {
      const result = await postRequest('verify_reset_otp.php', {
        mobile: mobile.trim(),
        otp: otp.trim(),
        verification_token: verificationToken,
      });

      if (
        result.status === 'success' &&
        result.reset_token
      ) {
        setResetToken(result.reset_token);
        setStep('password');
        setOtp('');

        Alert.alert(
          t('verified'),
          t('otpVerifiedMessage'),
        );
      } else {
        Alert.alert(
          t('verificationFailed'),
          result.message || t('otpVerificationFailed'),
        );
      }
    } catch (error) {
      Alert.alert(
        t('serverError'),
        error.message || t('serverNotResponding'),
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const resetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert(
        t('error'),
        t('fillBothPasswords'),
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        t('weakPassword'),
        t('passwordMinLength'),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        t('passwordMismatch'),
        t('passwordsMustMatch'),
      );
      return;
    }

    if (!resetToken) {
      Alert.alert(
        t('error'),
        t('resetTokenMissing'),
      );
      setStep('mobile');
      return;
    }

    setLoading(true);

    try {
      const result = await postRequest('reset_password.php', {
        mobile: mobile.trim(),
        reset_token: resetToken,
        password: newPassword,
      });

      if (result.status === 'success') {
        setResetToken('');
        setVerificationToken('');
        setNewPassword('');
        setConfirmPassword('');

        Alert.alert(
          t('success'),
          result.message || t('passwordUpdated'),
          [
            {
              text: t('loginNow'),
              onPress: () => navigation.navigate('LoginScreen'),
            },
          ],
        );
      } else {
        Alert.alert(
          t('resetFailed'),
          result.message || t('passwordNotUpdated'),
        );
      }
    } catch (error) {
      Alert.alert(
        t('serverError'),
        error.message || t('serverNotResponding'),
      );
    } finally {
      setLoading(false);
    }
  };

  const goBackToMobile = () => {
    setStep('mobile');
    setOtp('');
    setVerificationToken('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const renderButton = (title, onPress) => (
    <TouchableOpacity
      style={[styles.button, loading && styles.disabledButton]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">

        {/* Language selector */}
        <View style={styles.languageRow}>
          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => setShowLanguages(!showLanguages)}
              activeOpacity={0.8}>
              <Text style={styles.languageButtonText}>
                {selectedLanguage} ▼
              </Text>
            </TouchableOpacity>

            {showLanguages && (
              <View style={styles.languageDropdown}>
                {LANGUAGES.map(language => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageOption,
                      i18n.language === language.code &&
                        styles.selectedLanguageOption,
                    ]}
                    onPress={() => selectLanguage(language.code)}>
                    <Text
                      style={[
                        styles.languageOptionText,
                        i18n.language === language.code &&
                          styles.selectedLanguageText,
                      ]}>
                      {language.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <Image
          source={require('./assets/logo.png')}
          style={styles.logo}
        />

        <Text style={styles.heading}>
          {t('forgotPassword')}
        </Text>

        <Text style={styles.subtitle}>
          {step === 'mobile'
            ? t('forgotPasswordSubtitle')
            : step === 'otp'
            ? t('otpSentToMobile', {mobile})
            : t('setNewPasswordSubtitle')}
        </Text>

        {step === 'mobile' && (
          <>
            <TextInput
              placeholder={t('registeredMobile')}
              placeholderTextColor="#888"
              keyboardType="number-pad"
              maxLength={10}
              style={styles.input}
              value={mobile}
              onChangeText={value =>
                setMobile(value.replace(/[^0-9]/g, ''))
              }
              editable={!loading}
            />

            {renderButton(t('sendOtp'), sendOtp)}
          </>
        )}

        {step === 'otp' && (
          <>
            <TextInput
              placeholder={t('enterSixDigitOtp')}
              placeholderTextColor="#888"
              keyboardType="number-pad"
              maxLength={6}
              style={styles.input}
              value={otp}
              onChangeText={value =>
                setOtp(value.replace(/[^0-9]/g, ''))
              }
              editable={!loading}
            />

            {renderButton(t('verifyOtp'), verifyOtp)}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={sendOtp}
              disabled={loading}>
              <Text style={styles.secondaryButtonText}>
                {t('resendOtp')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={goBackToMobile}
              disabled={loading}>
              <Text style={styles.secondaryButtonText}>
                {t('changeMobileNumber')}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'password' && (
          <>
            <TextInput
              placeholder={t('newPassword')}
              placeholderTextColor="#888"
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!loading}
            />

            <TextInput
              placeholder={t('confirmNewPassword')}
              placeholderTextColor="#888"
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />

            {renderButton(t('resetPassword'), resetPassword)}
          </>
        )}

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('LoginScreen')}
          disabled={loading}>
          <Text style={styles.loginLinkText}>
            {t('backToLogin')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#fff',
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },

  languageRow: {
    alignItems: 'flex-end',
    marginBottom: 12,
    zIndex: 10,
  },

  languageContainer: {
    position: 'relative',
    zIndex: 20,
  },

  languageButton: {
    borderWidth: 1,
    borderColor: 'orangered',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#fff',
  },

  languageButtonText: {
    color: 'orangered',
    fontSize: 13,
    fontWeight: '600',
  },

  languageDropdown: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: 135,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 3},
    overflow: 'hidden',
    zIndex: 30,
  },

  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },

  selectedLanguageOption: {
    backgroundColor: '#fff0e9',
  },

  languageOptionText: {
    color: '#333',
    fontSize: 14,
  },

  selectedLanguageText: {
    color: 'orangered',
    fontWeight: '700',
  },

  logo: {
    width: 110,
    height: 110,
    alignSelf: 'center',
    marginBottom: 10,
    resizeMode: 'contain',
  },

  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: 'orangered',
  },

  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
    lineHeight: 21,
  },

  input: {
    borderWidth: 1,
    borderColor: 'orangered',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 13,
    marginBottom: 15,
    color: '#222',
    backgroundColor: '#fff',
  },

  button: {
    backgroundColor: 'orangered',
    padding: 15,
    borderRadius: 8,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.7,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },

  secondaryButton: {
    padding: 12,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: 'orangered',
    fontWeight: '600',
  },

  loginLink: {
    marginTop: 22,
    padding: 10,
    alignItems: 'center',
  },

  loginLinkText: {
    color: '#555',
    fontWeight: '600',
  },
});
