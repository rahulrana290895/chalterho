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

const RefundPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>
          Refund & Cancellation Policy
        </Text>

        <Text style={styles.date}>
          Last Updated: 02 November 2026
        </Text>

        <Text style={styles.intro}>
          Thank you for using ChalteRho. Please read our
          Refund & Cancellation Policy carefully before
          purchasing any service through our application.
        </Text>

        <Text style={styles.heading}>
          1. Payment Policy
        </Text>
        <Text style={styles.paragraph}>
          Users are required to pay the applicable service
          charges before submitting a service request.
          All payments are processed through authorized
          payment gateways.
        </Text>

        <Text style={styles.heading}>
          2. Failed Transactions
        </Text>
        <Text style={styles.paragraph}>
          If an amount is deducted from your bank account
          but the transaction shows failed or pending,
          please wait for the payment gateway or bank
          to update the transaction status. If the amount
          is not automatically reversed, contact our support
          team with your transaction details.
        </Text>

        <Text style={styles.heading}>
          3. Refund Eligibility
        </Text>
        <Text style={styles.paragraph}>
          Refund requests may be considered in the following
          situations:
          {'\n\n'}• Payment deducted but service request not
          created due to a technical issue.
          {'\n\n'}• Duplicate payment for the same service.
          {'\n\n'}• Service could not be delivered due to an
          issue attributable to ChalteRho.
          {'\n\n'}• Other cases where a refund is required
          under applicable law.
        </Text>

        <Text style={styles.heading}>
          4. Non-Refundable Services
        </Text>
        <Text style={styles.paragraph}>
          Refunds may not be available once a service has
          been successfully completed or delivered.
          Incorrect details provided by the user may also
          affect refund eligibility. This does not limit
          any refund rights available under applicable law.
        </Text>

        <Text style={styles.heading}>
          5. Refund Processing
        </Text>
        <Text style={styles.paragraph}>
          Once a refund request is reviewed and approved,
          the refund will be initiated through the applicable
          payment channel. The time taken to reflect the
          amount in your account depends on your bank
          and payment provider.
        </Text>

        <Text style={styles.heading}>
          6. Cancellation Policy
        </Text>
        <Text style={styles.paragraph}>
          Cancellation requests will be reviewed based on
          the current processing status of the service.
          Services that have already been processed or
          completed may not be eligible for cancellation,
          subject to applicable consumer rights.
        </Text>

        <Text style={styles.heading}>
          7. Duplicate Payments
        </Text>
        <Text style={styles.paragraph}>
          If you have accidentally made multiple payments
          for the same service, please share the payment
          references with our support team for verification.
        </Text>

        <Text style={styles.heading}>
          8. Refund Request
        </Text>
        <Text style={styles.paragraph}>
          To request a refund, please provide:
          {'\n\n'}• Registered mobile number
          {'\n'}• Payment ID or transaction reference
          {'\n'}• Service details
          {'\n'}• Reason for refund request
        </Text>

        <Text style={styles.heading}>
          9. Contact Us
        </Text>
        <Text style={styles.paragraph}>
          For any refund or cancellation-related queries,
          please contact the ChalteRho customer support team
          through the available support channels.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for choosing ChalteRho.
          </Text>
          <Text style={styles.brand}>
            ChalteRho
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default RefundPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    backgroundColor: 'orangered',
  },

  backBtn: {
    marginRight: 15,
  },

  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: 'orangered',
    marginBottom: 8,
  },

  date: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },

  intro: {
    fontSize: 14,
    color: '#555',
    lineHeight: 23,
    marginBottom: 10,
    textAlign: 'justify',
  },

  heading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 20,
    marginBottom: 8,
  },

  paragraph: {
    fontSize: 14,
    color: '#555',
    lineHeight: 24,
    textAlign: 'justify',
  },

  footer: {
    marginTop: 30,
    marginBottom: 35,
    padding: 20,
    backgroundColor: '#fff2ed',
    borderRadius: 12,
    alignItems: 'center',
  },

  footerText: {
    fontSize: 14,
    color: '#555',
  },

  brand: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'orangered',
    marginTop: 8,
  },
});
