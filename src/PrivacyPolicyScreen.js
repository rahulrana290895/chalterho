
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

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>

        <Text style={styles.date}>Last Updated: 02 November 2026</Text>

        <Text style={styles.heading}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to ChalteRho. We respect your privacy
          and are committed to protecting your personal
          information.
        </Text>

        <Text style={styles.heading}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We may collect information such as your name,
          mobile number, account details and information
          required to provide our services.
        </Text>

        <Text style={styles.heading}>3. How We Use Information</Text>
        <Text style={styles.paragraph}>
          Your information may be used for account
          management, service processing, payment
          verification, customer support and improving
          application functionality.
        </Text>

        <Text style={styles.heading}>4. Payment Information</Text>
        <Text style={styles.paragraph}>
          Payments are processed through authorized
          payment gateways. We do not intend to store
          your complete card or banking credentials.
        </Text>

        <Text style={styles.heading}>5. Data Security</Text>
        <Text style={styles.paragraph}>
          We take reasonable security measures to protect
          your personal information against unauthorized
          access, misuse or disclosure.
        </Text>

        <Text style={styles.heading}>6. Information Sharing</Text>
        <Text style={styles.paragraph}>
          We may share necessary information with service
          providers, payment partners or authorities where
          required to provide services or comply with law.
        </Text>

        <Text style={styles.heading}>7. Data Retention</Text>
        <Text style={styles.paragraph}>
          Your information may be retained for as long as
          necessary to provide services and meet applicable
          legal requirements.
        </Text>

        <Text style={styles.heading}>8. Policy Updates</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time
          to time. Updated policies will be made available
          through the application or our website.
        </Text>

        <Text style={styles.heading}>9. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy,
          please contact the ChalteRho support team.
        </Text>

        <View style={{height: 30}} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

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
