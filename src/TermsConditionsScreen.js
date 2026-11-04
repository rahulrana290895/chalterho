
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

const TermsConditionsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Terms & Conditions</Text>

        <Text style={styles.date}>Last Updated: 02 November 2026</Text>

        <Text style={styles.heading}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to ChalteRho. By using our mobile application,
          you agree to follow these Terms & Conditions.
        </Text>

        <Text style={styles.heading}>2. User Registration</Text>
        <Text style={styles.paragraph}>
          Users must provide correct mobile numbers and
          other required information during registration.
          Users are responsible for keeping their account
          credentials secure.
        </Text>

        <Text style={styles.heading}>3. Services</Text>
        <Text style={styles.paragraph}>
          ChalteRho provides various online services including
          vehicle-related services, document services and
          other facilities available in the application.
        </Text>

        <Text style={styles.heading}>4. Payments</Text>
        <Text style={styles.paragraph}>
          Users must pay the applicable service charges
          before using paid services. Payment confirmation
          is subject to successful payment verification.
        </Text>

        <Text style={styles.heading}>5. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          Users must provide accurate information and must
          not misuse the application or use it for any
          illegal activities.
        </Text>

        <Text style={styles.heading}>6. Refund Policy</Text>
        <Text style={styles.paragraph}>
          Refund requests will be handled according to the
          applicable refund policy of ChalteRho and the
          status of the requested service.
        </Text>

        <Text style={styles.heading}>7. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          ChalteRho reserves the right to update these
          Terms & Conditions whenever required.
        </Text>

        <Text style={styles.heading}>8. Contact Us</Text>
        <Text style={styles.paragraph}>
          For any questions regarding these Terms &
          Conditions, please contact our support team.
        </Text>

        <View style={{height: 30}} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsConditionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'orangered',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'orangered',
    marginBottom: 8,
  },
  date: {
    color: '#888',
    fontSize: 12,
    marginBottom: 20,
  },
  heading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 18,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#555',
    lineHeight: 23,
    textAlign: 'justify',
  },
});
