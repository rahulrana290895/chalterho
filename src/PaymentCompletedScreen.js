import React from 'react';
import {
View,
Text,
Image,
StyleSheet,
TouchableOpacity,
Linking,
} from 'react-native';

export default function PaymentCompletedScreen({
navigation,
route,
}) {



const documentUrl =
  `https://chalterho.com/assets/docs/${route?.params?.paymentId}`;

const downloadDocument = () => {
Linking.openURL(documentUrl);
};

return ( <View style={styles.container}> <View style={styles.card}>

    <Image
      source={{
        uri: 'https://chalterho.com/app-assets/img/complete.png',
      }}
      style={styles.image}
    />

    <Text style={styles.title}>
      Request Completed!
    </Text>

    <Text style={styles.message}>
      Your request has been successfully
      completed. You can now download your
      document by clicking the button below.
    </Text>

    <TouchableOpacity
      style={styles.downloadBtn}
      onPress={downloadDocument}>
      <Text style={styles.downloadText}>
        Download Document
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.homeBtn}
      onPress={() =>
        navigation.navigate('MainTabs')
      }>
      <Text style={styles.homeText}>
        Back To Home
      </Text>
    </TouchableOpacity>

  </View>
</View>

);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#f5f5f5',
justifyContent: 'center',
padding: 20,
},

card: {
backgroundColor: '#fff',
borderRadius: 15,
padding: 25,
alignItems: 'center',
elevation: 5,
},

image: {
width: 150,
height: 150,
resizeMode: 'contain',
},

title: {
marginTop: 20,
fontSize: 24,
fontWeight: '700',
color: 'green',
},

message: {
marginTop: 15,
textAlign: 'center',
fontSize: 16,
color: '#333',
lineHeight: 24,
},

downloadBtn: {
marginTop: 25,
backgroundColor: '#28a745',
paddingHorizontal: 25,
paddingVertical: 12,
borderRadius: 8,
},

downloadText: {
color: '#fff',
fontWeight: '700',
fontSize: 16,
},

homeBtn: {
marginTop: 15,
backgroundColor: '#ffc107',
paddingHorizontal: 25,
paddingVertical: 12,
borderRadius: 8,
},

homeText: {
color: '#000',
fontWeight: '700',
fontSize: 16,
},
});
