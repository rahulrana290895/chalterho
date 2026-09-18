import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaProvider, SafeAreaView  } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: 'orangered',
        tabBarInactiveTintColor: '#777',
        tabBarIcon: ({ color, size }) => {
          let iconName;

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
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Transaction"
        component={TaxHistoryScreen}
      />

      <Tab.Screen
        name="24X7 Helpline"
        component={HelplineScreen}
      />
    </Tab.Navigator>
  );
}


export default function App() {

  return (
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator>
            {/* Login Screen */}
            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="RegisterScreen"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="ForgotPasswordScreen"
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />

            {/* Bottom Tabs */}
            <Stack.Screen
              name="MainTabs"
              component={BottomTabs}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="ServiceDetailScreen"
              component={ServiceDetailScreen}
                options={{
                  headerTitle: 'Service Detail',
                  headerStyle: { backgroundColor: 'orangered' },
                  headerTintColor: '#fff',
                }}
            />

            <Stack.Screen
              name="VehicleTexScreen"
              component={VehicleTexScreen}
                options={{
                  headerTitle: 'Vehicle Detail',
                  headerStyle: { backgroundColor: 'orangered' },
                  headerTintColor: '#fff',
                }}
            />

            <Stack.Screen
              name="PaymentScreen"
              component={PaymentScreen}
                options={{
                  headerTitle: 'Vehicle Detail',
                  headerStyle: { backgroundColor: 'orangered' },
                  headerTintColor: '#fff',
                }}
            />

            <Stack.Screen
              name="PaymentProcessingScreen"
              component={PaymentProcessingScreen}
             options={{ headerShown: false }}
            />

            <Stack.Screen
              name="PaymentCompletedScreen"
              component={PaymentCompletedScreen}
             options={{ headerShown: false }}
            />

            <Stack.Screen
              name="PaymentRejectedScreen"
              component={PaymentRejectedScreen}
             options={{ headerShown: false }}
            />

            <Stack.Screen
              name="TaxHistoryScreen"
              component={TaxHistoryScreen}
                options={{
                  headerTitle: 'Tax History',
                  headerStyle: { backgroundColor: 'orangered' },
                  headerTintColor: '#fff',
                }}
            />

            <Stack.Screen
              name="HelplineScreen"
              component={HelplineScreen}
                options={{
                  headerTitle: 'Helpline',
                  headerStyle: { backgroundColor: 'orangered' },
                  headerTintColor: '#fff',
                }}
            />

            <Stack.Screen
              name="MoreScreen"
              component={MoreScreen}
                options={{
                  headerTitle: 'More',
                  headerStyle: { backgroundColor: 'orangered' },
                  headerTintColor: '#fff',
                }}
            />

            <Stack.Screen
              name="AboutUs"
              component={AboutUsScreen}
                options={{
                  headerTitle: 'About Us',
                  headerStyle: { backgroundColor: 'orangered' },
                  headerTintColor: '#fff',
                }}
            />

            <Stack.Screen
              name="ReferEarnScreen"
              component={ReferEarnScreen}
                options={{
                  headerTitle: 'Refer & Earn',
                  headerStyle: { backgroundColor: 'orangered' },
                  headerTintColor: '#fff',
                }}
            />

          </Stack.Navigator>
        </NavigationContainer>
    </SafeAreaProvider>
  );
}
