import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

const TermsConditionsScreen = () => {
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>

        <Text style={styles.title}>{t('termsTitle')}</Text>

        <Text style={styles.date}>
          {t('effectiveDate')}: 04 November 2026{"\n"}
          {t('lastUpdated')}: 04 November 2026
        </Text>

        <Text style={styles.paragraph}>
          {t('termsIntro')}
        </Text>

        <Text style={styles.heading}>{t('termsSection1')}</Text>
        <Text style={styles.paragraph}>{t('termsRole')}</Text>

        <Text style={styles.heading}>{t('termsSection2')}</Text>
        <Text style={styles.paragraph}>{t('termsResponsibilities')}</Text>

        <Text style={styles.heading}>{t('termsSection3')}</Text>
        <Text style={styles.paragraph}>{t('termsOTP')}</Text>

        <Text style={styles.heading}>{t('termsSection4')}</Text>
        <Text style={styles.paragraph}>{t('termsFees')}</Text>

        <Text style={styles.heading}>{t('termsSection5')}</Text>
        <Text style={styles.paragraph}>{t('termsProcessing')}</Text>

        <Text style={styles.heading}>{t('termsSection6')}</Text>
        <Text style={styles.paragraph}>{t('termsGovernmentThirdParty')}</Text>

        <Text style={styles.heading}>{t('termsSection7')}</Text>
        <Text style={styles.paragraph}>{t('termsSuspension')}</Text>

        <Text style={styles.heading}>{t('termsSection8')}</Text>
        <Text style={styles.paragraph}>{t('termsContact')}</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('thankYouForChoosing')}
          </Text>
          <Text style={styles.brand}>Chalte Rho</Text>
          <Text style={styles.contact}>
            info@chalterho.com{"\n"}
            9625065008
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsConditionsScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  content: {flex: 1},
  contentContainer: {padding: 20, paddingBottom: 30},
  title: {
    fontSize: 24, fontWeight: 'bold', color: 'orangered', marginBottom: 8,
  },
  date: {fontSize: 12, lineHeight: 20, marginBottom: 20},
  heading: {
    fontSize: 17, fontWeight: 'bold', color: '#17365D',
    marginTop: 20, marginBottom: 9,
  },
  paragraph: {
    fontSize: 14, lineHeight: 24, textAlign: 'justify', marginBottom: 8,
  },
  footer: {
    marginTop: 30, marginBottom: 15, padding: 20,
    backgroundColor: '#fff2ed', borderRadius: 12, alignItems: 'center',
  },
  footerText: {fontSize: 14},
  brand: {
    fontSize: 21, fontWeight: 'bold', color: 'orangered', marginTop: 7,
  },
  contact: {
    fontSize: 12, textAlign: 'center', lineHeight: 21, marginTop: 10,
  },
});