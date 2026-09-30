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

export default function VehicleTexScreen({navigation}) {
  const [phone, setPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

  const [states, setStates] = useState([]);
  const [state, setState] = useState('');

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');

  const [subCategories, setSubCategories] = useState([]);
  const [subCategory, setSubCategory] = useState('');

  const [chassisNumber, setChassisNumber] = useState('');
  const [duration, setDuration] = useState('');

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  const [noOfSeats, setNoOfSeats] = useState('');
  const [acType, setAcType] = useState('');

  useEffect(() => {
    loadStates();
    loadCategories();
  }, []);

  const loadStates = async () => {
    try {
      const response = await fetch(`${BASE_URL}states.php`);
      const data = await response.json();
      setStates(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}categories.php`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadSubCategory = async categoryId => {
    try {
      const formData = new FormData();
      formData.append('category_id', categoryId);

      const response = await fetch(`${BASE_URL}sub_category_ajax.php`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setSubCategories(data);
    } catch (error) {
      console.log(error);
    }
  };

  const showChassis =
    state &&
    vehicleNumber.substring(0, 2).toUpperCase() === state.toUpperCase();

  const showSeatAc =
    state?.toUpperCase() === 'UP' || state?.toUpperCase() === 'UK';

  const setEndOfDay = date => {
    date.setHours(23, 59, 59, 999);
    return date;
  };

  const calculateEndDate = (selectedDuration, selectedStart) => {
    let date = new Date(selectedStart);

    switch (selectedDuration) {
      case 'Day':
        date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        break;

      case '3Day':
        date = new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000);
        break;

      case '5Day':
        date = new Date(date.getTime() + 5 * 24 * 60 * 60 * 1000);
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
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = date => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const goToPayment = () => {
    if (
      !phone ||
      !vehicleNumber ||
      !state ||
      !category ||
      !subCategory ||
      !duration
    ) {
      Alert.alert('Required Fields', 'Please fill all required fields');
      return;
    }

    if (showSeatAc && (!noOfSeats || !acType)) {
      Alert.alert('Required Fields', 'Please enter seats and AC type');
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

  const InputBox = ({
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    maxLength,
    autoCapitalize,
  }) => {
    return (
      <View style={styles.inputWrapper}>
        <View style={styles.inputIcon}>
          <Ionicons
            name={icon}
            size={21}
            color="#EF5B25"
          />
        </View>

        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          style={styles.input}
        />
      </View>
    );
  };

const SelectBox = ({
  icon,
  value,
  onValueChange,
  placeholder,
  children,
}) => {
  return (
    <View style={styles.selectWrapper}>
      <View style={styles.selectIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#EF5B25"
        />
      </View>

      <View style={styles.pickerContainer}>
        {!value && (
          <View style={styles.placeholderOverlay}>
            <Text style={styles.placeholderText}>
              {placeholder}
            </Text>
          </View>
        )}

        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor="#EF5B25"
        >
          {children}
        </Picker>
      </View>
    </View>
  );
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>


          {/* NOTICE */}
          <View style={styles.noticeBox}>
            <View style={styles.noticeIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={26}
                color="#D97706"
              />
            </View>

            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>Important Notice</Text>

              <Text style={styles.noticeText}>
                किसी भी State Border को Enter करने से कम से कम{' '}
                <Text style={styles.bold}>30 मिनट पहले</Text> Tax
                Request भेजें।
              </Text>
            </View>
          </View>

          {/* VEHICLE DETAILS */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="car-outline"
                  size={22}
                  color="#EF5B25"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>Vehicle Details</Text>
                <Text style={styles.sectionSubtitle}>
                  Enter your vehicle information
                </Text>
              </View>
            </View>

            <Text style={styles.label}>
              Mobile Number <Text style={styles.required}>*</Text>
            </Text>

            <InputBox
              icon="phone-portrait-outline"
              placeholder="Enter 10 digit mobile number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="number-pad"
              maxLength={10}
            />

            <Text style={styles.label}>
              Vehicle Number <Text style={styles.required}>*</Text>
            </Text>

            <InputBox
              icon="car-sport-outline"
              placeholder="Example: PB01AB1234"
              value={vehicleNumber}
              autoCapitalize="characters"
              onChangeText={text =>
                setVehicleNumber(
                  text.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                )
              }
            />

            <Text style={styles.label}>
              Registration State <Text style={styles.required}>*</Text>
            </Text>

            <SelectBox
              icon="map-outline"
              value={state}
              onValueChange={setState}
              placeholder="Select State">

              {states.map(item => (
                <Picker.Item
                  key={item.id}
                  label={item.name}
                  value={item.code}
                />
              ))}
            </SelectBox>

            {showChassis && (
              <>
                <Text style={styles.label}>Chassis Number</Text>

                <InputBox
                  icon="barcode-outline"
                  placeholder="Enter chassis number"
                  value={chassisNumber}
                  onChangeText={setChassisNumber}
                  autoCapitalize="characters"
                />
              </>
            )}
          </View>

          {/* VEHICLE TYPE */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="bus-outline"
                  size={22}
                  color="#EF5B25"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>Vehicle Type</Text>
                <Text style={styles.sectionSubtitle}>
                  Select category and vehicle type
                </Text>
              </View>
            </View>

            <Text style={styles.label}>
              Vehicle Category <Text style={styles.required}>*</Text>
            </Text>

            <SelectBox
              icon="car"
              value={category}
              onValueChange={value => {
                setCategory(value);
                setSubCategory('');
                loadSubCategory(value);
              }}
              placeholder="Select Vehicle Category">

              {categories.map(item => (
                <Picker.Item
                  key={item.id}
                  label={item.name}
                  value={item.id}
                />
              ))}
            </SelectBox>

            <Text style={styles.label}>
              Vehicle Type <Text style={styles.required}>*</Text>
            </Text>

            <SelectBox
              icon="car"
              value={subCategory}
              onValueChange={setSubCategory}
              placeholder="Select Vehicle Type">

              {subCategories.map(item => (
                <Picker.Item
                  key={item.id}
                  label={item.name}
                  value={item.id}
                />
              ))}
            </SelectBox>

            {showSeatAc && (
              <View style={styles.extraVehicleBox}>
                <View style={styles.extraTitleRow}>
                  <Ionicons
                    name="bus-outline"
                    size={21}
                    color="#EF5B25"
                  />

                  <Text style={styles.extraTitle}>
                    Additional Details
                  </Text>
                </View>

                <Text style={styles.label}>Number of Seats</Text>

                <InputBox
                  icon="seat-outline"
                  placeholder="Enter number of seats"
                  value={noOfSeats}
                  onChangeText={setNoOfSeats}
                  keyboardType="numeric"
                />

                <Text style={styles.label}>AC Type</Text>

                <SelectBox
                  icon="snow"
                  value={acType}
                  onValueChange={setAcType}
                  placeholder="Select AC Type">

                  <Picker.Item label="AC" value="AC" />
                  <Picker.Item label="Non AC" value="Non AC" />
                </SelectBox>
              </View>
            )}
          </View>

          {/* TAX PERIOD */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="calculator"
                  size={22}
                  color="#EF5B25"
                />
              </View>

              <View>
                <Text style={styles.sectionTitle}>Tax Period</Text>
                <Text style={styles.sectionSubtitle}>
                  Choose your tax validity period
                </Text>
              </View>
            </View>

            <Text style={styles.label}>
              Duration <Text style={styles.required}>*</Text>
            </Text>

            <SelectBox
              icon="time-outline"
              value={duration}
              onValueChange={value => {
                setDuration(value);
                calculateEndDate(value, startDate);
              }}
              placeholder="Select Duration">

              <Picker.Item label="Day" value="Day" />
              <Picker.Item label="3 Days" value="3Day" />
              <Picker.Item label="5 Days" value="5Day" />
              <Picker.Item label="Weekly" value="Weekly" />
              <Picker.Item label="Monthly" value="Month" />
              <Picker.Item label="Quarter" value="Quarter" />
              <Picker.Item label="Half Year" value="Half Year" />
              <Picker.Item label="Yearly" value="Year" />
            </SelectBox>

            {/* DATES */}
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateCard}
                onPress={() => setOpenStart(true)}>

                <View style={styles.dateIcon}>
                  <Ionicons
                    name="calendar"
                    size={24}
                    color="#EF5B25"
                  />
                </View>

                <Text style={styles.dateLabel}>START DATE</Text>

                <Text style={styles.dateValue}>
                  {formatDate(startDate)}
                </Text>

                <Text style={styles.dateTime}>
                  {formatTime(startDate)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateCard}
                onPress={() => setOpenEnd(true)}>

                <View style={styles.dateIcon}>
                  <Ionicons
                    name="calendar"
                    size={24}
                    color="#16A34A"
                  />
                </View>

                <Text style={styles.dateLabel}>END DATE</Text>

                <Text style={styles.dateValue}>
                  {formatDate(endDate)}
                </Text>

                <Text style={styles.dateTime}>
                  {formatTime(endDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* START DATE PICKER */}
            <DatePicker
              modal
              open={openStart}
              date={startDate}
              mode="datetime"
              minimumDate={new Date()}
              onConfirm={date => {
                setOpenStart(false);
                setStartDate(date);

                if (duration) {
                  calculateEndDate(duration, date);
                }
              }}
              onCancel={() => setOpenStart(false)}
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
              onCancel={() => setOpenEnd(false)}
            />
          </View>

          {/* PAYMENT BUTTON */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.paymentButton}
            onPress={goToPayment}>

            <View style={styles.paymentIcon}>
              <Ionicons
                name="shield-outline"
                size={25}
                color="#fff"
              />
            </View>

            <View style={styles.paymentTextBox}>
              <Text style={styles.paymentTitle}>
                Continue to Payment
              </Text>

              <Text style={styles.paymentSubtitle}>
                Review details & proceed securely
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={26}
              color="#fff"
            />
          </TouchableOpacity>

          {/* SECURITY */}
          <View style={styles.secureBox}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#16A34A"
            />

            <Text style={styles.secureText}>
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
    padding: 16,
    paddingBottom: 35,
  },

  /* HEADER */

  header: {
    backgroundColor: '#EF5B25',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    shadowColor: '#EF5B25',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 7,
  },

  headerSmall: {
    color: '#FFE4D8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },

  headerSubtitle: {
    color: '#FFEDE5',
    fontSize: 13,
    marginTop: 5,
  },

  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* NOTICE */

  noticeBox: {
    backgroundColor: '#FFF8E8',
    borderWidth: 1,
    borderColor: '#F5D48A',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  noticeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFE9B5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  noticeContent: {
    flex: 1,
  },

  noticeTitle: {
    color: '#9A5B00',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },

  noticeText: {
    color: '#805B21',
    fontSize: 12.5,
    lineHeight: 19,
  },

  bold: {
    fontWeight: '800',
    color: '#9A5B00',
  },

  /* CARD */

  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF0EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  sectionTitle: {
    color: '#171717',
    fontSize: 17,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#8A8F98',
    fontSize: 12,
    marginTop: 3,
  },

  label: {
    color: '#363A40',
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 2,
  },

  required: {
    color: '#EF5B25',
  },

  /* INPUT */

  inputWrapper: {
    height: 54,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFB',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  inputIcon: {
    width: 48,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    height: 52,
    color: '#222',
    fontSize: 14,
    paddingRight: 12,
  },

  /* PICKER */

  selectWrapper: {
    height: 54,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFB',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },

  selectIcon: {
    width: 48,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pickerContainer: {
    flex: 1,
    height: 54,
    justifyContent: 'center',
  },

  picker: {
    width: '100%',
    height: 54,
    color: '#30343B',
  },

  /* EXTRA */

  extraVehicleBox: {
    backgroundColor: '#FFF8F5',
    borderRadius: 17,
    padding: 13,
    marginTop: 2,
  },

  extraTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  extraTitle: {
    color: '#343434',
    fontWeight: '800',
    fontSize: 14,
    marginLeft: 8,
  },

  /* DATES */

  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },

  dateCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 17,
    padding: 13,
  },

  dateIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFF0EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  dateLabel: {
    color: '#9CA3AF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  dateValue: {
    color: '#222',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },

  dateTime: {
    color: '#8A8F98',
    fontSize: 11,
    marginTop: 2,
  },

  /* PAYMENT */

  paymentButton: {
    backgroundColor: '#EF5B25',
    minHeight: 72,
    borderRadius: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,

    shadowColor: '#EF5B25',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 7,
  },

  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  paymentTextBox: {
    flex: 1,
    marginLeft: 12,
  },

  paymentTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  paymentSubtitle: {
    color: '#FFE5DB',
    fontSize: 11,
    marginTop: 3,
  },

  /* SECURITY */

  secureBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  secureText: {
    color: '#777E88',
    fontSize: 11,
    marginLeft: 6,
  },

  placeholderOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 54,
    justifyContent: 'center',
    paddingLeft: 12,
    zIndex: 1,
    pointerEvents: 'none',
    backgroundColor:'#FAFAFB',
  },

  placeholderText: {
    color: '#000',
    fontSize: 14,
  },

});