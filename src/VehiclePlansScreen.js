
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {BASE_URL} from './config/config';

export default function VehiclePlansScreen({navigation, route}) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const vehicleNumber =
    route.params?.vehicle_number || route.params?.vehicleNumber || '';

  const state = route.params?.state || '';

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const baseUrl = BASE_URL.endsWith('/')
        ? BASE_URL
        : `${BASE_URL}/`;

      const response = await fetch(
        `${baseUrl}get_vehicle_plans.php?vehicle_number=${encodeURIComponent(
          vehicleNumber,
        )}&state=${encodeURIComponent(state)}`,
      );

      const result = await response.json();

      if (result.success) {
        setPlans(result.data || []);
      } else {
        Alert.alert('Error', result.message || 'Plans load nahi hue.');
      }
    } catch (error) {
      console.log('Vehicle plans error:', error);
      Alert.alert('Error', 'Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>


        {/* Vehicle Details */}
        <View style={styles.vehicleBox}>
          <View style={styles.vehicleIcon}>
            <Text style={styles.carIcon}>🚘</Text>
          </View>

          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleLabel}>YOUR VEHICLE</Text>

            <Text style={styles.vehicleNumber}>
              {vehicleNumber || 'N/A'}
            </Text>

            <View style={styles.stateBadge}>
              <Text style={styles.stateBadgeText}>
                State: {state || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* Plans Heading */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionTitle}>Available Plans</Text>
            <Text style={styles.sectionSubtitle}>
              Choose the duration that suits you
            </Text>
          </View>

          {!loading && plans.length > 0 && (
            <View style={styles.planCountBadge}>
              <Text style={styles.planCountText}>
                {plans.length} Plans
              </Text>
            </View>
          )}
        </View>

        {/* Loading */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="orangered" />
            <Text style={styles.loadingText}>Loading vehicle plans...</Text>
          </View>
        ) : plans.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🚘</Text>
            <Text style={styles.emptyTitle}>No Plans Available</Text>
            <Text style={styles.emptyText}>
              No plans found for this vehicle and state.
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                loadPlans();
              }}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Plan List */
          plans.map(item => {
            const amount = Number(item.amount || 0);
            const serviceFees = Number(item.service_fees || 0);
            const total = amount + serviceFees;

            return (
              <View key={String(item.id)} style={styles.planCard}>
                <View style={styles.planHeader}>
                  <View style={styles.durationIcon}>
                    <Text style={styles.durationIconText}>◷</Text>
                  </View>

                  <View style={styles.durationInfo}>
                    <Text style={styles.planTitle}>
                      {item.duration} Plan
                    </Text>
                    <Text style={styles.planSubtitle}>
                      Vehicle tax payment
                    </Text>
                  </View>

                  <View style={styles.planTag}>
                    <Text style={styles.planTagText}>PLAN</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Tax Amount</Text>
                  <Text style={styles.priceValue}>
                    ₹{amount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Service Fees</Text>
                  <Text style={styles.priceValue}>
                    ₹{serviceFees.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.totalBox}>
                  <View>
                    <Text style={styles.totalLabel}>Total Payable</Text>
                    <Text style={styles.totalCaption}>
                      Including service fees
                    </Text>
                  </View>

                  <Text style={styles.totalValue}>
                    ₹{total.toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.payNowButton}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('PlanPaymentScreen', {
                      planId: item.id,
                      vehicleNumber: vehicleNumber,
                      chassisNumber: item.chassis_number || route.params?.chassis_number || '',
                      state: state,
                      duration: item.duration,
                      amount: amount,
                      serviceFees: serviceFees,
                      payable: total,
                    })
                  }>
                  <Text style={styles.payNowButtonText}>
                    Pay Now ₹{total.toFixed(2)}
                  </Text>
                </TouchableOpacity>

              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },

  container: {
    padding: 16,
    paddingBottom: 30,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#001433',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backText: {
    fontSize: 32,
    lineHeight: 36,
    color: '#ffffff',
  },

  headerContent: {
    flex: 1,
  },

  heading: {
    fontSize: 23,
    fontWeight: '900',
    color: '#001433',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#777777',
    marginTop: 4,
  },

  // Vehicle Details
  vehicleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e6eaf0',
    marginBottom: 26,
    elevation: 3,
    shadowColor: '#001433',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
  },

  vehicleIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#fff0e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },

  carIcon: {
    fontSize: 27,
  },

  vehicleInfo: {
    flex: 1,
  },

  vehicleLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#778196',
    marginBottom: 5,
  },

  vehicleNumber: {
    fontSize: 19,
    fontWeight: '900',
    color: '#001433',
  },

  stateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#edf1f7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 8,
  },

  stateBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#001433',
  },

  // Section Heading
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  sectionInfo: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#001433',
  },

  sectionSubtitle: {
    fontSize: 12,
    color: '#7b8494',
    marginTop: 5,
  },

  planCountBadge: {
    backgroundColor: '#001433',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginLeft: 8,
  },

  planCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Loading
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 35,
  },

  loadingText: {
    fontSize: 13,
    color: '#777777',
    marginTop: 12,
  },

  // Plan Card
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 17,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e7eaf0',
    elevation: 3,
    shadowColor: '#001433',
    shadowOpacity: 0.06,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 3},
  },

  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  durationIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fff0e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  durationIconText: {
    fontSize: 28,
    color: 'orangered',
    fontWeight: '700',
  },

  durationInfo: {
    flex: 1,
  },

  planTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#001433',
  },

  planSubtitle: {
    fontSize: 12,
    color: '#858d9b',
    marginTop: 4,
  },

  planTag: {
    backgroundColor: '#fff0e8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },

  planTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'orangered',
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: '#edf0f4',
    marginVertical: 17,
  },

  // Prices
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  priceLabel: {
    fontSize: 14,
    color: '#687386',
  },

  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#001433',
  },

  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff3ec',
    borderWidth: 1,
    borderColor: '#ffe1d2',
    borderRadius: 12,
    padding: 14,
    marginTop: 3,
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#001433',
  },

  totalCaption: {
    fontSize: 10,
    color: '#858d9b',
    marginTop: 4,
  },

  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: 'orangered',
  },

  // Empty State
  emptyBox: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 14,
    marginTop: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e7eaf0',
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#001433',
  },

  emptyText: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  retryButton: {
    backgroundColor: '#001433',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 16,
  },

  retryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  payNowButton: {
    backgroundColor: '#001433',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  payNowButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
