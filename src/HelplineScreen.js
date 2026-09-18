import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';

export default function HelplineScreen() {
  const phoneNumber = '+919625065008';
  const email = 'info@chalterho.com';

  const makeCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openWhatsApp = () => {
    Linking.openURL(
      `https://wa.me/${phoneNumber.replace('+', '')}`
    );
  };

  const sendEmail = () => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Help & Support</Text>
      <Text style={styles.subHeading}>
        Contact our support team anytime.
      </Text>


      <TouchableOpacity style={styles.card}
        onPress={makeCall}>
        <Text style={styles.icon}>🕒</Text>
        <View>
          <Text style={styles.title}>24X7</Text>
          <Text style={styles.value}>
            OPEN
          </Text>
        </View>
      </TouchableOpacity>


      <TouchableOpacity
        style={styles.card}
        onPress={makeCall}>
        <Text style={styles.icon}>📞</Text>
        <View>
          <Text style={styles.title}>Call Us</Text>
          <Text style={styles.value}>
            +91-9625065008
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={openWhatsApp}>
        <Text style={styles.icon}>💬</Text>
        <View>
          <Text style={styles.title}>WhatsApp</Text>
          <Text style={styles.value}>
            +91-9625065008
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={sendEmail}>
        <Text style={styles.icon}>✉️</Text>
        <View>
          <Text style={styles.title}>Email</Text>
          <Text style={styles.value}>
            info@chalterho.com
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 20,
  },
  subHeading: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
    marginBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },
  icon: {
    fontSize: 30,
    marginRight: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
});