import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useTranslation} from 'react-i18next';
export default function HelplineScreen() {
 const {t} = useTranslation();
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
      <Text style={styles.heading}>{t('helpSupport')}</Text>
      <Text style={styles.subHeading}>
        {t('contactSupport')}
      </Text>


      <TouchableOpacity style={styles.card}
        onPress={makeCall}>
        <Text style={styles.icon}>🕒</Text>
        <View>
         <Text style={styles.title}>24X7</Text>
         <Text style={styles.value}>{t('open')}</Text>
        </View>
      </TouchableOpacity>


      <TouchableOpacity
        style={styles.card}
        onPress={makeCall}>
        <Text style={styles.icon}>📞</Text>
        <View>
         <Text style={styles.title}>{t('callUs')}</Text>
          <Text style={styles.value}>
            +91-9625065008
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={openWhatsApp}>
        <Icon
          name="whatsapp"
          size={32}
          color="#25D366"
          style={styles.icon}
        />
        <View>
         <Text style={styles.title}>{t('whatsapp')}</Text>
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
          <Text style={styles.title}>{t('email')}</Text>
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