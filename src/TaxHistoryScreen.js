import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';

import notifee, {AndroidImportance} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Ionicons from '@react-native-vector-icons/ionicons';
import {BASE_URL} from './config/config';
import {useTranslation} from 'react-i18next';

const BLUE = '#17365D';
const ORANGE = 'orangered';

export default function TaxHistoryScreen() {
  const {t} = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory();
  }, []);

  const getHistory = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(
        `${BASE_URL}payments.php?id=${userId}`,
      );
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDocument = async fileName => {
    try {
      if (!fileName) {
        Alert.alert('Error', 'Document not found');
        return;
      }

      const cleanFileName = decodeURIComponent(
        fileName.split('/').pop().split('?')[0],
      );

      const extension = cleanFileName.split('.').pop().toLowerCase();

      const mimeTypes = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv',
        txt: 'text/plain',
      };

      const mimeType =
        mimeTypes[extension] || 'application/octet-stream';

      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
        extension,
      );

      const url = /^https?:\/\//i.test(fileName)
        ? fileName
        : `https://chalterho.com/assets/docs/${encodeURIComponent(cleanFileName)}`;

      const channelId = await notifee.createChannel({
        id: 'downloads',
        name: 'Downloads',
        importance: AndroidImportance.HIGH,
      });

      await notifee.requestPermission();

      const tempPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${cleanFileName}`;

      const response = await ReactNativeBlobUtil.config({
        fileCache: true,
        path: tempPath,
      }).fetch('GET', url);

      if (response.info().status !== 200) {
        throw new Error('File download failed');
      }

      const stats = await ReactNativeBlobUtil.fs.stat(response.path());

      if (!stats.size || Number(stats.size) === 0) {
        throw new Error('Downloaded file is empty');
      }

      const savedUri =
        await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
          {
            name: cleanFileName,
            parentFolder: 'ChalteRho',
            mimeType,
          },
          isImage ? 'Image' : 'Download',
          response.path(),
        );

      await ReactNativeBlobUtil.fs.unlink(response.path()).catch(() => {});

      if (!savedUri) {
        throw new Error('Unable to save file');
      }

      await notifee.displayNotification({
        title: 'Download Complete',
        body: `${cleanFileName} saved successfully`,
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: {id: 'default'},
        },
      });

      Alert.alert(
        'Success',
        `${cleanFileName} saved in ${isImage ? 'Gallery' : 'Downloads/ChalteRho'}`,
      );
    } catch (error) {
      console.log('Download Error:', error);
      Alert.alert('Download Failed', error.message);
    }
  };

  const renderItem = ({item}) => {
    const total =
      parseFloat(item.amount || 0) +
      parseFloat(item.service_fees || 0);

    const status = item.status || 'Unknown';

    const statusColor =
      status === 'Completed'
        ? '#16A34A'
        : status === 'Pending'
        ? '#D97706'
        : status === 'Reject'
        ? '#DC2626'
        : '#64748B';

    const statusBg =
      status === 'Completed'
        ? '#DCFCE7'
        : status === 'Pending'
        ? '#FEF3C7'
        : status === 'Reject'
        ? '#FEE2E2'
        : '#F1F5F9';

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.vehicleIcon}>
            <Ionicons name="car-sport" size={25} color="#fff" />
          </View>

          <View style={styles.vehicleInfo}>
            <Text style={styles.smallLabel}>VEHICLE NUMBER</Text>
            <Text style={styles.vehicleNumber}>
              {item.vehicle_number || 'N/A'}
            </Text>
          </View>

          <View style={[styles.statusBadge, {backgroundColor: statusBg}]}>
            <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
            <Text style={[styles.statusText, {color: statusColor}]}>
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Vehicle Details */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={17} color={ORANGE} />
            <Text style={styles.detailLabel}>{t('state')}</Text>
          </View>
          <Text style={styles.detailValue}>{item.state || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={17} color={ORANGE} />
            <Text style={styles.detailLabel}>{t('duration')}</Text>
          </View>
          <Text style={styles.detailValue}>
            {item.start_date?.substring(0, 10) || 'N/A'} -{' '}
            {item.end_date?.substring(0, 10) || 'N/A'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Amount Section */}
        <View style={styles.amountRow}>
          <View>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amount}>
              ₹{total.toFixed(2)}
            </Text>
          </View>

          <View style={styles.paymentIcon}>
            <Ionicons name="wallet-outline" size={23} color={BLUE} />
          </View>
        </View>

        {/* Download Button */}
        {item.docs ? (
          <TouchableOpacity
            style={styles.downloadBtn}
            activeOpacity={0.8}
            onPress={() => openDocument(item.docs)}>
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.downloadText}>Download Document</Text>
            <Ionicons name="arrow-forward" size={17} color="#fff" />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={styles.loadingText}>Loading Transactions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tax History</Text>
          <Text style={styles.headerSubtitle}>
            Your vehicle tax transactions
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons name="receipt-outline" size={24} color="#fff" />
        </View>
      </View>

      {/* Transaction Count */}
      <View style={styles.countRow}>
        <Text style={styles.countLabel}>TRANSACTION HISTORY</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{history.length} Records</Text>
        </View>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item, index) =>
          String(item.id || index)
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={40} color={BLUE} />
            </View>
            <Text style={styles.emptyTitle}>No Transactions Yet</Text>
            <Text style={styles.emptyText}>
              Your vehicle tax payment history will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F8',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    color: BLUE,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    backgroundColor: BLUE,
    paddingHorizontal: 20,
    paddingVertical: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 23,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#D5DFEB',
    fontSize: 12,
    marginTop: 5,
  },
  headerIcon: {
    width: 48,
    height: 48,
    backgroundColor: ORANGE,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countRow: {
    paddingHorizontal: 17,
    marginTop: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countLabel: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  countBadge: {
    backgroundColor: '#FFE8DE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 14,
    paddingBottom: 25,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: BLUE,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.08,
    shadowRadius: 7,
    borderWidth: 1,
    borderColor: '#E9EDF2',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 11,
  },
  smallLabel: {
    fontSize: 9,
    color: '#8993A1',
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  vehicleNumber: {
    fontSize: 16,
    color: BLUE,
    fontWeight: '800',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 5,
    marginRight: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF0F4',
    marginVertical: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#7A8491',
    fontSize: 13,
    marginLeft: 7,
    fontWeight: '600',
  },
  detailValue: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '700',
    maxWidth: '58%',
    textAlign: 'right',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: 12,
    color: '#8993A1',
    fontWeight: '600',
  },
  amount: {
    color: '#159447',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  paymentIcon: {
    width: 42,
    height: 42,
    backgroundColor: '#EEF3F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadBtn: {
    backgroundColor: ORANGE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  downloadText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    marginHorizontal: 9,
    flex: 1,
    textAlign: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 90,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    width: 85,
    height: 85,
    backgroundColor: '#E8EEF5',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: BLUE,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 18,
  },
  emptyText: {
    color: '#8993A1',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
});