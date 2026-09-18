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

import { SafeAreaView } from 'react-native-safe-area-context';

import {Picker} from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';

import {BASE_URL} from './config/config';

export default function VehicleTexScreen({ navigation }) {

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
      const response = await fetch(
        `${BASE_URL}states.php`,
      );
      const data = await response.json();
      setStates(data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}categories.php`,
      );
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

      const response = await fetch(
        `${BASE_URL}sub_category_ajax.php`,
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = await response.json();
      console.log(data);

      setSubCategories(data);
    } catch (error) {
      console.log(error);
    }
  };

  const showChassis = state && vehicleNumber.substring(0, 2).toUpperCase() === state.toUpperCase();
  const showSeatAc = state?.toUpperCase() === 'UP' || state?.toUpperCase() === 'UK';

   const setEndOfDay = date => {
  date.setHours(23, 59, 59, 999);
  return date;
};

  const calculateEndDate = (
    selectedDuration,
    selectedStart,
  ) => {
    let date = new Date(selectedStart);

    switch (selectedDuration) {
    case 'Day':
      date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
      break;

    case '3Day':
      date = new Date(date.getTime() + (3 * 24 * 60 * 60 * 1000));
      break;

    case '5Day':
      date = new Date(date.getTime() + (5 * 24 * 60 * 60 * 1000));
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
    }

    setEndDate(date);
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
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (showSeatAc && (!noOfSeats || !acType)) {
      Alert.alert(
        'Error',
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

  return (
<SafeAreaView style={{ flex: 1 }}>
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, padding: 10 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >

    <View style={styles.noticeBox}>
      <Text style={styles.noticeTitle}>
        ⚠ Important Notice
      </Text>

      <Text style={styles.noticeText}>
        किसी भी State Border को Enter करने से कम से कम
        {' '}
        <Text style={{fontWeight: 'bold'}}>
          30 मिनट पहले
        </Text>
        {' '}
        Tax कटवाने की Request भेजें।
      </Text>
    </View>

      <Text style={styles.title}>
        Vehicle Detail
      </Text>

      <TextInput
        placeholder="Phone Number"
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />

      <TextInput
        placeholder="Vehicle Number"
        style={styles.input}
        value={vehicleNumber}
        onChangeText={text =>
          setVehicleNumber(
            text
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, ''),
          )
        }
      />

      <Picker
        selectedValue={state}
        style={styles.picker}
        onValueChange={itemValue =>
          setState(itemValue)
        }>
        <Picker.Item
          label="Select State"
          value=""
        />

        {states.map(item => (
          <Picker.Item
            key={item.id}
            label={item.name}
            value={item.code}
          />
        ))}
      </Picker>

      {showChassis && (
        <TextInput
          placeholder="Chassis Number"
          style={styles.input}
          value={chassisNumber}
          onChangeText={setChassisNumber}
        />
      )}

      <Picker
        style={styles.picker}
        selectedValue={category}
        onValueChange={value => {
          setCategory(value);
          loadSubCategory(value);
        }}>
        <Picker.Item
          label="Vehicle Category"
          value=""
        />

        {categories.map(item => (
          <Picker.Item
            key={item.id}
            label={item.name}
            value={item.id}
          />
        ))}
      </Picker>

      <Picker
      style={styles.picker}
        selectedValue={subCategory}
        onValueChange={setSubCategory}>
        <Picker.Item
          label="Vehicle Type"
          value=""
        />

        {subCategories.map(item => (
          <Picker.Item
            key={item.id}
            label={item.name}
            value={item.id}
          />
        ))}
      </Picker>

      {showSeatAc && (
        <>
          <TextInput
            placeholder="No. of Seats"
            keyboardType="numeric"
            value={noOfSeats}
            onChangeText={setNoOfSeats}
            style={styles.input}
          />

          <Picker
           style={styles.picker}
            selectedValue={acType}
            onValueChange={setAcType}>
            <Picker.Item
              label="Select AC Type"
              value=""
            />
            <Picker.Item
              label="AC"
              value="AC"
            />
            <Picker.Item
              label="Non AC"
              value="Non AC"
            />
          </Picker>
        </>
      )}

      <Picker
        style={styles.picker}
        selectedValue={duration}
        onValueChange={value => {
          setDuration(value);
          calculateEndDate(value, startDate);
        }}>
        <Picker.Item
          label="Select Duration"
          value=""
        />

        <Picker.Item
          label="Day"
          value="Day"
        />

        <Picker.Item
          label="3 Day"
          value="3Day"
        />

        <Picker.Item
          label="5 Day"
          value="5Day"
        />

        <Picker.Item
          label="Weekly"
          value="Weekly"
        />

        <Picker.Item
          label="Month"
          value="Month"
        />

        <Picker.Item
          label="Quarter"
          value="Quarter"
        />

        <Picker.Item
          label="Half Year"
          value="Half Year"
        />

        <Picker.Item
          label="Year"
          value="Year"
        />
      </Picker>

      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setOpenStart(true)}>
        <Text>
          Start Date :
          {' '}
          {startDate.toLocaleString()}
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={openStart}
        date={startDate}
        mode="datetime"
        style={styles.picker}
        minimumDate={new Date()}
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
        onCancel={() => setOpenStart(false)}
      />

      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setOpenEnd(true)}>
        <Text>
          End Date :
          {' '}
          {endDate.toLocaleString()}
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={openEnd}
        date={endDate}
        style={styles.picker}
        mode="datetime"
        onConfirm={date => {
          setOpenEnd(false);
          setEndDate(date);
        }}
        onCancel={() => setOpenEnd(false)}
      />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={goToPayment}>
          <Text style={styles.btnText}>
            Continue To Payment
          </Text>
        </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 12,
  },

  dateBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
  },

  submitBtn: {
    backgroundColor: 'orangered',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#999',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 12,
  },
  picker: {
    borderWidth: 1.5,
    borderColor: '#999',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 12,
      overflow: 'hidden',
      backgroundColor: '#fff',
  },
  noticeBox: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#F5C542',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },

  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8A5A00',
    textAlign: 'center',
    marginBottom: 5,
  },

  noticeText: {
    fontSize: 14,
    color: '#8A5A00',
    textAlign: 'center',
  },
});