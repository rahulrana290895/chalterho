import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';

export default function AboutUsScreen() {
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('aboutWhoWeAre')}</Text>

          <Text style={styles.text}>{t('aboutIntro1')}</Text>

          <Text style={styles.text}>{t('aboutIntro2')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('aboutPurpose')}</Text>

          <Text style={styles.quote}>{t('aboutPurposeQuote')}</Text>

          <Text style={styles.text}>{t('aboutPurposeText')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('aboutMission')}</Text>

          <Text style={styles.text}>{t('aboutMissionText')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('aboutVision')}</Text>

          <Text style={styles.text}>{t('aboutVisionText')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('aboutGoals')}</Text>

          <Text style={styles.point}>🚗 {t('aboutGoal1')}</Text>
          <Text style={styles.point}>⚡ {t('aboutGoal2')}</Text>
          <Text style={styles.point}>📞 {t('aboutGoal3')}</Text>
          <Text style={styles.point}>🌐 {t('aboutGoal4')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('aboutWhyChoose')}</Text>

          <Text style={styles.point}>✔ {t('aboutReason1')}</Text>
          <Text style={styles.point}>✔ {t('aboutReason2')}</Text>
          <Text style={styles.point}>✔ {t('aboutReason3')}</Text>
          <Text style={styles.point}>✔ {t('aboutReason4')}</Text>
          <Text style={styles.point}>✔ {t('aboutReason5')}</Text>
          <Text style={styles.point}>✔ {t('aboutReason6')}</Text>
        </View>

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            {t('aboutDisclaimer')}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },

  scrollContent: {
    paddingTop: 15,
    paddingBottom: 20,
  },

  header: {
    backgroundColor: 'orangered',
    padding: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },

  subtitle: {
    color: '#fff',
    marginTop: 5,
    opacity: 0.9,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 18,
    borderRadius: 15,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'orangered',
    marginBottom: 10,
  },

  text: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    marginBottom: 8,
  },

  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 10,
    lineHeight: 24,
  },

  point: {
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
    lineHeight: 22,
  },

  disclaimerContainer: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#FFE69C',
  },

  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#856404',
    fontWeight: '500',
    lineHeight: 18,
  },
});
