
import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {initializeLanguage} from './src/i18n';

import LoginScreen from './src/LoginScreen';
import HomeScreen from './src/HomeScreen';
import ServiceDetailScreen from './src/ServiceDetailScreen';
import VehicleTexScreen from './src/VehicleTexScreen';
import PaymentScreen from './src/PaymentScreen';
import PaymentProcessingScreen from './src/PaymentProcessingScreen';
import TaxHistoryScreen from './src/TaxHistoryScreen';
import HelplineScreen from './src/HelplineScreen';
import MoreScreen from './src/MoreScreen';
import AboutUsScreen from './src/AboutUsScreen';
import RegisterScreen from './src/RegisterScreen';
import ForgotPasswordScreen from './src/ForgotPasswordScreen';
import PaymentCompletedScreen from './src/PaymentCompletedScreen';
import PaymentRejectedScreen from './src/PaymentRejectedScreen';
import ReferEarnScreen from './src/ReferEarnScreen';
import OTPVerificationScreen from './src/OTPVerificationScreen';
import DrivingLicenceScreen from './src/DrivingLicenceScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
function MoreHeaderTitle() {
  const {t} = useTranslation();

  return (
    <Text style={{color: '#fff', fontSize: 18, fontWeight: '600'}}>
      {t('more')}
    </Text>
  );
}
function TranslatedHeader({titleKey}) {
  const {t} = useTranslation();

  return (
    <Text style={{color: '#fff', fontSize: 18, fontWeight: '600'}}>
      {t(titleKey)}
    </Text>
  );
}
function BottomTabs() {
  const {t} = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: 'orangered',
        tabBarInactiveTintColor: '#777',

        tabBarLabel:
          route.name === 'Home'
            ? t('home')
            : route.name === 'Transaction'
            ? t('transaction')
            : t('helpline'),

        tabBarIcon: ({color, size}) => {
          let iconName = 'home';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Transaction') {
            iconName = 'receipt';
          } else if (route.name === '24X7 Helpline') {
            iconName = 'call';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transaction" component={TaxHistoryScreen} />
      <Tab.Screen name="24X7 Helpline" component={HelplineScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    initializeLanguage()
      .then(() => {
        if (mounted) {
          setLanguageReady(true);
        }
      })
      .catch(error => {
        console.log('Language initialization error:', error);

        if (mounted) {
          setLanguageReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!languageReady) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
          }}>
          <ActivityIndicator
            size="large"
            color="orangered"
          />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {/* Login Screen */}
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="RegisterScreen"
            component={RegisterScreen}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="OTPVerificationScreen"
            component={OTPVerificationScreen}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="ForgotPasswordScreen"
            component={ForgotPasswordScreen}
            options={{headerShown: false}}
          />

          {/* Bottom Tabs */}
          <Stack.Screen
            name="MainTabs"
            component={BottomTabs}
            options={{headerShown: false}}
          />

        <Stack.Screen
          name="ServiceDetailScreen"
          component={ServiceDetailScreen}
          options={{
            headerTitle: () => <TranslatedHeader titleKey="serviceDetail" />,
            headerStyle: {backgroundColor: '#001433'},
            headerTintColor: '#fff',
          }}
        />

         <Stack.Screen
           name="VehicleTexScreen"
           component={VehicleTexScreen}
           options={{
             headerTitle: () => (
               <TranslatedHeader titleKey="vehicleDetail" />
             ),
             headerStyle: {backgroundColor: '#001433'},
             headerTintColor: '#fff',
           }}
         />

          <Stack.Screen
            name="PaymentScreen"
            component={PaymentScreen}
            options={{
              headerTitle: 'Vehicle Detail',
              headerStyle: {backgroundColor: 'orangered'},
              headerTintColor: '#fff',
            }}
          />

          <Stack.Screen
            name="PaymentProcessingScreen"
            component={PaymentProcessingScreen}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="PaymentCompletedScreen"
            component={PaymentCompletedScreen}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="PaymentRejectedScreen"
            component={PaymentRejectedScreen}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="TaxHistoryScreen"
            component={TaxHistoryScreen}
            options={{
              headerTitle: 'Tax History',
              headerStyle: {backgroundColor: '#001433'},
              headerTintColor: '#fff',
            }}
          />

          <Stack.Screen
            name="HelplineScreen"
            component={HelplineScreen}
            options={{
              headerTitle: 'Helpline',
              headerStyle: {backgroundColor: '#001433'},
              headerTintColor: '#fff',
            }}
          />

         <Stack.Screen
           name="MoreScreen"
           component={MoreScreen}
           options={{
             headerTitle: () => <MoreHeaderTitle />,
             headerStyle: {backgroundColor: '#001433'},
             headerTintColor: '#fff',
           }}
         />

          <Stack.Screen
            name="AboutUs"
            component={AboutUsScreen}
            options={{
              headerTitle: 'About Us',
              headerStyle: {backgroundColor: '#001433'},
              headerTintColor: '#fff',
            }}
          />

          <Stack.Screen
            name="ReferEarnScreen"
            component={ReferEarnScreen}
            options={{
              headerTitle: 'Share',
              headerStyle: {backgroundColor: '#001433'},
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="DrivingLicenceScreen"
            component={DrivingLicenceScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
