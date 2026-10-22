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
import {useTranslation} from 'react-i18next';

const InputBox = React.memo(
  ({
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    maxLength,
    autoCapitalize = 'none',
    autoCorrect = false,
    inputMode,
  }) => (
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
  ),
);

const SelectBox = ({
  icon,
  value,
  onValueChange,
  placeholder,
  children,
}) => (
  <View style={styles.selectWrapper}>
    <View style={styles.selectIcon}>
      <Ionicons name={icon} size={21} color="#EF5B25" />
    </View>

    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={styles.picker}
        dropdownIconColor="#EF5B25"
        mode="dropdown">
        {children}
      </Picker>

      {!value && (
        <View
          pointerEvents="none"
          style={styles.placeholderOverlay}>
          <Text style={styles.placeholderText}>
            {placeholder}
          </Text>
        </View>
      )}
    </View>
  </View>
);

export default function VehicleTexScreen({navigation}) {
  const {t} = useTranslation();

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
  }, [state, category, subCategory, vehicleNumber]);

  const loadStates = async () => {
    try {
      const response = await fetch(`${BASE_URL}states.php`);
      const data = await response.json();

      setStates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('States Error:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}categories.php`);
      const data = await response.json();

      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Categories Error:', error);
    }
  };

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

      setSubCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Sub Category Error:', error);
      setSubCategories([]);
    }
  };

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
      formData.append(
        'vehicleNumber',
        vehicleNumber.toUpperCase(),
      );

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
        t('durationNotAvailableTitle'),
        t('durationNotAvailableMessage'),
      );
    } catch (error) {
      console.log('Duration API Error:', error);

      setDurationOptions([]);
      setDuration('');

      Alert.alert(
        t('error'),
        t('unableToLoadDuration'),
      );
    }
  };

  const showChassis =
    state &&
    vehicleNumber.substring(0, 2).toUpperCase() ===
      state.toUpperCase();

  const normalizedState = state?.toUpperCase();

  const showSeatAc =
    (normalizedState === 'UP' || normalizedState === 'UK') &&
    ['3', '4', '5', '6', '7', '8'].includes(
      String(subCategory),
    );

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
          23,
          59,
          59,
          999,
        );
        break;

      case 'Quarter': {
        const year = date.getFullYear();
        const month = date.getMonth();

        let endMonth;

        if (month <= 2) {
          endMonth = 2;
        } else if (month <= 5) {
          endMonth = 5;
        } else if (month <= 8) {
          endMonth = 8;
        } else {
          endMonth = 11;
        }

        date = new Date(
          year,
          endMonth + 1,
          0,
          23,
          59,
          59,
          999,
        );
        break;
      }

      case 'Half Year': {
        const year = date.getFullYear();
        const month = date.getMonth();

        const endMonth = month <= 5 ? 5 : 11;

        date = new Date(
          year,
          endMonth + 1,
          0,
          23,
          59,
          59,
          999,
        );
        break;
      }

      case 'Year': {
        const year = date.getFullYear();

        date = new Date(
          year,
          11,
          31,
          23,
          59,
          59,
          999,
        );
        break;
      }

      default:
        break;
    }

    setEndDate(date);
  };

  const formatDate = date =>
    date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatTime = date =>
    date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

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
        t('requiredFields'),
        t('fillRequiredFields'),
      );
      return;
    }

    if (phone.length !== 10) {
      Alert.alert(
        t('invalidMobileNumber'),
        t('validMobileNumberMessage'),
      );
      return;
    }

    if (showChassis && chassisNumber.length !== 5) {
      Alert.alert(
        t('invalidChassisNumber'),
        t('validChassisNumberMessage'),
      );
      return;
    }

    if (showSeatAc && (!noOfSeats || !acType)) {
      Alert.alert(
        t('requiredFields'),
        t('enterSeatsAndAcType'),
      );
      return;
    }

    navigation.navigate('PaymentScreen', {
      phone_number: phone,
      vehicle_number: vehicleNumber,
      state,
      chassis_number: chassisNumber,
      category,
      sub_category: subCategory,
      duration,
      no_of_seats: noOfSeats,
      ac_type: acType,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          contentContainerStyle={styles.scrollContent}>

          <View style={styles.noticeBox}>
            <View style={styles.noticeIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={25}
                color="#D97706"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>
                {t('importantNotice')}
              </Text>

              <Text style={styles.noticeText}>
                {t('borderTaxNotice')}
              </Text>
            </View>
          </View>

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
                <Text style={styles.sectionTitle}>
                  {t('vehicleDetails')}
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {t('enterVehicleInfo')}
                </Text>
              </View>
            </View>

            <Text style={styles.label}>
              {t('mobileNumber')}{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <InputBox
              icon="phone-portrait-outline"
              placeholder={t('enterMobileNumber')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="number-pad"
              inputMode="tel"
              maxLength={10}
            />

            <Text style={styles.label}>
              {t('vehicleNumber')}{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <InputBox
              icon="car-sport-outline"
              placeholder={t('vehicleNumberExample')}
              value={vehicleNumber}
              onChangeText={text => {
                const cleanedText = text
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, '');

                setVehicleNumber(cleanedText);
              }}
              autoCapitalize="characters"
              maxLength={10}
            />

            <Text style={styles.label}>
              {t('registrationState')}{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <SelectBox
              icon="map-outline"
              value={state}
              onValueChange={setState}
              placeholder={t('selectState')}>
              {states.map(item => (
                <Picker.Item
                  key={String(item.id)}
                  label={item.name}
                  value={item.code}
                />
              ))}
            </SelectBox>

            {showChassis && (
              <>
                <Text style={styles.label}>
                  {t('chassisNumber')}
                </Text>

                <InputBox
                  icon="barcode-outline"
                  placeholder={t('enterChassisNumber')}
                  value={chassisNumber}
                  onChangeText={text => {
                    setChassisNumber(
                      text.replace(/[^0-9]/g, ''),
                    );
                  }}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={5}
                />
              </>
            )}
          </View>

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
                <Text style={styles.sectionTitle}>
                  {t('vehicleType')}
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {t('selectCategoryAndType')}
                </Text>
              </View>
            </View>

            <Text style={styles.label}>
              {t('vehicleCategory')}{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <SelectBox
              icon="car"
              value={category}
              onValueChange={value => {
                setCategory(value);
                setSubCategory('');
                loadSubCategory(value);
              }}
              placeholder={t('selectVehicleCategory')}>
              {categories.map(item => (
                <Picker.Item
                  key={String(item.id)}
                  label={item.name}
                  value={item.id}
                />
              ))}
            </SelectBox>

            <Text style={styles.label}>
              {t('vehicleType')}{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <SelectBox
              icon="car"
              value={subCategory}
              onValueChange={setSubCategory}
              placeholder={t('selectVehicleType')}>
              {subCategories.map(item => (
                <Picker.Item
                  key={String(item.id)}
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
                    {t('additionalDetails')}
                  </Text>
                </View>

                <Text style={styles.label}>
                  {t('numberOfSeats')}
                </Text>

                <InputBox
                  icon="people-outline"
                  placeholder={t('enterNumberOfSeats')}
                  value={noOfSeats}
                  onChangeText={setNoOfSeats}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  maxLength={3}
                />

                <Text style={styles.label}>
                  {t('acType')}
                </Text>

                <SelectBox
                  icon="snow"
                  value={acType}
                  onValueChange={setAcType}
                  placeholder={t('selectAcType')}>
                  <Picker.Item
                    label={t('ac')}
                    value="AC"
                  />

                  <Picker.Item
                    label={t('nonAc')}
                    value="Non AC"
                  />
                </SelectBox>
              </View>
            )}
          </View>

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
                <Text style={styles.sectionTitle}>
                  {t('taxPeriod')}
                </Text>

                <Text style={styles.sectionSubtitle}>
                  {t('chooseTaxPeriod')}
                </Text>
              </View>
            </View>

            <Text style={styles.label}>
              {t('duration')}{' '}
              <Text style={styles.required}>*</Text>
            </Text>

            <SelectBox
              icon="time-outline"
              value={duration}
              onValueChange={value => {
                setDuration(value);
                calculateEndDate(value, startDate);
              }}
              placeholder={t('selectDuration')}>
              {durationOptions.map((item, index) => {
                let label = item;

                switch (item) {
                  case 'Day':
                    label = t('day');
                    break;
                  case '3Day':
                    label = t('threeDays');
                    break;
                  case '5Day':
                    label = t('fiveDays');
                    break;
                  case 'Weekly':
                    label = t('weekly');
                    break;
                  case 'Month':
                    label = t('monthly');
                    break;
                  case 'Quarter':
                    label = t('quarter');
                    break;
                  case 'Half Year':
                    label = t('halfYear');
                    break;
                  case 'Year':
                    label = t('yearly');
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

                <Text style={styles.dateLabel}>
                  {t('startDate')}
                </Text>

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

                <Text style={styles.dateLabel}>
                  {t('endDate')}
                </Text>

                <Text style={styles.dateValue}>
                  {formatDate(endDate)}
                </Text>

                <Text style={styles.dateTime}>
                  {formatTime(endDate)}
                </Text>
              </TouchableOpacity>
            </View>

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
                {t('continueToPayment')}
              </Text>

              <Text style={styles.paymentSubtitle}>
                {t('reviewProceed')}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={26}
              color="#fff"
            />
          </TouchableOpacity>

          <View style={styles.secureBox}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#16A34A"
            />

            <Text style={styles.secureText}>
              {t('secureProcessing')}
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
    marginBottom: 8,
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
    height: 58,
    color: '#30343B',
    backgroundColor: '#F3F4F6',
  },
  placeholderOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 50,
    justifyContent: 'center',
    paddingLeft: 10,
    zIndex: 2,
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