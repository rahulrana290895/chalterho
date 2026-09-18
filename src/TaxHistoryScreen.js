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
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BASE_URL} from './config/config';

export default function TaxHistoryScreen() {
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

  const openDocument = fileName => {
    const url = `https://chalterho.com/assets/docs/${fileName}`;
    Linking.openURL(url);
  };

  const renderItem = ({item}) => {
    const total =
      parseFloat(item.amount || 0) +
      parseFloat(item.service_fees || 0);

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Vehicle No.</Text>
          <Text style={styles.value}>
            {item.vehicle_number}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>State</Text>
          <Text style={styles.value}>
            {item.state}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>
            {item.start_date?.substring(0, 10)} -{item.end_date?.substring(0, 10)}
          </Text>
        </View>


        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.amount}>
            ₹{total}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>

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
              Attachment
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