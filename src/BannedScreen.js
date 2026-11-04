import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';

const BannedScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>

        <View style={styles.iconBox}>
          <Ionicons
            name="ban"
            size={65}
            color="#DC2626"
          />
        </View>

        <Text style={styles.title}>
          Account Banned!
        </Text>

        <Text style={styles.message}>
          Your ChalteRho account has been suspended.
          You cannot access the application at this time.
        </Text>

        <Text style={styles.support}>
          Please contact our support team for further assistance.
        </Text>

      </View>
    </SafeAreaView>
  );
};

export default BannedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5,
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 15,
  },
  message: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
  },
  support: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
  },
});