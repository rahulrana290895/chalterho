import React, {useEffect, useState} from 'react';
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
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import notifee, {AndroidImportance} from '@notifee/react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BASE_URL} from './config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {useTranslation} from 'react-i18next';

export default function DrivingLicenceScreen({navigation}) {
  const {t} = useTranslation();

  const [activeTab, setActiveTab] = useState('my');
  const [dlNumber, setDlNumber] = useState('');
  const [dob, setDob] = useState('');
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId);
      } catch (error) {
        console.log('Error getting user ID:', error);
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    if (activeTab === 'my' && userId) {
      fetchMyLicences();
    }
  }, [activeTab, userId]);

  // Fetch saved licences
  const fetchMyLicences = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}driving_licences_list.php?user_id=${userId}`,
      );

      const result = await response.json();

      if (result.success) {
        setLicences(Array.isArray(result.data) ? result.data : []);
      } else {
        setLicences([]);
      }
    } catch (error) {
      Alert.alert(t('error'), t('dlLoadSavedError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Search licence
  const searchLicence = () => {
    Keyboard.dismiss();

    const number = dlNumber.trim().toUpperCase();
    const birthDate = dob.trim();

    if (!number) {
      Alert.alert(t('required'), t('dlEnterNumber'));
      return;
    }

    if (!/^\d{2}-\d{2}-\d{4}$/.test(birthDate)) {
      Alert.alert(t('required'), t('dlInvalidDob'));
      return;
    }

    navigation.navigate('DrivingLicencePaymentScreen', {
      dlNumber: number,
      dob: birthDate,
    });
  };

  // Download licence PDF
  const downloadLicence = async item => {
    try {
      const pdfUrl = item.pdf_url || item.download_url;

      if (!pdfUrl || !/^https?:\/\//i.test(pdfUrl)) {
        Alert.alert(
          t('dlPdfUnavailable'),
          t('dlPdfUrlMissing'),
        );
        return;
      }

      const safeNumber = String(
        item.license_number || 'DrivingLicence',
      ).replace(/[^a-zA-Z0-9_-]/g, '_');

      const fileName = `DL_${safeNumber}_${Date.now()}.pdf`;

      const channelId = await notifee.createChannel({
        id: 'dl_downloads',
        name: t('dlDownloadChannel'),
        importance: AndroidImportance.HIGH,
      });

      await notifee.requestPermission();

      const tempPath =
        `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;

      const response = await ReactNativeBlobUtil.config({
        path: tempPath,
      }).fetch('GET', pdfUrl);

      if (response.info().status !== 200) {
        throw new Error(
          `${t('dlPdfDownloadFailed')}: ${response.info().status}`,
        );
      }

      const stats = await ReactNativeBlobUtil.fs.stat(tempPath);

      if (!stats.size || Number(stats.size) === 0) {
        throw new Error(t('dlPdfEmpty'));
      }

      // Save PDF in Download/DL folder
      const savedUri =
        await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
          {
            name: fileName,
            parentFolder: 'DL',
            mimeType: 'application/pdf',
          },
          'Download',
          tempPath,
        );

      if (!savedUri) {
        throw new Error(t('dlSaveError'));
      }

      // Remove temporary file
      await ReactNativeBlobUtil.fs
        .unlink(tempPath)
        .catch(() => {});

      // Notification
      await notifee.displayNotification({
        title: t('dlDownloadComplete'),
        body: t('dlFileSaved', {fileName}),
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      });

      Alert.alert(
        t('downloadSuccessful'),
        t('dlDownloadPath'),
      );
    } catch (error) {
      console.log('DL Download Error:', error);

      Alert.alert(
        t('downloadFailed'),
        error.message || t('dlDownloadError'),
      );
    }
  };

  // Licence card
  const renderLicenceCard = item => (
    <View style={styles.licenceCard} key={String(item.id)}>
      <View style={styles.cardTop}>
        <View style={styles.smallIcon}>
          <Ionicons name="card-outline" size={25} color="#173F70" />
        </View>

        <View style={styles.cardHeading}>
          <Text style={styles.licenceLabel}>
            {t('drivingLicence')}
          </Text>

          <Text style={styles.licenceNumber}>
            {item.license_number || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <Text style={styles.detailLabel}>{t('name')}</Text>
      <Text style={styles.detailValue}>{item.name || 'N/A'}</Text>

      <Text style={styles.detailLabel}>
        {t('fatherHusbandName')}
      </Text>

      <Text style={styles.detailValue}>
        {item.father_or_husband_name || 'N/A'}
      </Text>

      <View style={styles.dobRow}>
        <View style={{flex: 1}}>
          <Text style={styles.detailLabel}>
            {t('dateOfBirth')}
          </Text>

          <Text style={styles.detailValue}>
            {item.dob ? String(item.dob).slice(0, 10) : 'N/A'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.downloadButton}
          activeOpacity={0.85}
          onPress={() => downloadLicence(item)}>
          <Ionicons
            name="download-outline"
            size={19}
            color="#FFFFFF"
          />
          <Text style={styles.downloadText}>
            {t('download')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>

        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            activeTab === 'my' ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchMyLicences(true)}
              />
            ) : undefined
          }>

          <StatusBar
            backgroundColor="#FFFFFF"
            barStyle="dark-content"
          />

          {/* Important Notice */}
          <View style={styles.noticeBox}>
            <View style={styles.noticeIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={25}
                color="#D97706"
              />
            </View>

            <View style={{flex: 1}}>
              <Text style={styles.noticeTitle}>
                {t('importantNotice')}
              </Text>

              <Text style={styles.noticeText}>
                {t('carefullyNotice')}
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'my' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('my')}>

              <Ionicons
                name="documents-outline"
                size={19}
                color={activeTab === 'my' ? '#FFFFFF' : '#526780'}
              />

              <Text
                style={[
                  styles.tabText,
                  activeTab === 'my' && styles.activeTabText,
                ]}>
                {t('myLicences')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'search' && styles.activeTab,
              ]}
              onPress={() => setActiveTab('search')}>

              <Ionicons
                name="search-outline"
                size={19}
                color={activeTab === 'search' ? '#FFFFFF' : '#526780'}
              />

              <Text
                style={[
                  styles.tabText,
                  activeTab === 'search' && styles.activeTabText,
                ]}>
                {t('searchLicence')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* My Licences */}
          {activeTab === 'my' ? (
            <View style={styles.scrollContent}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    {t('myDrivingLicences')}
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    {t('savedLicenceRecords')}
                  </Text>
                </View>

                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {licences.length}
                  </Text>
                </View>
              </View>

              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#173F70"
                  style={{marginTop: 40}}
                />
              ) : licences.length > 0 ? (
                licences.map(renderLicenceCard)
              ) : (
                <View style={styles.emptyBox}>
                  <Ionicons
                    name="document-text-outline"
                    size={52}
                    color="#A5B4C7"
                  />

                  <Text style={styles.emptyTitle}>
                    {t('noLicencesFound')}
                  </Text>

                  <Text style={styles.emptySubtitle}>
                    {t('searchAndSaveLicence')}
                  </Text>

                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => setActiveTab('search')}>
                    <Text style={styles.emptyButtonText}>
                      {t('searchLicence')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            /* Search Licence */
            <View style={styles.scrollContent}>
              <View style={styles.searchCard}>
                <View style={styles.illustration}>
                  <View style={styles.licenseIcon}>
                    <Ionicons
                      name="card-outline"
                      size={62}
                      color="#173F70"
                    />

                    <Ionicons
                      name="car-sport"
                      size={34}
                      color="#FF6818"
                      style={styles.carIcon}
                    />
                  </View>
                </View>

                <Text style={styles.title}>
                  {t('searchDrivingLicence')}
                </Text>

                <Text style={styles.subtitle}>
                  {t('dlSearchDescription')}
                </Text>

                <Text style={styles.label}>
                  {t('drivingLicenceNumber')}
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="card-outline"
                    size={20}
                    color="#173F70"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder={t('enterDlNumber')}
                    placeholderTextColor="#8492A6"
                    value={dlNumber}
                    onChangeText={setDlNumber}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={25}
                    returnKeyType="next"
                  />
                </View>

                <Text style={[styles.label, {marginTop: 18}]}>
                  {t('dateOfBirth')}
                </Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#173F70"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder={t('dobPlaceholder')}
                    placeholderTextColor="#8492A6"
                    value={dob}
                    onChangeText={text => {
                      let value = text.replace(/\D/g, '');

                      if (value.length > 2) {
                        value =
                          value.slice(0, 2) + '-' + value.slice(2);
                      }

                      if (value.length > 5) {
                        value =
                          value.slice(0, 5) + '-' + value.slice(5, 9);
                      }

                      setDob(value);
                    }}
                    keyboardType="numeric"
                    maxLength={10}
                    returnKeyType="done"
                    onSubmitEditing={searchLicence}
                  />
                </View>

                <View style={styles.infoBox}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#0873B9"
                  />

                  <Text style={styles.infoText}>
                    {t('dlVerificationInfo')}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.button}
                  activeOpacity={0.85}
                  onPress={searchLicence}>
                  <Text style={styles.buttonText}>
                    {t('fetchDetails')}
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                <View style={styles.securityRow}>
                  <Ionicons
                    name="shield-checkmark"
                    size={17}
                    color="#218653"
                  />

                  <Text style={styles.securityText}>
                    {t('dlSecurityMessage')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FC',
    padding: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EEF2F7',
    gap: 7,
  },
  activeTab: {
    backgroundColor: '#173F70',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#526780',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 14,
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#17365D',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#718198',
    marginTop: 4,
  },
  countBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 8,
    borderRadius: 17,
    backgroundColor: '#E5EEFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontWeight: '800',
    color: '#173F70',
  },
  licenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E3EAF3',
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIcon: {
    height: 48,
    width: 48,
    borderRadius: 12,
    backgroundColor: '#EEF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeading: {
    flex: 1,
    marginLeft: 12,
  },
  licenceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7A8AA0',
    letterSpacing: 0.7,
  },
  licenceNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#17365D',
    marginTop: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E8EDF4',
    marginVertical: 14,
  },
  detailLabel: {
    fontSize: 11,
    color: '#7A8AA0',
    marginTop: 7,
  },
  detailValue: {
    fontSize: 14,
    color: '#243B56',
    fontWeight: '600',
    marginTop: 3,
  },
  dobRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  downloadButton: {
    backgroundColor: '#FF6818',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyBox: {
    marginTop: 40,
    alignItems: 'center',
    padding: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#17365D',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#718198',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 7,
  },
  emptyButton: {
    marginTop: 18,
    backgroundColor: '#173F70',
    borderRadius: 9,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5EDF6',
  },
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  licenseIcon: {
    width: 130,
    height: 110,
    backgroundColor: '#EEF5FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  carIcon: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#17365D',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#63758B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 24,
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
    fontSize: 13,
    paddingVertical: 9,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EAF5FF',
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
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
  noticeBox: {
    backgroundColor: '#FFF8E8',
    borderWidth: 1,
    borderColor: '#F5D48A',
    padding: 11,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFE9B5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  noticeTitle: {
    color: '#9A5B00',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  noticeText: {
    color: '#805B21',
    fontSize: 12,
    lineHeight: 17,
  },
});
