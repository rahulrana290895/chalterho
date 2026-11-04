
import React, {useEffect, useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar,
  Alert, Keyboard, ScrollView, ActivityIndicator, RefreshControl,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import notifee, {AndroidImportance} from '@notifee/react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {BASE_URL} from './config/config';
import {useTranslation} from 'react-i18next';

export default function RCDownload({navigation}) {
  const {t} = useTranslation();
  const [activeTab, setActiveTab] = useState('my');
  const [rcNumber, setRcNumber] = useState('');
  const [rcList, setRcList] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        setUserId(id);
      } catch (error) {
        console.log('User ID error:', error);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (userId && activeTab === 'my') fetchMyRCs();
  }, [userId, activeTab]);

  const fetchMyRCs = async (refresh = false) => {
    if (!userId) return;
    refresh ? setRefreshing(true) : setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}rc_list.php?user_id=${encodeURIComponent(userId)}`,
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || t('unableLoadRCs'));
      }

      setRcList(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.log('RC list error:', error);
      Alert.alert(t('error'), error.message || t('unableLoadRCs'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const searchRC = async () => {
    Keyboard.dismiss();
    const number = rcNumber.trim().toUpperCase();

    if (!number) {
      Alert.alert(t('required'), t('enterRCNumber'));
      return;
    }

    navigation.navigate('RCPaymentScreen', {rc_number: number});
  };

  const downloadRC = async item => {
    try {
      const pdfUrl = item.pdf_url || item.download_url;

      if (!pdfUrl || !/^https?:\/\//i.test(pdfUrl)) {
        Alert.alert(t('pdfNotAvailable'), t('validRCPdfNotFound'));
        return;
      }

      const number = String(item.rc_number || 'RC').replace(
        /[^a-zA-Z0-9\_-]/g, '_',
      );
      const fileName = `RC_${number}_${Date.now()}.pdf`;

      const channelId = await notifee.createChannel({
        id: 'rc_downloads',
        name: 'RC Downloads',
        importance: AndroidImportance.HIGH,
      });

      await notifee.requestPermission();

      const tempPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;
      const response = await ReactNativeBlobUtil.config({
        path: tempPath,
      }).fetch('GET', pdfUrl);

      if (response.info().status !== 200) {
        throw new Error(t('pdfDownloadFailed'));
      }

      const stats = await ReactNativeBlobUtil.fs.stat(tempPath);
      if (!stats.size || Number(stats.size) === 0) {
        throw new Error(t('downloadedPdfEmpty'));
      }

      const savedUri = await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
        {
          name: fileName,
          parentFolder: 'RC',
          mimeType: 'application/pdf',
        },
        'Download',
        tempPath,
      );

      if (!savedUri) throw new Error(t('unableSaveRC'));

      await ReactNativeBlobUtil.fs.unlink(tempPath).catch(() => {});

      await notifee.displayNotification({
        title: t('rcDownloadComplete'),
        body: t('rcFileSaved', {fileName}),
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: {id: 'default'},
        },
      });

      Alert.alert(t('downloadSuccessful'), t('rcDownloadPath'));
    } catch (error) {
      console.log('RC download error:', error);
      Alert.alert(
        t('downloadError'),
        error.message || t('pdfDownloadFailed'),
      );
    }
  };

  const renderRCCard = (item, index) => (
    <View style={styles.rcCard} key={String(item.id || item.rc_number || index)}>
      <View style={styles.cardTop}>
        <View style={styles.rcIcon}>
          <Ionicons name="car-sport-outline" size={27} color="#173F70" />
        </View>
        <View style={styles.cardHeading}>
          <Text style={styles.cardLabel}>{t('vehicleRegistration')}</Text>
          <Text style={styles.rcNumber}>{item.rc_number || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.divider} />
      <Text style={styles.detailLabel}>{t('ownerName')}</Text>
      <Text style={styles.detailValue}>{item.owner_name || 'N/A'}</Text>
      <Text style={styles.detailLabel}>{t('fatherName')}</Text>
      <Text style={styles.detailValue}>{item.father_name || 'N/A'}</Text>

      <TouchableOpacity
        style={styles.downloadButton}
        activeOpacity={0.85}
        onPress={() => downloadRC(item)}>
        <Ionicons name="download-outline" size={20} color="#FFFFFF" />
        <Text style={styles.downloadText}>{t('downloadRC')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={{flexGrow: 1, paddingBottom: 40}}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">

          <View style={styles.noticeBox}>
            <View style={styles.noticeIcon}>
              <Ionicons name="alert-circle-outline" size={25} color="#D97706" />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.noticeTitle}>{t('importantNotice')}</Text>
              <Text style={styles.noticeText}>{t('carefullyNotice')}</Text>
            </View>
          </View>

          <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'my' && styles.activeTab]}
              onPress={() => setActiveTab('my')}>
              <Ionicons name="documents-outline" size={19} color={activeTab === 'my' ? '#FFFFFF' : '#526780'} />
              <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
                {t('myRCs')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'search' && styles.activeTab]}
              onPress={() => setActiveTab('search')}>
              <Ionicons name="search-outline" size={19} color={activeTab === 'search' ? '#FFFFFF' : '#526780'} />
              <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
                {t('searchRC')}
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'my' ? (
            <View
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchMyRCs(true)}
                />
              }>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>{t('myRCRecords')}</Text>
                  <Text style={styles.sectionSubtitle}>
                    {t('savedVehicleRCDocuments')}
                  </Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{rcList.length}</Text>
                </View>
              </View>

              {loading ? (
                <ActivityIndicator size="large" color="#173F70" style={{marginTop: 40}} />
              ) : rcList.length > 0 ? (
                rcList.map(renderRCCard)
              ) : (
                <View style={styles.emptyBox}>
                  <Ionicons name="car-outline" size={55} color="#A5B4C7" />
                  <Text style={styles.emptyTitle}>{t('noRCRecordsFound')}</Text>
                  <Text style={styles.emptySubtitle}>
                    {t('searchRCToSave')}
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => setActiveTab('search')}>
                    <Text style={styles.emptyButtonText}>{t('searchRC')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}>
              <View style={styles.searchCard}>
                <View style={styles.illustration}>
                  <View style={styles.illustrationIcon}>
                    <Ionicons name="document-text-outline" size={62} color="#173F70" />
                    <View style={styles.carBadge}>
                      <Ionicons name="car-sport" size={31} color="#FF6818" />
                    </View>
                  </View>
                </View>

                <Text style={styles.title}>{t('searchVehicleRC')}</Text>
                <Text style={styles.subtitle}>
                  {t('enterVehicleNumberToFetchRC')}
                </Text>

                <Text style={styles.label}>{t('rcNumber')}</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="car-outline" size={21} color="#173F70" />
                  <TextInput
                    style={styles.input}
                    placeholder={t('rcNumberPlaceholder')}
                    placeholderTextColor="#8492A6"
                    value={rcNumber}
                    onChangeText={setRcNumber}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={20}
                    returnKeyType="search"
                    onSubmitEditing={searchRC}
                  />
                </View>

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color="#0873B9" />
                  <Text style={styles.infoText}>{t('rcSearchInfo')}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.button, searching && {opacity: 0.7}]}
                  disabled={searching}
                  activeOpacity={0.85}
                  onPress={searchRC}>
                  {searching ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>{t('searchRC')}</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>

                {searchResult && (
                  <View style={{marginTop: 24}}>
                    <Text style={styles.resultHeading}>{t('rcDetails')}</Text>
                    {renderRCCard(searchResult, 0)}
                  </View>
                )}

                <View style={styles.securityRow}>
                  <Ionicons name="shield-checkmark" size={17} color="#218653" />
                  <Text style={styles.securityText}>
                    {t('vehicleInformationSecurity')}
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
  container: {flex: 1, backgroundColor: '#F5F8FC'},
  header: {height: 56, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, elevation: 2},
  backButton: {padding: 5, marginRight: 10},
  headerTitle: {fontSize: 19, fontWeight: '800', color: '#17365D'},
  tabContainer: {flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10, gap: 10},
  tab: {flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 10, backgroundColor: '#EEF2F7', gap: 7},
  activeTab: {backgroundColor: '#173F70'},
  tabText: {fontSize: 13, fontWeight: '700', color: '#526780'},
  activeTabText: {color: '#FFFFFF'},
  scrollContent: {flexGrow: 1, padding: 14, paddingBottom: 30},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15},
  sectionTitle: {fontSize: 19, fontWeight: '800', color: '#17365D'},
  sectionSubtitle: {fontSize: 12, color: '#718198', marginTop: 4},
  countBadge: {minWidth: 34, height: 34, paddingHorizontal: 8, borderRadius: 17, backgroundColor: '#E5EEFA', alignItems: 'center', justifyContent: 'center'},
  countText: {fontWeight: '800', color: '#173F70'},
  rcCard: {backgroundColor: '#FFFFFF', borderRadius: 14, padding: 15, marginBottom: 14, borderWidth: 1, borderColor: '#E3EAF3', elevation: 1},
  cardTop: {flexDirection: 'row', alignItems: 'center'},
  rcIcon: {height: 48, width: 48, borderRadius: 12, backgroundColor: '#EEF5FF', justifyContent: 'center', alignItems: 'center'},
  cardHeading: {flex: 1, marginLeft: 12},
  cardLabel: {fontSize: 10, fontWeight: '700', color: '#7A8AA0', letterSpacing: 0.7},
  rcNumber: {fontSize: 15, fontWeight: '800', color: '#17365D', marginTop: 4},
  divider: {height: 1, backgroundColor: '#E8EDF4', marginVertical: 14},
  detailLabel: {fontSize: 11, color: '#7A8AA0', marginTop: 7},
  detailValue: {fontSize: 14, color: '#243B56', fontWeight: '600', marginTop: 3},
  downloadButton: {backgroundColor: '#FF6818', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 18},
  downloadText: {color: '#FFFFFF', fontSize: 13, fontWeight: '800'},
  emptyBox: {marginTop: 40, alignItems: 'center', padding: 22, backgroundColor: '#FFFFFF', borderRadius: 14},
  emptyTitle: {fontSize: 17, fontWeight: '800', color: '#17365D', marginTop: 12},
  emptySubtitle: {fontSize: 12, color: '#63758B', textAlign: 'center', lineHeight: 19, marginTop: 7},
  emptyButton: {marginTop: 18, backgroundColor: '#173F70', borderRadius: 9, paddingHorizontal: 18, paddingVertical: 11},
  emptyButtonText: {color: '#FFFFFF', fontWeight: '700'},
  searchCard: {backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5EDF6'},
  illustration: {alignItems: 'center', justifyContent: 'center', paddingVertical: 12},
  illustrationIcon: {width: 130, height: 110, backgroundColor: '#EEF5FF', borderRadius: 24, alignItems: 'center', justifyContent: 'center', position: 'relative'},
  carBadge: {position: 'absolute', right: 4, bottom: 3, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 3},
  title: {fontSize: 21, fontWeight: '800', color: '#17365D', textAlign: 'center', marginTop: 8},
  subtitle: {fontSize: 13, color: '#63758B', textAlign: 'center', lineHeight: 20, marginTop: 8, marginBottom: 24},
  label: {color: '#17365D', fontSize: 13, fontWeight: '700', marginBottom: 9},
  inputContainer: {flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DCE5EF', borderRadius: 9, paddingHorizontal: 10, minHeight: 48},
  input: {flex: 1, marginLeft: 9, color: '#172B45', fontSize: 13, paddingVertical: 9},
  infoBox: {flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EAF5FF', borderRadius: 8, padding: 10, marginTop: 16},
  infoText: {flex: 1, marginLeft: 8, fontSize: 11, lineHeight: 17, color: '#355D80'},
  button: {marginTop: 20, height: 49, borderRadius: 9, backgroundColor: '#FF6818', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10},
  buttonText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
  resultHeading: {fontSize: 16, fontWeight: '800', color: '#17365D', marginBottom: 12},
  securityRow: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 18},
  securityText: {color: '#63758B', fontSize: 11, marginLeft: 6},
  noticeBox: {backgroundColor: '#FFF8E8', borderWidth: 1, borderColor: '#F5D48A', padding: 11, marginBottom: 10, flexDirection: 'row', alignItems: 'center'},
  noticeIcon: {width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFE9B5', justifyContent: 'center', alignItems: 'center', marginRight: 10},
  noticeContent: {flex: 1},
  noticeTitle: {color: '#9A5B00', fontSize: 14, fontWeight: '800', marginBottom: 2},
  noticeText: {color: '#805B21', fontSize: 12, lineHeight: 17},
});
