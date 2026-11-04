import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  PermissionsAndroid
} from 'react-native';
import notifee, {AndroidImportance, } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {BASE_URL} from './config/config';
import {useTranslation} from 'react-i18next';

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

      setHistory(data);
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
      bmp: 'image/bmp',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      txt: 'text/plain',
      zip: 'application/zip',
      rar: 'application/vnd.rar',
    };

    const mimeType =
      mimeTypes[extension] || 'application/octet-stream';

    const isImage = [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp',
    ].includes(extension);

    const url = /^https?:\/\//i.test(fileName)
      ? fileName
      : `https://chalterho.com/assets/docs/${encodeURIComponent(cleanFileName)}`;

    const channelId = await notifee.createChannel({
      id: 'downloads',
      name: 'Downloads',
      importance: AndroidImportance.HIGH,
    });

    await notifee.requestPermission();

    if (isImage) {
      // Image download
      const tempPath =
        `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${cleanFileName}`;

      const response = await ReactNativeBlobUtil
        .config({ path: tempPath })
        .fetch('GET', url);

      if (response.info().status !== 200) {
        throw new Error('File download failed');
      }

      // Save image in Gallery
      await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
        {
          name: cleanFileName,
          parentFolder: 'ChalteRho',
          mimeType: mimeType,
        },
        'Image',
        tempPath,
      );

      await ReactNativeBlobUtil.fs.unlink(tempPath).catch(() => {});

      // Notification
      await notifee.displayNotification({
        title: 'Download Complete',
        body: `${cleanFileName} saved in Gallery`,
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      });

      Alert.alert('Success', 'File saved in Gallery!');




} else {
  // PDF / DOC / XLS download to public Downloads

  const tempPath =
    `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${cleanFileName}`;

  const response = await ReactNativeBlobUtil
    .config({
      fileCache: true,
      path: tempPath,
    })
    .fetch('GET', url, {
      Accept: '*/*',
    });

  const statusCode = response.info().status;

  console.log('Download Status:', statusCode);
  console.log('Download Headers:', response.info().headers);

  if (statusCode !== 200) {
    throw new Error(`Server Error: ${statusCode}`);
  }

  const fileStats = await ReactNativeBlobUtil.fs.stat(
    response.path(),
  );

  if (!fileStats.size || Number(fileStats.size) === 0) {
    throw new Error('Downloaded file is empty');
  }

  // Save document in Android Downloads using MediaStore
  const savedUri =
    await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
      {
        name: cleanFileName,
        parentFolder: 'ChalteRho',
        mimeType: mimeType,
      },
      'Download',
      response.path(),
    );

  if (!savedUri) {
    throw new Error('Unable to save document in Downloads');
  }

  // Remove temporary file
  await ReactNativeBlobUtil.fs
    .unlink(response.path())
    .catch(() => {});

  // Notification
  await notifee.displayNotification({
    title: 'Download Complete',
    body: `${cleanFileName} saved in Downloads`,
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      pressAction: {
        id: 'default',
      },
    },
  });

  Alert.alert(
    'Download Complete',
    `${cleanFileName} successfully saved in Downloads/ChalteRho`,
  );
}




  } catch (error) {
    console.log('Download Error:', error);
    Alert.alert('Download Failed', error.message || 'Unable to download file.');
  }
};



  const renderItem = ({item}) => {
    const total =
      parseFloat(item.amount || 0) +
      parseFloat(item.service_fees || 0);

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>{t('vehicleNo')}</Text>
          <Text style={styles.value}>
            {item.vehicle_number}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>{t('state')}</Text>
          <Text style={styles.value}>
            {item.state}
          </Text>
        </View>

        <View style={styles.row}>
         <Text style={styles.label}>{t('duration')}</Text>
          <Text style={styles.value}>
            {item.start_date?.substring(0, 10)} -{item.end_date?.substring(0, 10)}
          </Text>
        </View>


        <View style={styles.row}>
         <Text style={styles.label}>{t('amount')}</Text>
          <Text style={styles.amount}>
            ₹{total}
          </Text>
        </View>

        <View style={styles.row}>
         <Text style={styles.label}>{t('status')}</Text>

            <Text
              style={[
                styles.status,
                {
                  color:
                    item.status === 'Completed'
                      ? 'green'
                      : item.status === 'Pending'
                      ? 'orange'
                      : item.status === 'Reject'
                      ? 'red'
                      : '#666',
                },
              ]}>
              {item.status}
            </Text>
        </View>

        {item.docs ? (
          <View style={styles.row}>
            <Text style={styles.label}>
              {t('attachment')}
            </Text>

            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={() =>
                openDocument(item.docs)
              }>
              <Text style={styles.downloadText}>
                Download
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="orangered"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}>
        {history.length > 0 ? (
          <FlatList
            data={history}
            keyExtractor={(item, index) =>
              index.toString()
            }
            renderItem={renderItem}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No Transaction Found
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 12,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  label: {
    fontWeight: '700',
    color: '#333',
    width: '40%',
  },

  value: {
    color: '#666',
    width: '60%',
    textAlign: 'right',
  },

  amount: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 15,
  },

  status: {
    fontWeight: 'bold',
    fontSize: 14,
  },

  downloadBtn: {
    backgroundColor: 'green',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },

  downloadText: {
    color: '#fff',
    fontWeight: '600',
  },

  emptyBox: {
    marginTop: 100,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});