import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

import {BASE_URL} from './config/config';
import {changeAppLanguage} from './i18n';

const LANGUAGES = [
  {code: 'en', label: 'English'},
  {code: 'hi', label: 'हिंदी'},
  {code: 'pa', label: 'ਪੰਜਾਬੀ'},
];

const LoginScreen = () => {
  const navigation = useNavigation();
  const {t, i18n} = useTranslation();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');

        if (userId) {
          navigation.replace('MainTabs');
        }
      } catch (error) {
        console.log('Login check error:', error);
      }
    };

    checkLogin();
  }, [navigation]);

  const selectLanguage = async language => {
    try {
      await changeAppLanguage(language);
      setShowLanguages(false);
    } catch (error) {
      console.log('Language change error:', error);
    }
  };

  const handleLogin = async () => {
    if (!mobile.trim() || !password) {
      Alert.alert(
        t('error'),
        t('pleaseEnterMobilePassword'),
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: mobile.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        await AsyncStorage.setItem(
          'userId',
          String(result.user.id),
        );

        navigation.replace('MainTabs');
      } else {
        Alert.alert(
          t('loginFailed'),
          result.message || t('invalidCredentials'),
        );
      }
    } catch (error) {
      Alert.alert(
        t('error'),
        t('serverNotResponding'),
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedLanguage =
    LANGUAGES.find(item => item.code === i18n.language)?.label ||
    'English';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">

          <View style={styles.container}>

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

            <Text style={styles.appName}>ChalteRho</Text>

            <TextInput
              placeholder={t('mobileNumber')}
              placeholderTextColor="orangered"
              keyboardType="number-pad"
              maxLength={10}
              style={styles.input}
              value={mobile}
              onChangeText={setMobile}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder={t('password')}
                placeholderTextColor="orangered"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}>

                <Text style={styles.eyeText}>
                  {showPassword ? t('hide') : t('show')}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPasswordScreen')}>

              <Text style={styles.forgotText}>
                {t('forgotPassword')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}>

              <Text style={styles.buttonText}>
                {loading ? t('loggingIn') : t('login')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('RegisterScreen')}>

              <Text style={styles.registerText}>
                {t('createNewAccount')}
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingBottom: 25,
    backgroundColor: '#fff',
  },

  languageRow: {
    width: '100%',
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

  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: 'orangered',
  },

  input: {
    borderWidth: 2,
    borderColor: 'orangered',
    borderRadius: 8,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
    color: 'orangered',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'orangered',
    borderRadius: 8,
    marginBottom: 15,
  },

  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: 'orangered',
  },

  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  eyeText: {
    color: 'orangered',
  },

  forgotText: {
    textAlign: 'right',
    marginTop: 10,
    color: 'orangered',
  },

  button: {
    backgroundColor: 'orangered',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
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

  registerText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'orangered',
    fontWeight: '600',
  },
});
