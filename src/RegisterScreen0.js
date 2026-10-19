import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import {BASE_URL} from './config/config';

const RegisterScreen = () => {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [referBy, setReferBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !mobile || !password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (mobile.length !== 10) {
      Alert.alert('Error', 'Enter valid mobile number');
      return;
    }

    setLoading(true);

    try {
      // Register User
      const response = await fetch(`${BASE_URL}register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          number: mobile,
          password,
          refer_by: referBy,
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Auto Login
        const loginResponse = await fetch(`${BASE_URL}login.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile: mobile,
            password: password,
          }),
        });

        const loginResult = await loginResponse.json();

        if (loginResult.status === 'success') {
          await AsyncStorage.setItem(
            'userId',
            loginResult.user.id.toString(),
          );

          navigation.replace('MainTabs');
        } else {
          Alert.alert(
            'Success',
            'Registration completed. Please login manually.',
          );

          navigation.navigate('LoginScreen');
        }
      } else {
        Alert.alert(
          'Error',
          result.message || 'Registration Failed',
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Server not responding');
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Image
              source={require('./assets/logo.png')}
              style={styles.logo}
            />

            <Text style={styles.appName}>Registration</Text>

            <TextInput
              placeholder="Full Name"
              placeholderTextColor="orangered"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Mobile Number"
              placeholderTextColor="orangered"
              keyboardType="number-pad"
              maxLength={10}
              style={styles.input}
              value={mobile}
              onChangeText={setMobile}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="orangered"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}>
                <Text style={{color: 'orangered'}}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Referral Code (Optional)"
              placeholderTextColor="orangered"
              style={styles.input}
              value={referBy}
              onChangeText={setReferBy}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Registering...' : 'Register'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.loginText}>
                Already have an account? Login
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
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#fff',
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
  },

  button: {
    backgroundColor: 'orangered',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginText: {
    marginTop: 20,
    textAlign: 'center',
    color: 'orangered',
    fontWeight: '600',
  },
});