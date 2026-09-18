import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native'; // <-- import hook
import { SafeAreaProvider, SafeAreaView  } from 'react-native-safe-area-context';

import { BASE_URL } from './config/config';

const LoginScreen = () => {
  const navigation = useNavigation(); // <-- use navigation hook

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        navigation.replace('MainTabs'); // agar already login hai to redirect
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (!mobile || !password) {
      Alert.alert('Error', 'Please enter mobile number and password');
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
          mobile: mobile,
          password: password,
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        await AsyncStorage.setItem('userId', result.user.id);
        navigation.replace('MainTabs'); // login ke baad redirect
      } else {
        Alert.alert('Login Failed', result.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Server not responding');
    }

    setLoading(false);
  };

  return (
<SafeAreaView style={{ flex: 1 }}>
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>

        <Image
          source={require('./assets/logo.png')}
          style={styles.logo}
        />

        <Text style={styles.appName}>ChalteRho</Text>

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
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={{ color: 'orangered' }}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>


        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPasswordScreen')}>
          <Text
            style={{
              textAlign: 'right',
              marginTop: 10,
              color: 'orangered',
            }}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('RegisterScreen')}
      >
        <Text
          style={{
            textAlign: 'center',
            marginTop: 20,
            color: 'orangered',
            fontWeight: '600',
          }}
        >
          Create New Account
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
    color:'orangered',
  },
  button: {
    backgroundColor: 'orangered',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
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
});
