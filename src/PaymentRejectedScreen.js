
import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {useTranslation} from 'react-i18next';

export default function PaymentRejectedScreen({navigation}) {
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={{uri: 'https://chalterho.com/app-assets/img/rejected.png'}} style={styles.image} />

        <Text style={styles.title}>{t('requestRejected')}</Text>

        <Text style={styles.message}>{t('requestRejectedMessage')}</Text>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.buttonText}>{t('backToHome')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', padding: 20},
  card: {backgroundColor: '#fff', borderRadius: 15, padding: 25, alignItems: 'center', elevation: 5},
  image: {width: 150, height: 150, resizeMode: 'contain'},
  title: {marginTop: 15, fontSize: 24, fontWeight: 'bold', color: '#dc3545', textAlign: 'center'},
  message: {marginTop: 15, textAlign: 'center', fontSize: 16, color: '#333', lineHeight: 24},
  button: {marginTop: 25, backgroundColor: '#ffc107', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 8},
  buttonText: {color: '#000', fontWeight: '700', fontSize: 16},
});
