
import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

const RefundPolicyScreen = () => {
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{t('refundPolicyTitle')}</Text>

        <Text style={styles.date}>
          {t('effectiveDate')}: 04 November 2026{"\n"}
          {t('lastUpdated')}: 04 November 2026
        </Text>

        <Text style={styles.intro}>{t('refundIntro')}</Text>

        <Text style={styles.heading}>{t('refundSection1')}</Text>
        <Text style={styles.subHeading}>{t('vehicleTaxCancellations')}</Text>
        <Text style={styles.paragraph}>{t('vehicleTaxCancellationDetails')}</Text>

        <Text style={styles.subHeading}>{t('incorrectCustomerDetails')}</Text>
        <Text style={styles.paragraph}>{t('incorrectCustomerDetailsText')}</Text>

        <Text style={styles.subHeading}>{t('rcDlApiServices')}</Text>
        <Text style={styles.paragraph}>{t('rcDlApiServicesText')}</Text>
        <Text style={styles.paragraph}>{t('thirdPartyRefundText')}</Text>

        <Text style={styles.subHeading}>{t('refundRequestsPayment')}</Text>
        <Text style={styles.paragraph}>{t('refundRequestsPaymentText')}</Text>

        <Text style={styles.heading}>{t('refundSection2')}</Text>
        <Text style={styles.paragraph}>{t('serviceProcessingIntro')}</Text>

        <Text style={styles.subHeading}>{t('vehicleTaxRequests')}</Text>
        <Text style={styles.paragraph}>{t('vehicleTaxRequestsText')}</Text>

        <Text style={styles.subHeading}>{t('apiBasedRCDLServices')}</Text>
        <Text style={styles.paragraph}>{t('apiBasedRCDLText')}</Text>

        <Text style={styles.subHeading}>{t('otpBasedServices')}</Text>
        <Text style={styles.paragraph}>{t('otpBasedServicesText')}</Text>

        <Text style={styles.subHeading}>{t('delaysIncompleteRequests')}</Text>
        <Text style={styles.paragraph}>{t('delaysIncompleteRequestsText')}</Text>

        <Text style={styles.heading}>{t('refundSection3')}</Text>
        <Text style={styles.paragraph}>{t('governmentApiDisclaimer')}</Text>

        <Text style={styles.heading}>{t('refundSection4')}</Text>
        <Text style={styles.paragraph}>{t('grievanceContactText')}</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('thankYouChalteRho')}</Text>
          <Text style={styles.brand}>Chalte Rho</Text>
          <Text style={styles.contact}>
            info@chalterho.com{"\n"}
            9625065008{"\n"}
            https://chalterho.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RefundPolicyScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {flex: 1},
  contentContainer: {paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20},
  title: {fontSize: 23, fontWeight: 'bold', color: 'orangered', marginBottom: 8},
  date: {fontSize: 12, color: '#888', lineHeight: 20, marginBottom: 20},
  intro: {fontSize: 14, color: '#555', lineHeight: 23, marginBottom: 10, textAlign: 'justify'},
  heading: {fontSize: 17, fontWeight: 'bold', color: '#222', marginTop: 22, marginBottom: 10},
  subHeading: {fontSize: 15, fontWeight: 'bold', color: 'orangered', marginTop: 14, marginBottom: 7},
  paragraph: {fontSize: 14, color: '#555', lineHeight: 24, textAlign: 'justify', marginBottom: 10},
  footer: {marginTop: 30, marginBottom: 20, padding: 20, backgroundColor: '#fff2ed', borderRadius: 12, alignItems: 'center'},
  footerText: {fontSize: 14, color: '#555'},
  brand: {fontSize: 20, fontWeight: 'bold', color: 'orangered', marginTop: 8},
  contact: {fontSize: 12, color: '#777', textAlign: 'center', lineHeight: 21, marginTop: 10},
});
