import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutUsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Who We Are</Text>

          <Text style={styles.text}>
            Founded in 2018 by Mr. Kulvinder, our organization was
            established with a vision to make transport-related services
            easy, fast and accessible for every vehicle owner.
          </Text>

          <Text style={styles.text}>
            We simplify road tax, permits, insurance, challans and
            vehicle documentation through a customer-friendly process.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Purpose</Text>

          <Text style={styles.quote}>
            "To provide fast and reliable transport-related services in one place."
          </Text>

          <Text style={styles.text}>
            We bridge the gap between vehicle owners and transport
            services through digital convenience and professional support.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>

          <Text style={styles.text}>
            To simplify road tax, insurance, challan, permit and vehicle
            services with trusted assistance and quick support.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Vision</Text>

          <Text style={styles.text}>
            To become India's most trusted transport service platform
            where every vehicle-related service is available from a
            single platform.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Goals</Text>

          <Text style={styles.point}>🚗 Easy Vehicle Services</Text>
          <Text style={styles.point}>⚡ Fast Processing</Text>
          <Text style={styles.point}>📞 24/7 Customer Support</Text>
          <Text style={styles.point}>🌐 One Platform Solution</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why Choose Us?</Text>

          <Text style={styles.point}>✔ Experienced Team Since 2018</Text>
          <Text style={styles.point}>✔ Reliable & Transparent Services</Text>
          <Text style={styles.point}>✔ Quick Documentation Support</Text>
          <Text style={styles.point}>✔ Secure Process</Text>
          <Text style={styles.point}>✔ Insurance & Permit Assistance</Text>
          <Text style={styles.point}>✔ One-Stop Transport Solution</Text>
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
  },

  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 10,
  },

  point: {
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
  },
});