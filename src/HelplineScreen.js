import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useTranslation} from 'react-i18next';

export default function HelplineScreen() {
  const {t} = useTranslation();

  const phoneNumber = '+919625065008';
  const email = 'info@chalterho.com';

  const instagramUrl = 'https://www.instagram.com/chalterho.services/';
  const facebookUrl  =  'https://www.facebook.com/profile.php?id=61591310758530';
  const whatsappChannelUrl = 'https://whatsapp.com/channel/0029VbDyxwg8F2pLoaHkMb0S';

  const openLink = async url => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open this link.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  const makeCall = () => {
    openLink(`tel:${phoneNumber}`);
  };

  const openWhatsApp = () => {
    openLink(`https://wa.me/${phoneNumber.replace('+', '')}`);
  };

  const sendEmail = () => {
    openLink(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>{t('helpSupport')}</Text>

        <Text style={styles.subHeading}>
          {t('contactSupport')}
        </Text>

        {/* 24X7 Support */}
        <TouchableOpacity style={styles.card} onPress={makeCall}>
          <Text style={styles.emojiIcon}>🕒</Text>
          <View>
            <Text style={styles.title}>24X7</Text>
            <Text style={styles.value}>{t('open')}</Text>
          </View>
        </TouchableOpacity>

        {/* Call Us */}
        <TouchableOpacity style={styles.card} onPress={makeCall}>
          <Text style={styles.emojiIcon}>📞</Text>
          <View>
            <Text style={styles.title}>{t('callUs')}</Text>
            <Text style={styles.value}>+91-9625065008</Text>
          </View>
        </TouchableOpacity>

        {/* WhatsApp Support */}
        <TouchableOpacity style={styles.card} onPress={openWhatsApp}>
          <Icon
            name="whatsapp"
            size={32}
            color="#25D366"
            style={styles.icon}
          />
          <View>
            <Text style={styles.title}>{t('whatsapp')}</Text>
            <Text style={styles.value}>+91-9625065008</Text>
          </View>
        </TouchableOpacity>

        {/* Email */}
        <TouchableOpacity style={styles.card} onPress={sendEmail}>
          <Text style={styles.emojiIcon}>✉️</Text>
          <View>
            <Text style={styles.title}>{t('email')}</Text>
            <Text style={styles.value}>info@chalterho.com</Text>
          </View>
        </TouchableOpacity>

        {/* CONNECT WITH US SECTION */}
<View style={styles.connectSection}>
  <Text style={styles.connectHeading}>Connect With Us</Text>
  <Text style={styles.connectSubHeading}>
    Follow ChalteRho on social media
  </Text>

  <View style={styles.socialRow}>
    {/* Instagram */}
    <TouchableOpacity
      style={styles.socialItem}
      onPress={() => openLink(instagramUrl)}>
      <View style={[styles.socialIconBox, {backgroundColor: '#FCE4EC'}]}>
        <Icon name="instagram" size={27} color="#E1306C" />
      </View>
      <Text style={styles.socialLabel}>Instagram</Text>
    </TouchableOpacity>

    {/* Facebook */}
    <TouchableOpacity
      style={styles.socialItem}
      onPress={() => openLink(facebookUrl)}>
      <View style={[styles.socialIconBox, {backgroundColor: '#E3F2FD'}]}>
        <Icon name="facebook" size={27} color="#1877F2" />
      </View>
      <Text style={styles.socialLabel}>Facebook</Text>
    </TouchableOpacity>

    {/* WhatsApp Channel */}
    <TouchableOpacity
      style={styles.socialItem}
      onPress={() => openLink(whatsappChannelUrl)}>
      <View style={[styles.socialIconBox, {backgroundColor: '#E8F5E9'}]}>
        <Icon name="whatsapp" size={27} color="#25D366" />
      </View>
      <Text style={styles.socialLabel}>WhatsApp</Text>
      <Text style={styles.channelLabel}>Channel</Text>
    </TouchableOpacity>
  </View>
</View>
        <View style={{height: 25}} />
      </ScrollView>
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
    marginRight: 15,
    width: 35,
    textAlign: 'center',
  },
  emojiIcon: {
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

  // Connect With Us
  connectSection: {
    marginTop: 25,
  },
  connectHeading: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#222',
  },
  connectSubHeading: {
    fontSize: 14,
    color: '#777',
    marginTop: 6,
    marginBottom: 18,
  },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 13,
    elevation: 3,
  },
  socialIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    flex: 1,
    marginLeft: 14,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  socialValue: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 14,
    elevation: 3,
    marginBottom: 15,
  },

  socialItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  socialIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  socialLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },

  channelLabel: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },
});