import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';

import {Picker} from '@react-native-picker/picker';
import Clipboard from '@react-native-clipboard/clipboard';
import Ionicons from '@react-native-vector-icons/ionicons';
import {launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';


import {BASE_URL, ASSETS_URL} from './config/config';

export default function PaymentScreen({route,navigation,}) {
  const vehicleData = route.params;

  const [taxData, setTaxData] = useState(null);
  const [upi, setUpi] = useState([]);
  const [bank, setBank] = useState([]);
  const [qr, setQr] = useState([]);
  const [paymentMode, setPaymentMode] = useState('');
  const [image, setImage] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    getTax();
    getUpi();
    getBank();
    getQr();
    getWalletBalance();
  }, []);

    const getWalletBalance = async () => {
      try {
      const userId = await AsyncStorage.getItem('userId');

        const formData = new FormData();
        formData.append('uid', userId);

        const response = await fetch(
          `${BASE_URL}wallet-balance.php`,
          {
            method: 'POST',
            body: formData,
          },
        );

        const result = await response.json();

        if (result.status) {
          setWalletBalance(
            Number(result.balance),
          );
        }

      } catch (e) {
        console.log(e);
      }
    };
    const payableAmount = taxData
          ? walletBalance > 50
            ? Math.max(
                Number(taxData.total) -
                  walletBalance,
                0,
              )
            : Number(taxData.total)
          : 0;

  const getTax = async () => {
    try {
      const formData = new FormData();

      formData.append('state', vehicleData.state);
      formData.append('category', vehicleData.category);
      formData.append('sub_category',vehicleData.sub_category);
      formData.append('duration',vehicleData.duration);
    formData.append(
      'no_of_seats',
      vehicleData.no_of_seats || '',
    );

    formData.append(
      'ac_type',
      vehicleData.ac_type || '',
    );

      const response = await fetch(
        `${BASE_URL}calculate-tax.php`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = await response.json();

      setTaxData(data);
    } catch (e) {
      console.log(e);
    }
  };

  const getUpi = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}upi.php`,
      );

      const data = await response.json();

      setUpi(data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const getBank = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}bank_details.php`,
      );

      const data = await response.json();

      setBank(data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const getQr = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}qr_code.php`,
      );

      const data = await response.json();

      setQr(data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const copyText = text => {
    Clipboard.setString(text);
    Alert.alert('Copied Successfully');
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
      },
      response => {
        if (response.assets) {
          setImage(response.assets[0]);
        }
      },
    );
  };

  const downloadQr = async imageUrl => {
    try {
      const path =
        RNFS.DownloadDirectoryPath +
        '/chalterho_qr.jpg';

      await RNFS.downloadFile({
        fromUrl: imageUrl,
        toFile: path,
      }).promise;

      Alert.alert(
        'Success',
        'QR Code Downloaded',
      );
    } catch (e) {
      console.log(e);
    }
  };

  const submitPayment = async () => {
   const userId = await AsyncStorage.getItem('userId');
    try {
      if (!paymentMode) {
        Alert.alert(
          'Please select payment mode',
        );
        return;
      }

      if (!image) {
        Alert.alert(
          'Upload transaction screenshot',
        );
        return;
      }
      const data = new FormData();
      Object.keys(vehicleData).forEach(key => {
        data.append(
          key,
          vehicleData[key],
        );
      });

      data.append(
        'payment_mode',
        paymentMode,
      );

      data.append(
        'amount',
        taxData.amount,
      );

      data.append(
        'service_fees',
        taxData.service_fees,
      );

      data.append(
        'uid',
        userId,
      );

      data.append(
        'payable',
        payableAmount,
      );

      data.append('t_id', {
        uri: image.uri,
        type: image.type,
        name:
          image.fileName ||
          'payment.jpg',
      });

      console.log(data);


      const response = await fetch(
        `${BASE_URL}save-payment.php`,
        {
          method: 'POST',
          body: data,
        },
      );

      const result = await response.json();
      if (result.status==true) {

          navigation.replace(
            'PaymentProcessingScreen',
            {
              paymentId: result.payment_id,
            },
          );


      } else {

        Alert.alert(
          'Error',
          result.message,
        );

      }

    } catch (e) {
      Alert.alert(
        'Error',
        'Something went wrong',
      );
    }
  };

  return (
  <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>
        Payment Details
      </Text>

{taxData && (
  <View style={styles.card}>
    <Text style={styles.price}>
      Tax : ₹{taxData.amount}
    </Text>

    <Text style={styles.price}>
      Service Fees :
      ₹{taxData.service_fees}
    </Text>

    <Text style={styles.price}>
      Sub Total :
      ₹{taxData.total}
    </Text>

    {walletBalance > 50 && (
      <Text style={styles.price}>
        Wallet Balance :
        ₹{walletBalance}
      </Text>
    )}

    <Text style={styles.total}>
      Payable :
      ₹{payableAmount}
    </Text>
  </View>
)}

      <View style={styles.card}>
        <Text style={styles.title}>
          QR Code
        </Text>

        {qr.map(item => {
          const imageUrl =
            `${ASSETS_URL}qrcode/${item.name}`;

          return (
            <View key={item.id}>
              <Image
                source={{
                  uri: imageUrl,
                }}
                style={styles.qr}
              />

              <TouchableOpacity
                onPress={() =>
                  downloadQr(imageUrl)
                }>
                <Ionicons
                  name="download-outline"
                  size={30}
                  color="orangered"
                  style={{
                    alignSelf: 'center',
                    marginTop: 10,
                  }}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          UPI ID
        </Text>

        {upi.map(item => (
          <View
            key={item.id}
            style={styles.row}>
            <Text style={styles.flex}>
              {item.name}
            </Text>

            <TouchableOpacity
              onPress={() =>
                copyText(item.name)
              }>
              <Ionicons
                name="copy-outline"
                size={22}
                color="green"
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Bank Details
        </Text>

        {bank.map(item => (
          <View
            key={item.id}
            style={{
              marginBottom: 20,
            }}>
            <Text
              style={{
                fontWeight: '700',
                marginBottom: 10,
              }}>
              {item.bank_name}
            </Text>

            <View style={styles.row}>
              <Text style={styles.flex}>
                A/C :
                {' '}
                {item.account_number}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  copyText(
                    item.account_number,
                  )
                }>
                <Ionicons
                  name="copy-outline"
                  size={22}
                  color="green"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <Text style={styles.flex}>
                IFSC :
                {' '}
                {item.ifsc_code}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  copyText(
                    item.ifsc_code,
                  )
                }>
                <Ionicons
                  name="copy-outline"
                  size={22}
                  color="green"
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          Payment Mode
        </Text>

        <Picker
          selectedValue={paymentMode}
          onValueChange={setPaymentMode}>
          <Picker.Item
            label="Select Payment Mode"
            value=""
          />

          <Picker.Item
            label="QR CODE"
            value="QR CODE"
          />

          <Picker.Item
            label="UPI"
            value="UPI"
          />

          <Picker.Item
            label="BANK TRANSFER"
            value="BANK TRANSFER"
          />
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.uploadBtn}
        onPress={pickImage}>
        <Ionicons
          name="cloud-upload-outline"
          size={22}
          color="#fff"
        />

        <Text
          style={styles.uploadText}>
          Upload Transaction Screenshot
        </Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{
            uri: image.uri,
          }}
          style={styles.preview}
        />
      )}

      <TouchableOpacity
        style={styles.payBtn}
        onPress={submitPayment}>
        <Text style={styles.payText}>
          Pay Now
        </Text>
      </TouchableOpacity>
    </ScrollView>
      </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },

  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 15,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },

  price: {
    fontSize: 16,
    marginBottom: 5,
  },

  total: {
    fontSize: 20,
    fontWeight: '700',
    color: 'green',
  },

  qr: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    resizeMode: 'contain',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },

  flex: {
    flex: 1,
  },

  uploadBtn: {
    backgroundColor: '#ff7a00',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  uploadText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },

  preview: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 10,
  },

  payBtn: {
    backgroundColor: 'orangered',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },

  payText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});