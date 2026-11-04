import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';

import {useTranslation} from 'react-i18next';

export default function PaymentCompletedScreen({
  navigation,
  route,
}) {
  const {t} = useTranslation();

  const documentUrl =
    `https://chalterho.com/assets/docs/${route?.params?.paymentId}`;

  const downloadDocument = async () => {
    try {
      const supported = await Linking.canOpenURL(documentUrl);

      if (supported) {
        await Linking.openURL(documentUrl);
      } else {
        Alert.alert(t('error'), t('unableOpenDocument'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('documentDownloadError'));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri: 'https://chalterho.com/app-assets/img/complete.png',
          }}
          style={styles.image}
        />

        <Text style={styles.title}>
          {t('requestCompleted')}
        </Text>

        <Text style={styles.message}>
          {t('requestCompletedMessage')}
        </Text>

        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={downloadDocument}>
          <Text style={styles.downloadText}>
            {t('downloadDocument')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.homeText}>
            {t('backToHome')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '700',
    color: 'green',
    textAlign: 'center',
  },
  message: {
    marginTop: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  downloadBtn: {
    marginTop: 25,
    backgroundColor: '#28a745',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  homeBtn: {
    marginTop: 15,
    backgroundColor: '#ffc107',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },
  homeText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});
