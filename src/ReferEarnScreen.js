import React, {useEffect, useState} from 'react';
import {
View,
Text,
StyleSheet,
TouchableOpacity,
Share,
ActivityIndicator,
Alert,
ScrollView
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';
import {BASE_URL} from './config/config';

export default function ReferEarnScreen() {

const [loading, setLoading] = useState(true);
const [referCode, setReferCode] = useState('');
const [balance, setBalance] = useState('0');

useEffect(() => {
loadReferralData();
}, []);

const loadReferralData = async () => {
try {


  const uid = await AsyncStorage.getItem('userId');

  const response = await fetch(
    `${BASE_URL}refer-earn.php?uid=${uid}`,
  );

  const result = await response.json();

  if (result.status) {
    setReferCode(result.refer_no);
    setBalance(result.balance);
  }

} catch (error) {
  console.log(error);
} finally {
  setLoading(false);
}


};

const copyCode = () => {

  Clipboard.setString(referCode);

  Alert.alert(
    'Success',
    'Referral code copied successfully.',
  );

};

const shareReferral = async () => {
try {


  await Share.share({
    message:
      `🚗 Join ChalteRho and get hassle-free vehicle tax services.\n\nUse my referral code: ${referCode}\n\nDownload App:\nhttps://chalterho.com`,
  });

} catch (error) {
  console.log(error);
}


};

if (loading) {
return ( <View style={styles.loader}> <ActivityIndicator
       size="large"
       color="orangered"
     /> </View>
);
}

return (
<SafeAreaView style={styles.container} edges={['top', 'bottom']}>

  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{
      paddingBottom: 30,
    }}
  >

<View style={styles.container}>


  <View style={styles.topCard}>
    <Ionicons
      name="gift"
      size={70}
      color="orangered"
    />

    <Text style={styles.heading}>
      Refer & Earn
    </Text>

    <Text style={styles.subHeading}>
      Invite your friends and earn rewards
    </Text>
  </View>

  {/*<View style={styles.card}>

    <Text style={styles.balanceLabel}>
      Wallet Balance
    </Text>

    <Text style={styles.balance}>
      ₹{balance}
    </Text>

  </View>*/}

  <View style={styles.card}>

    <Text style={styles.label}>
      Your Referral Code
    </Text>

    <Text style={styles.code}>
      {referCode}
    </Text>

    <TouchableOpacity
      style={styles.copyBtn}
      onPress={copyCode}
    >
      <Text style={styles.btnText}>
        Copy Code
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.shareBtn}
      onPress={shareReferral}
    >
      <Ionicons
        name="logo-whatsapp"
        size={20}
        color="#fff"
      />

      <Text style={styles.shareText}>
        Share on WhatsApp
      </Text>
    </TouchableOpacity>

  </View>

  <View style={styles.card}>
    <Text style={styles.workTitle}>
      How It Works
    </Text>

    <Text style={styles.workText}>
      • Share your referral code with friends.
    </Text>

    <Text style={styles.workText}>
      • Friend registers using your code.
    </Text>

    <Text style={styles.workText}>
      • When friend completes first transaction, you earn rewards.
    </Text>

    <Text style={styles.workText}>
      • Reward amount is added directly to your wallet.
    </Text>
  </View>

</View>
</ScrollView>
</SafeAreaView>
);
}

const styles = StyleSheet.create({

container: {
flex: 1,
backgroundColor: '#f3f5f9',
padding: 5,
},

loader: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
},

topCard: {
backgroundColor: '#fff',
borderRadius: 20,
padding: 25,
alignItems: 'center',
elevation: 3,
marginBottom: 15,
},

card: {
backgroundColor: '#fff',
borderRadius: 20,
padding: 20,
elevation: 3,
marginBottom: 15,
},

heading: {
fontSize: 24,
fontWeight: '700',
marginTop: 10,
color: '#222',
},

subHeading: {
color: '#666',
marginTop: 5,
textAlign: 'center',
},

balanceLabel: {
textAlign: 'center',
fontSize: 16,
color: '#666',
},

balance: {
textAlign: 'center',
fontSize: 32,
fontWeight: 'bold',
color: '#2E7D32',
marginTop: 8,
},

label: {
textAlign: 'center',
fontSize: 16,
fontWeight: '600',
},

code: {
textAlign: 'center',
fontSize: 30,
fontWeight: 'bold',
color: 'orangered',
marginVertical: 15,
},

copyBtn: {
backgroundColor: '#007bff',
padding: 12,
borderRadius: 10,
alignItems: 'center',
marginBottom: 10,
},

shareBtn: {
backgroundColor: '#25D366',
padding: 12,
borderRadius: 10,
alignItems: 'center',
justifyContent: 'center',
flexDirection: 'row',
},

btnText: {
color: '#fff',
fontWeight: '700',
},

shareText: {
color: '#fff',
fontWeight: '700',
marginLeft: 8,
},

workTitle: {
fontSize: 18,
fontWeight: '700',
marginBottom: 10,
},

workText: {
fontSize: 15,
color: '#444',
marginBottom: 8,
},

});
