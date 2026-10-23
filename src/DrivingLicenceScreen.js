import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Keyboard,
  ScrollView,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function DrivingLicenceScreen({navigation}) {
  const [dlNumber, setDlNumber] = useState('');

  const fetchDetails = () => {
    Keyboard.dismiss();

    const number = dlNumber.trim().toUpperCase();

    if (!number) {
      Alert.alert('Required', 'Please enter your Driving Licence Number.');
      return;
    }

    navigation.navigate('DrivingLicenceDetailsScreen', {
      dlNumber: number,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#17365D" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Driving License Download</Text>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.illustration}>
            <View style={styles.licenseIcon}>
              <Ionicons name="card-outline" size={65} color="#173F70" />
              <Ionicons
                name="car-sport"
                size={36}
                color="#FF6818"
                style={styles.carIcon}
              />
            </View>
          </View>

          <Text style={styles.title}>Get Your Driving License</Text>

          <Text style={styles.subtitle}>
            Enter your DL number to view your driving licence details.
          </Text>

          <View style={styles.formBox}>
            <Text style={styles.label}>Driving License Number</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="card" size={20} color="#173F70" />

              <TextInput
                style={styles.input}
                placeholder="Enter DL number (e.g. RJ14 20200012345)"
                placeholderTextColor="#8492A6"
                value={dlNumber}
                onChangeText={setDlNumber}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={25}
                returnKeyType="done"
                onSubmitEditing={fetchDetails}
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle"
                size={20}
                color="#0873B9"
              />
              <Text style={styles.infoText}>
                Enter your correct licence number. Additional details require
                a verified driving licence API.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={fetchDetails}>
            <Text style={styles.buttonText}>Fetch Details</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.securityRow}>
            <Ionicons name="shield-checkmark" size={17} color="#218653" />
            <Text style={styles.securityText}>
              Your information should be handled securely.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },
  header: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 2,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#17365D',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5EDF6',
  },
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  licenseIcon: {
    width: 140,
    height: 120,
    backgroundColor: '#EEF5FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  carIcon: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#17365D',
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#63758B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  formBox: {
    borderWidth: 1,
    borderColor: '#E0E9F3',
    borderRadius: 12,
    padding: 12,
  },
  label: {
    color: '#17365D',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 9,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCE5EF',
    borderRadius: 9,
    paddingHorizontal: 10,
    minHeight: 48,
  },
  input: {
    flex: 1,
    marginLeft: 9,
    color: '#172B45',
    fontSize: 12,
    paddingVertical: 9,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EAF5FF',
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    lineHeight: 17,
    color: '#355D80',
  },
  button: {
    marginTop: 20,
    height: 49,
    borderRadius: 9,
    backgroundColor: '#FF6818',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  securityText: {
    color: '#63758B',
    fontSize: 11,
    marginLeft: 6,
  },
});