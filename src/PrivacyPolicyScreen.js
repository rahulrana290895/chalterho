
import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

const PrivacyPolicyScreen = () => {
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('privacyPolicy')}</Text>

        <Text style={styles.date}>
          {t('effectiveDate')}: 04 November 2026{"\n"}
          {t('lastUpdated')}: 04 November 2026
        </Text>

        <Text style={styles.paragraph}>{t('privacyIntro')}</Text>

        <Text style={styles.heading}>{t('businessInformation')}</Text>
        <Text style={styles.paragraph}>
          {t('businessName')}: Chalte Rho{"\n"}
          {t('registeredOffice')}: [Full postal address]{"\n"}
          Email: info@chalterho.com{"\n"}
          {t('phone')}: 9625065008{"\n"}
          Website: https://chalterho.com
        </Text>

        <Text style={styles.heading}>{t('privacySection1')}</Text>
        <Text style={styles.paragraph}>
          {t('privacyCollectIntro')}
          {"\n\n"}• {t('privacyMobileNumber')}
          {"\n\n"}• {t('privacyVehicleDetails')}
          {"\n\n"}• {t('privacyDocuments')}
          {"\n\n"}• {t('privacyOtp')}
          {"\n\n"}• {t('privacyPaymentInfo')}
          {"\n\n"}• {t('privacySupportInfo')}
          {"\n\n"}{t('privacyPasswordNotice')}
        </Text>

        <Text style={styles.heading}>{t('privacySection2')}</Text>
        <Text style={styles.paragraph}>
          {t('privacyUseIntro')}
          {"\n\n"}• {t('privacyUseService')}
          {"\n\n"}• {t('privacyUseContact')}
          {"\n\n"}• {t('privacyUsePayment')}
          {"\n\n"}• {t('privacyUseSupport')}
          {"\n\n"}• {t('privacyUseRecords')}
        </Text>

        <Text style={styles.paragraph}>{t('privacyOtpUsage')}</Text>

        <Text style={styles.heading}>{t('privacySection3')}</Text>
        <Text style={styles.paragraph}>{t('privacyGovernmentPortals')}</Text>

        <Text style={styles.heading}>{t('privacySection4')}</Text>
        <Text style={styles.paragraph}>{t('privacyPaymentProcessing')}</Text>

        <Text style={styles.heading}>{t('privacySection5')}</Text>
        <Text style={styles.paragraph}>
          {t('privacySharingIntro')}
          {"\n\n"}• {t('privacyShareGovernment')}
          {"\n\n"}• {t('privacySharePayment')}
          {"\n\n"}• {t('privacyShareProviders')}
          {"\n\n"}• {t('privacyShareLegal')}
          {"\n\n"}{t('privacyNoSelling')}
        </Text>

        <Text style={styles.heading}>{t('privacySection6')}</Text>
        <Text style={styles.paragraph}>{t('privacySecurityRetention')}</Text>

        <Text style={styles.heading}>{t('privacySection7')}</Text>
        <Text style={styles.paragraph}>
          {t('privacyContactIntro')}
          {"\n\n"}{t('businessName')}: Chalte Rho
          {"\n"}Email: info@chalterho.com
          {"\n"}{t('phone')}: 9625065008
          {"\n"}{t('address')}: [Full postal address]
          {"\n"}Website: https://chalterho.com
        </Text>

        <View style={{height: 30}} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {padding: 20, paddingBottom: 30},
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'orangered',
    marginBottom: 8,
  },
  date: {
    color: '#888',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 20,
  },
  heading: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: '#555',
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 12,
  },
});
