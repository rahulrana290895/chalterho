import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {Picker} from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
import Ionicons from '@react-native-vector-icons/ionicons';

import {BASE_URL} from './config/config';


/* =========================================================
   INPUT BOX
   IMPORTANT:
   Keep this OUTSIDE VehicleTexScreen
========================================================= */

const InputBox = React.memo(
  ({icon,placeholder,value,onChangeText,keyboardType,maxLength,autoCapitalize = 'none',autoCorrect = false,inputMode,}) => {
    return (
      <View style={styles.inputWrapper}>
        <View style={styles.inputIcon}>
          <Ionicons name={icon} size={21} color="#EF5B25" />
        </View>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          inputMode={inputMode}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          blurOnSubmit={false}
          style={styles.input}
        />
      </View>
    );
  },
);

/* =========================================================
   SELECT BOX
   IMPORTANT:
   Placeholder is NOT a Picker.Item.
   Therefore it will NOT appear in dropdown.
========================================================= */

const SelectBox = ({icon, value, onValueChange, placeholder, children,}) => {
  return (
    <View style={styles.selectWrapper}>
      {/* ICON */}
      <View style={styles.selectIcon}>
        <Ionicons name={icon} size={21} color="#EF5B25" />
      </View>
      {/* PICKER */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor="#EF5B25"
          mode="dropdown"
        >
          {children}
        </Picker>
        {/* PLACEHOLDER ONLY This is NOT part of dropdown */}
        {!value && (
          <View
            pointerEvents="none"
            style={styles.placeholderOverlay}
          >
            <Text style={styles.placeholderText}>
              {placeholder}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};


/* =========================================================
   MAIN SCREEN
========================================================= */

export default function VehicleTexScreen({navigation}) {
  /* =======================================================
     STATES
  ======================================================= */
const [phone, setPhone] = useState('');
const [vehicleNumber, setVehicleNumber] = useState('');
const [chassisNumber, setChassisNumber] = useState('');
const [states, setStates] = useState([]);
const [state, setState] = useState('');
const [categories, setCategories] = useState([]);
const [category, setCategory] = useState('');
const [subCategories, setSubCategories] = useState([]);
const [subCategory, setSubCategory] = useState('');
const [noOfSeats, setNoOfSeats] = useState('');
const [acType, setAcType] = useState('');
const [durationOptions, setDurationOptions] = useState([]);
const [duration, setDuration] = useState('');
const [startDate, setStartDate] = useState(new Date());
const [endDate, setEndDate] = useState(new Date());
const [openStart, setOpenStart] = useState(false);
const [openEnd, setOpenEnd] = useState(false);
  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadStates();
    loadCategories();
  }, []);

useEffect(() => {
  if (
    state &&
    category &&
    subCategory &&
    vehicleNumber.length >= 4
  ) {
    loadDuration();
  } else {
    setDurationOptions([]);
    setDuration('');
  }
}, [
  state,
  category,
  subCategory,
  vehicleNumber,
]);
  /* =======================================================
     LOAD STATES
  ======================================================= */

  const loadStates = async () => {
    try {
      const response = await fetch(`${BASE_URL}states.php`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setStates(data);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.log('States Error:',error,);
    }
  };


  /* =======================================================
     LOAD CATEGORIES
  ======================================================= */

  const loadCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}categories.php`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.log('Categories Error:', error, );
    }
  };


  /* =======================================================
     LOAD SUB CATEGORY
  ======================================================= */

const loadSubCategory = async categoryId => {
  if (!categoryId) {
    setSubCategories([]);
    return;
  }

  try {
    const formData = new FormData();
    formData.append('category_id', categoryId);

    const response = await fetch(
      `${BASE_URL}sub_category_ajax.php`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = await response.json();

    if (Array.isArray(data)) {
      setSubCategories(data);
    } else {
      setSubCategories([]);
    }
  } catch (error) {
    console.log('Sub Category Error:', error);
    setSubCategories([]);
  }
};

/* =======================================================
   LOAD DURATION FROM API
======================================================= */

const loadDuration = async () => {
  if (!state || !category || !subCategory || !vehicleNumber) {
    setDurationOptions([]);
    setDuration('');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('state', state);
    formData.append('category', String(category));
    formData.append('sub_category', String(subCategory));
    formData.append('vehicleNumber',vehicleNumber.toUpperCase(),);
    const response = await fetch(
      `${BASE_URL}get_duration.php`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const data = await response.json();
    console.log('DURATION API:', data);
    if (
      data.status === true &&
      Array.isArray(data.durations) &&
      data.durations.length > 0
    ) {
      setDurationOptions(data.durations);
      setDuration('');
      return;
    }
    setDurationOptions([]);
    setDuration('');
    Alert.alert(
      'Duration Not Available',
      'Duration not available for selected vehicle',
    );
  } catch (error) {
    console.log('Duration API Error:', error);
    setDurationOptions([]);
    setDuration('');
    Alert.alert(
      'Error',
      'Unable to load duration',
    );
  }
};
  /* =======================================================
     CONDITIONS
  ======================================================= */

  const showChassis = state && vehicleNumber.substring(0, 2).toUpperCase() === state.toUpperCase();
  const normalizedState = state?.toUpperCase();
  const showSeatAc = (normalizedState === 'UP' || normalizedState === 'UK') && ['5', '6', '7', '8'].includes(String(subCategory));

  /* =======================================================
     DATE HELPERS
  ======================================================= */

const setEndOfDay = date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

const calculateEndDate = (selectedDuration, selectedStart) => {
  let date = new Date(selectedStart);

  switch (selectedDuration) {
    case 'Day':
      date = new Date(
        date.getTime() + 24 * 60 * 60 * 1000,
      );
      break;

    case '3Day':
      date = new Date(
        date.getTime() + 3 * 24 * 60 * 60 * 1000,
      );
      break;

    case '5Day':
      date = new Date(
        date.getTime() + 5 * 24 * 60 * 60 * 1000,
      );
      break;

    case 'Weekly':
      date.setDate(date.getDate() + 7);
      date = setEndOfDay(date);
      break;

    case 'Month':
      date = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        date.getHours(),
        date.getMinutes(),
      );
      date = setEndOfDay(date);
      break;

    case 'Quarter':
      date = new Date(
        date.getFullYear(),
        date.getMonth() + 3,
        0,
        date.getHours(),
        date.getMinutes(),
      );
      date = setEndOfDay(date);
      break;

    case 'Half Year':
      date = new Date(
        date.getFullYear(),
        date.getMonth() + 6,
        0,
        date.getHours(),
        date.getMinutes(),
      );
      date = setEndOfDay(date);
      break;

    case 'Year':
      date = new Date(
        date.getFullYear() + 1,
        date.getMonth(),
        0,
        date.getHours(),
        date.getMinutes(),
      );
      date = setEndOfDay(date);
      break;

    default:
      break;
  }

  setEndDate(date);
};
const formatDate = date => {
    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );
  };
const formatTime = date => {
    return date.toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  };

  /* =======================================================
     PAYMENT
  ======================================================= */
const goToPayment = () => {
  if (
    !phone ||
    !vehicleNumber ||
    !state ||
    !category ||
    !subCategory ||
    !duration
  ) {
    Alert.alert(
      'Required Fields',
      'Please fill all required fields',
    );

    return;
  }

  if (phone.length !== 10) {
    Alert.alert(
      'Invalid Mobile Number',
      'Please enter a valid 10 digit mobile number',
    );

    return;
  }

  if (showSeatAc && (!noOfSeats || !acType)) {
    Alert.alert(
      'Required Fields',
      'Please enter seats and AC type',
    );

    return;
  }

  navigation.navigate('PaymentScreen', {
    phone_number: phone,
    vehicle_number: vehicleNumber,
    state: state,
    chassis_number: chassisNumber,
    category: category,
    sub_category: subCategory,
    duration: duration,
    no_of_seats: noOfSeats,
    ac_type: acType,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  });
};
  /* =======================================================
     UI
  ======================================================= */
  return (
    <SafeAreaView
      style={styles.safeArea}
    >

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          contentContainerStyle={
            styles.scrollContent
          }
        >


          {/* =================================================
             NOTICE
          ================================================= */}

          <View style={styles.noticeBox}>

            <View style={styles.noticeIcon}>

              <Ionicons
                name="alert-circle-outline"
                size={26}
                color="#D97706"
              />

            </View>


            <View
              style={
                styles.noticeContent
              }
            >

              <Text
                style={
                  styles.noticeTitle
                }
              >
                Important Notice
              </Text>


              <Text
                style={
                  styles.noticeText
                }
              >

                किसी भी State Border को Enter करने से कम से कम{' '}

                <Text
                  style={
                    styles.bold
                  }
                >
                  30 मिनट पहले
                </Text>{' '}

                Tax Request भेजें।

              </Text>

            </View>

          </View>


          {/* =================================================
             VEHICLE DETAILS
          ================================================= */}

          <View style={styles.card}>


            <View
              style={
                styles.sectionHeader
              }
            >

              <View
                style={
                  styles.sectionIcon
                }
              >

                <Ionicons
                  name="car-outline"
                  size={22}
                  color="#EF5B25"
                />

              </View>


              <View>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Vehicle Details
                </Text>


                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Enter your vehicle information
                </Text>

              </View>

            </View>


            {/* MOBILE */}

            <Text style={styles.label}>

              Mobile Number{' '}

              <Text
                style={
                  styles.required
                }
              >
                *
              </Text>

            </Text>


            <InputBox
              icon="phone-portrait-outline"
              placeholder="Enter 10 digit mobile number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="number-pad"
              inputMode="tel"
              maxLength={10}
              autoCapitalize="none"
              autoCorrect={false}
            />


            {/* VEHICLE NUMBER */}

            <Text style={styles.label}>

              Vehicle Number{' '}

              <Text
                style={
                  styles.required
                }
              >
                *
              </Text>

            </Text>


            <InputBox
              icon="car-sport-outline"
              placeholder="Example: PB01AB1234"
              value={vehicleNumber}
              onChangeText={text =>
                setVehicleNumber(
                  text.toUpperCase(),
                )
              }
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={10}
            />


            {/* REGISTRATION STATE */}

            <Text style={styles.label}>

              Registration State{' '}

              <Text
                style={
                  styles.required
                }
              >
                *
              </Text>

            </Text>


            <SelectBox
              icon="map-outline"
              value={state}
              onValueChange={setState}
              placeholder="Select State"
            >

              {/* NO SELECT STATE ITEM HERE */}

              {states.map(item => (

                <Picker.Item
                  key={
                    String(item.id)
                  }
                  label={item.name}
                  value={item.code}
                />

              ))}

            </SelectBox>


            {/* CHASSIS */}

            {showChassis && (

              <>

                <Text
                  style={
                    styles.label
                  }
                >
                  Chassis Number
                </Text>


                <InputBox
                  icon="barcode-outline"
                  placeholder="Enter 5 digit chassis number"
                  value={chassisNumber}
                  onChangeText={text => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setChassisNumber(numericValue);
                  }}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={5}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

              </>

            )}

          </View>


          {/* =================================================
             VEHICLE TYPE
          ================================================= */}

          <View style={styles.card}>


            <View
              style={
                styles.sectionHeader
              }
            >

              <View
                style={
                  styles.sectionIcon
                }
              >

                <Ionicons
                  name="bus-outline"
                  size={22}
                  color="#EF5B25"
                />

              </View>


              <View>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Vehicle Type
                </Text>


                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Select category and vehicle type
                </Text>

              </View>

            </View>


            {/* CATEGORY */}

            <Text style={styles.label}>

              Vehicle Category{' '}

              <Text
                style={
                  styles.required
                }
              >
                *
              </Text>

            </Text>


            <SelectBox
              icon="car"
              value={category}
              onValueChange={value => {

                setCategory(value);

                setSubCategory('');

                loadSubCategory(
                  value,
                );

              }}
              placeholder="Select Vehicle Category"
            >

              {/* NO SELECT VEHICLE CATEGORY ITEM */}

              {categories.map(item => (

                <Picker.Item
                  key={
                    String(item.id)
                  }
                  label={item.name}
                  value={item.id}
                />

              ))}

            </SelectBox>


            {/* VEHICLE TYPE */}

            <Text style={styles.label}>

              Vehicle Type{' '}

              <Text
                style={
                  styles.required
                }
              >
                *
              </Text>

            </Text>


            <SelectBox
              icon="car"
              value={subCategory}
              onValueChange={
                setSubCategory
              }
              placeholder="Select Vehicle Type"
            >

              {/* NO SELECT VEHICLE TYPE ITEM */}

              {subCategories.map(
                item => (

                  <Picker.Item
                    key={
                      String(item.id)
                    }
                    label={item.name}
                    value={item.id}
                  />

                ),
              )}

            </SelectBox>


            {/* UP / UK DETAILS */}

            {showSeatAc && (

              <View
                style={
                  styles.extraVehicleBox
                }
              >

                <View
                  style={
                    styles.extraTitleRow
                  }
                >

                  <Ionicons
                    name="bus-outline"
                    size={21}
                    color="#EF5B25"
                  />


                  <Text
                    style={
                      styles.extraTitle
                    }
                  >
                    Additional Details
                  </Text>

                </View>


                {/* SEATS */}

                <Text
                  style={
                    styles.label
                  }
                >
                  Number of Seats
                </Text>


                <InputBox
                  icon="people-outline"
                  placeholder="Enter number of seats"
                  value={noOfSeats}
                  onChangeText={
                    setNoOfSeats
                  }
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={3}
                />


                {/* AC */}

                <Text
                  style={
                    styles.label
                  }
                >
                  AC Type
                </Text>


                <SelectBox
                  icon="snow"
                  value={acType}
                  onValueChange={
                    setAcType
                  }
                  placeholder="Select AC Type"
                >

                  {/* NO SELECT AC TYPE ITEM */}

                  <Picker.Item
                    label="AC"
                    value="AC"
                  />

                  <Picker.Item
                    label="Non AC"
                    value="Non AC"
                  />

                </SelectBox>

              </View>

            )}

          </View>


          {/* =================================================
             TAX PERIOD
          ================================================= */}

          <View style={styles.card}>


            <View
              style={
                styles.sectionHeader
              }
            >

              <View
                style={
                  styles.sectionIcon
                }
              >

                <Ionicons
                  name="calculator"
                  size={22}
                  color="#EF5B25"
                />

              </View>


              <View>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Tax Period
                </Text>


                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Choose your tax validity period
                </Text>

              </View>

            </View>


            {/* DURATION */}

            <Text style={styles.label}>

              Duration{' '}

              <Text
                style={
                  styles.required
                }
              >
                *
              </Text>

            </Text>


            <SelectBox
              icon="time-outline"
              value={duration}
              onValueChange={value => {

                setDuration(value);

                calculateEndDate(
                  value,
                  startDate,
                );

              }}
              placeholder="Select Duration"
            >

              {/* NO SELECT DURATION ITEM */}


{durationOptions.map((item, index) => {

  let label = item;

  switch (item) {
    case 'Day':
      label = 'Day';
      break;

    case '3Day':
      label = '3 Days';
      break;

    case '5Day':
      label = '5 Days';
      break;

    case 'Weekly':
      label = 'Weekly';
      break;

    case 'Month':
      label = 'Monthly';
      break;

    case 'Quarter':
      label = 'Quarter';
      break;

    case 'Half Year':
      label = 'Half Year';
      break;

    case 'Year':
      label = 'Yearly';
      break;

    default:
      label = item;
  }

  return (
    <Picker.Item
      key={`${item}-${index}`}
      label={label}
      value={item}
    />
  );
})}


            </SelectBox>


            {/* =================================================
               DATES
            ================================================= */}

            <View style={styles.dateRow}>


              {/* START DATE */}

              <TouchableOpacity
                style={
                  styles.dateCard
                }
                onPress={() =>
                  setOpenStart(true)
                }
              >

                <View
                  style={
                    styles.dateIcon
                  }
                >

                  <Ionicons
                    name="calendar"
                    size={24}
                    color="#EF5B25"
                  />

                </View>


                <Text
                  style={
                    styles.dateLabel
                  }
                >
                  START DATE
                </Text>


                <Text
                  style={
                    styles.dateValue
                  }
                >
                  {formatDate(
                    startDate,
                  )}
                </Text>


                <Text
                  style={
                    styles.dateTime
                  }
                >
                  {formatTime(
                    startDate,
                  )}
                </Text>

              </TouchableOpacity>


              {/* END DATE */}

              <TouchableOpacity
                style={
                  styles.dateCard
                }
                onPress={() =>
                  setOpenEnd(true)
                }
              >

                <View
                  style={
                    styles.dateIcon
                  }
                >

                  <Ionicons
                    name="calendar"
                    size={24}
                    color="#16A34A"
                  />

                </View>


                <Text
                  style={
                    styles.dateLabel
                  }
                >
                  END DATE
                </Text>


                <Text
                  style={
                    styles.dateValue
                  }
                >
                  {formatDate(
                    endDate,
                  )}
                </Text>


                <Text
                  style={
                    styles.dateTime
                  }
                >
                  {formatTime(
                    endDate,
                  )}
                </Text>

              </TouchableOpacity>

            </View>


            {/* START DATE PICKER */}

            <DatePicker
              modal
              open={openStart}
              date={startDate}
              mode="datetime"
              minimumDate={
                new Date()
              }
              onConfirm={date => {

                setOpenStart(false);

                setStartDate(date);

                if (duration) {

                  calculateEndDate(
                    duration,
                    date,
                  );

                }

              }}
              onCancel={() =>
                setOpenStart(false)
              }
            />


            {/* END DATE PICKER */}

            <DatePicker
              modal
              open={openEnd}
              date={endDate}
              mode="datetime"
              onConfirm={date => {

                setOpenEnd(false);

                setEndDate(date);

              }}
              onCancel={() =>
                setOpenEnd(false)
              }
            />

          </View>


          {/* =================================================
             PAYMENT BUTTON
          ================================================= */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.paymentButton
            }
            onPress={
              goToPayment
            }
          >

            <View
              style={
                styles.paymentIcon
              }
            >

              <Ionicons
                name="shield-outline"
                size={25}
                color="#fff"
              />

            </View>


            <View
              style={
                styles.paymentTextBox
              }
            >

              <Text
                style={
                  styles.paymentTitle
                }
              >
                Continue to Payment
              </Text>


              <Text
                style={
                  styles.paymentSubtitle
                }
              >
                Review details & proceed securely
              </Text>

            </View>


            <Ionicons
              name="chevron-forward"
              size={26}
              color="#fff"
            />

          </TouchableOpacity>


          {/* =================================================
             SECURITY
          ================================================= */}

          <View
            style={
              styles.secureBox
            }
          >

            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#16A34A"
            />


            <Text
              style={
                styles.secureText
              }
            >
              Your information is securely processed
            </Text>

          </View>


        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 25,
  },
  noticeBox: {
    backgroundColor: '#FFF8E8',
    borderWidth: 1,
    borderColor: '#F5D48A',
    borderRadius: 15,
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
  noticeContent: {
    flex: 1,
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
  bold: {
    fontWeight: '800',
    color: '#9A5B00',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 17,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF0EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    color: '#171717',
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#8A8F98',
    fontSize: 11,
    marginTop: 2,
  },
  label: {
    color: '#363A40',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
    marginTop: 1,
  },
  required: {
    color: '#EF5B25',
  },
  inputWrapper: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFB',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  inputIcon: {
    width: 44,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 46,
    color: '#222',
    fontSize: 13.5,
    paddingRight: 10,
    paddingLeft: 0,
  },
  selectWrapper: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D9DDE3',
    backgroundColor: '#F3F4F6',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    overflow: 'hidden',
  },
  selectIcon: {
    width: 44,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  pickerContainer: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    position: 'relative',
  },
  picker: {
    width: '100%',
    height: 48,
    color: '#30343B',
    backgroundColor: '#F3F4F6',
  },
  placeholderOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 48,
    justifyContent: 'center',
    paddingLeft: 10,
    zIndex: 2,
    pointerEvents: 'none',
    backgroundColor: '#F3F4F6',
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 13.5,
  },
  extraVehicleBox: {
    backgroundColor: '#FFF8F5',
    borderRadius: 14,
    padding: 10,
    marginTop: 1,
  },
  extraTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  extraTitle: {
    color: '#343434',
    fontWeight: '800',
    fontSize: 13.5,
    marginLeft: 7,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 3,
  },
  dateCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 10,
  },
  dateIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FFF0EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },
  dateLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  dateValue: {
    color: '#222',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },
  dateTime: {
    color: '#8A8F98',
    fontSize: 10.5,
    marginTop: 1,
  },
  paymentButton: {
    backgroundColor: '#001433',
    minHeight: 64,
    borderRadius: 17,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    shadowColor: '#EF5B25',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentTextBox: {
    flex: 1,
    marginLeft: 10,
  },
  paymentTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  paymentSubtitle: {
    color: '#FFE5DB',
    fontSize: 10.5,
    marginTop: 2,
  },
  secureBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  secureText: {
    color: '#777E88',
    fontSize: 10.5,
    marginLeft: 5,
  },
});