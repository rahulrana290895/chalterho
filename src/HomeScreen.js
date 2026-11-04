import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  NativeModules,
  Dimensions,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SpInAppUpdates, {
  IAUUpdateKind,
} from 'sp-react-native-in-app-updates';

import {BASE_URL, ASSETS_URL} from './config/config';
import {useTranslation} from 'react-i18next';
import {changeAppLanguage} from './i18n';

const {ReviewModule} = NativeModules;

const LANGUAGES = [
  {code: 'en', label: 'English'},
  {code: 'hi', label: 'हिंदी'},
  {code: 'pa', label: 'ਪੰਜਾਬੀ'},
];

const SERVICE_TRANSLATION_KEYS = {
  'Vehicle Tax': 'vehicleTax',
  'Insurances': 'insurances',
  'Insurance': 'insurances',
  'ISTP': 'istp',
  'FASTag Recharge': 'fastagRecharge',
  'RC Mobile Number Update': 'rcMobileNumberUpdate',
  'GST Challan (Vehicle)': 'gstChallan',
  'Fancy Number': 'fancyNumber',
  'E-Challan': 'eChallan',
  'ALL INDIA PERMIT': 'allIndiaPermit',
  'PF Withdrawal Service': 'pfWithdrawalService',
  'PF Withdrawal': 'pfWithdrawalService',
};

export default function HomeScreen({navigation}) {
  const {t, i18n} = useTranslation();

  const [showLanguages, setShowLanguages] = useState(false);
  const [services, setServices] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerRef = useRef(null);
  const BANNER_WIDTH = Dimensions.get('window').width - 24;

  const currentLanguage = (i18n.language || 'en').split('-')[0];


useEffect(() => {
getServices();
getBalance();
checkForAppUpdate();
requestAppReview();
getNotice()
getBanners();
}, []);
useFocusEffect(
  useCallback(() => {
    setShowLanguages(false);
    return () => {
      setShowLanguages(false);
    };
  }, []),
);
useEffect(() => {
  if (notices.length <= 1) return;
  const interval = setInterval(() => {
    setNoticeIndex(previousIndex =>
      (previousIndex + 1) % notices.length
    );
  }, 4000);
  return () => clearInterval(interval);
}, [notices]);
useEffect(() => {
  if (banners.length <= 1) return;

  const interval = setInterval(() => {
    setBannerIndex(previousIndex => {
      const nextIndex = (previousIndex + 1) % banners.length;

      bannerRef.current?.scrollTo({
        x: nextIndex * BANNER_WIDTH,
        animated: true,
      });

      return nextIndex;
    });
  }, 4000);

  return () => clearInterval(interval);
}, [banners, BANNER_WIDTH]);

const checkForAppUpdate = async () => {
    try {
      const inAppUpdates = new SpInAppUpdates(false);
      const result = await inAppUpdates.checkNeedsUpdate();

      console.log('Update Check:', result);

      if (result.shouldUpdate) {
        await inAppUpdates.startUpdate({
          updateType: IAUUpdateKind.IMMEDIATE,
        });
      }
    } catch (error) {
      console.log('App Update Error:', error);
    }
  };
const requestAppReview = async () => {
    try {
      if (!ReviewModule) {
        console.log('ReviewModule not available');
        return;
      }

      await ReviewModule.requestReview();
      console.log('Review request completed');
    } catch (error) {
      console.log('Review Error:', error);
    }
  };
const getBalance = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');

      if (!uid) {
        return;
      }
      const response = await fetch(
        `${BASE_URL}get-balance.php?uid=${encodeURIComponent(uid)}`,
      );

      const result = await response.json();

      if (result.status) {
        setBalance(result.balance);
      }
    } catch (error) {
      console.log('Balance API Error:', error);
    }
  };
const getServices = async () => {
    try {
      const response = await fetch(`${BASE_URL}services.php`);

      if (!response.ok) {
        throw new Error(`Services API error: ${response.status}`);
      }

      const data = await response.json();

      const vehicleTaxService = {
        id: 'vehicle_tax',
        name: 'Vehicle Tax',
        image: 'https://chalterho.com/app-assets/img/services/tax.png',
        isStatic: true,
      };
       const drivingLicenceService = {
         id: 'driving_licence',
         name: 'Driving Licence',
         image: 'https://chalterho.com/app-assets/img/services/dl.png',
         isStatic: true,
         isDrivingLicence: true,
       };
       const rcDownloadService = {
         id: 'rc_download',
         name: 'RC Download',
         image: 'https://chalterho.com/app-assets/img/services/rc.png',
         isStatic: true,
         isRCDownload: true,
       };

      const apiServices = Array.isArray(data) ? data : [];

      setServices([vehicleTaxService,drivingLicenceService,rcDownloadService, ...apiServices]);
    } catch (error) {
      console.log('API Error:', error);
      setServices([
        {
          id: 'vehicle_tax',
          name: 'Vehicle Tax',
          image: 'https://chalterho.com/app-assets/img/services/tax.png',
          isStatic: true,
        },
        {
          id: 'driving_licence',
           name: 'Driving Licence',
            image: 'https://chalterho.com/app-assets/img/services/dl.png',
          isStatic: true,
        },
        {
          id: 'rc_download',
          name: 'RC Download',
          image: 'https://chalterho.com/app-assets/img/services/rc.png',
          isStatic: true,
          isRCDownload: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
const getNotice = async () => {
  try {
    const response = await fetch(`${BASE_URL}get-notice.php`);
    const result = await response.json();

    if (result.status && Array.isArray(result.notices)) {
      const noticeList = result.notices.map(item => item.notice);

      setNotices(noticeList);
      setNoticeIndex(0);
    } else {
      setNotices([]);
    }
  } catch (error) {
    console.log('Notice Error:', error);
  }
};
const selectLanguage = async language => {
    try {
      await changeAppLanguage(language);
      setShowLanguages(false);
    } catch (error) {
      console.log('Language change error:', error);
    }
  };
const getServiceName = item => {
    const key = SERVICE_TRANSLATION_KEYS[
      String(item.name || '').trim()
    ];

    return key ? t(key) : item.name;
  };
const getBanners = async () => {
  try {
    const response = await fetch(`${BASE_URL}banners.php`);
    const result = await response.json();

    if (result.status && Array.isArray(result.banners)) {
      setBanners(result.banners);
      setBannerIndex(0);
    } else {
      setBanners([]);
    }
  } catch (error) {
    console.log('Banner API Error:', error);
  }
};

const renderService = ({item}) => (
    <TouchableOpacity
      style={styles.serviceItem}
      activeOpacity={0.8}
        onPress={() => {
          if (item.isDrivingLicence) {
            navigation.navigate('DrivingLicenceScreen');
          } else if (item.isRCDownload) {
            navigation.navigate('RCDownloadScreen');
          } else if (item.isStatic) {
            navigation.navigate('VehicleTexScreen');
          } else {
            navigation.navigate('ServiceDetailScreen', {
              service: item,
            });
          }
        }}>
      <Image
        source={{
          uri: item.isStatic
            ? item.image
            : `${ASSETS_URL}image/${item.image}`,
        }}
        style={styles.icon}
      />

      <Text numberOfLines={2} style={styles.serviceName}>
        {getServiceName(item)}
      </Text>
    </TouchableOpacity>
  );
  if (loading) {
    return (
      <SafeAreaView style={styles.loader} edges={['top']}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <ActivityIndicator size="large" color="orangered" />
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header remains outside ScrollView so the dropdown can overlay content */}
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <Image
              source={require('./assets/logo.png')}
              style={styles.logo}
            />

            <Text style={styles.headerTitle}>CHALTE RHO</Text>
          </View>

          <View style={styles.rightSection}>
            {/* Language selector */}
            <View style={styles.languageContainer}>
              <TouchableOpacity
                style={styles.languageButton}
                onPress={() =>
                  setShowLanguages(previous => !previous)
                }
                activeOpacity={0.8}>
                <Text style={styles.languageButtonText}>
                  {LANGUAGES.find(
                    language => language.code === currentLanguage,
                  )?.label || 'English'}{' '}
                  ▼
                </Text>
              </TouchableOpacity>

              {showLanguages && (
                <View style={styles.languageDropdown}>
                  {LANGUAGES.map(language => {
                    const isSelected =
                      currentLanguage === language.code;

                    return (
                      <TouchableOpacity
                        key={language.code}
                        style={[
                          styles.languageOption,
                          isSelected &&
                            styles.selectedLanguageOption,
                        ]}
                        onPress={() =>
                          selectLanguage(language.code)
                        }
                        activeOpacity={0.7}>
                        <Text
                          style={[
                            styles.languageOptionText,
                            isSelected &&
                              styles.selectedLanguageText,
                          ]}>
                          {language.label}
                          {isSelected ? ' ✓' : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Notification Button */}
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('NotificationScreen')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="notifications-outline"
                size={25}
                color="#000000"
              />
            </TouchableOpacity>
            {/* Existing menu */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.navigate('MoreScreen')}
              activeOpacity={0.7}>
              <Ionicons
                name="menu-outline"
                size={28}
                color="#000000"
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          {/* Notice */}
{/* Auto Changing Notice */}
{notices.length > 0 && (
  <View style={styles.noticeContainer}>
    <Ionicons
      name="information-circle"
      size={20}
      color="#FFFFFF"
      style={styles.noticeIcon}
    />

    <Text style={styles.noticeText} numberOfLines={2}>
      {notices[noticeIndex]}
    </Text>
  </View>
)}

          {/* Banner */}
{/* API BANNER CAROUSEL */}
{banners.length > 0 && (
  <View style={styles.bannerContainer}>
    <ScrollView
      ref={bannerRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={event => {
        const index = Math.round(
          event.nativeEvent.contentOffset.x / BANNER_WIDTH,
        );
        setBannerIndex(index);
      }}>

      {banners.map(item => (
        <TouchableOpacity
          key={String(item.id)}
          activeOpacity={0.9}
          onPress={() => {
            if (item.screen) {
              navigation.navigate(item.screen);
            }
          }}
          style={{width: BANNER_WIDTH}}>

          <Image
            source={{
              uri: `${item.image}`,
            }}
            style={styles.banner}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>

    {/* Carousel Dots */}
    {banners.length > 1 && (
      <View style={styles.bannerDots}>
        {banners.map((item, index) => (
          <View
            key={String(item.id)}
            style={[
              styles.bannerDot,
              bannerIndex === index && styles.activeBannerDot,
            ]}
          />
        ))}
      </View>
    )}
  </View>
)}

          {/* Vehicle services */}
          <View style={styles.cardContainer}>
            <Text style={styles.sectionTitle}>
              {t('vehicleServices')}
            </Text>

            {/* Use mapped rows instead of nesting FlatList inside ScrollView */}
            <View style={styles.servicesGrid}>
              {services.map((item, index) => (
                <View
                  key={String(item.id ?? index)}
                  style={styles.serviceColumn}>
                  {renderService({item})}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F9',
  },

  scrollContent: {
    paddingBottom: 20,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 5,
    zIndex: 100,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  logo: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
    marginRight: 7,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: 'orangered',
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  languageContainer: {
    position: 'relative',
    zIndex: 1000,
    elevation: 10,
    marginRight: 10,
  },

  languageButton: {
    backgroundColor: '#FFF3ED',
    borderColor: 'orangered',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },

  languageButtonText: {
    color: 'orangered',
    fontSize: 12,
    fontWeight: '700',
  },

  languageDropdown: {
    position: 'absolute',
    top: 0,
    right: '100%',
    marginRight: 8,
    width: 125,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 15,
    zIndex: 10001,
    overflow: 'hidden',
  },

  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  selectedLanguageOption: {
    backgroundColor: '#FFF0E8',
  },

  languageOptionText: {
    fontSize: 14,
    color: '#222222',
    fontWeight: '500',
  },

  selectedLanguageText: {
    color: 'orangered',
    fontWeight: '700',
  },

  menuButton: {
    padding: 2,
  },

  noticeContainer: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: '#DC3545',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'red',
    elevation: 2,
  },

  noticeIcon: {
    marginRight: 8,
  },

  noticeText: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  bannerContainer: {
    marginHorizontal: 12,
    marginTop: 12,
    overflow: 'hidden',
    borderRadius: 5,
    elevation: 3,
  },

  banner: {
    width: '100%',
    height: 180,
  },

  cardContainer: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 16,
    paddingVertical: 15,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginLeft: 15,
    marginBottom: 15,
  },

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  serviceColumn: {
    width: '33.3333%',
  },

  serviceItem: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 22,
    paddingHorizontal: 5,
  },

  icon: {
    width: 65,
    height: 65,
    resizeMode: 'contain',
    marginBottom: 1,
  },

  serviceName: {
    textAlign: 'center',
    fontSize: 12,
    color: '#222222',
    fontWeight: '600',
    lineHeight: 16,
  },

  balanceText: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 10,
  },
  notificationButton: {
    paddingHorizontal: 6,
    paddingVertical: 5,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContainer: {
    marginHorizontal: 12,
    marginTop: 12,
    overflow: 'hidden',
    borderRadius: 10,
    elevation: 3,
    backgroundColor: '#FFFFFF',
  },

  banner: {
    width: '100%',
    height: 220,
  },

  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },

  bannerDot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 4,
  },

  activeBannerDot: {
    width: 19,
    backgroundColor: 'orangered',
  },
});
