import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image
} from 'react-native';

import {BASE_URL} from './config/config';

const ForgotPasswordScreen = ({navigation}) => {
  const [mobile, setMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const resetPassword = async () => {
    if (!mobile || !newPassword) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}forgot_password.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile,
          password: newPassword,
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        Alert.alert('Success', 'Password Updated Successfully');
        navigation.navigate('LoginScreen');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Server Error');
    }
  };

  return (
    <View style={styles.container}>

            <Image
              source={require('./assets/logo.png')}
              style={styles.logo}
            />

      <Text style={styles.heading}>Forgot Password</Text>

      <TextInput
        placeholder="Mobile Number"
        keyboardType="number-pad"
        maxLength={10}
        style={styles.input}
        value={mobile}
        onChangeText={setMobile}
      />

      <TextInput
        placeholder="New Password"
        secureTextEntry
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TouchableOpacity style={styles.button} onPress={resetPassword}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
    marginBottom: 30,
    color: 'orangered',
  },

  input: {
    borderWidth: 1,
    borderColor: 'orangered',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },

  button: {
    backgroundColor: 'orangered',
    padding: 15,
    borderRadius: 8,
  },

  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});