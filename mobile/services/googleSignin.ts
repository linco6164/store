
import { Platform } from 'react-native';

let GoogleSignin: any;

if (Platform.OS !== 'web') {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
    GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: false,
    });
} else {
    GoogleSignin = {
        hasPlayServices: async () => true,
        signIn: async () => {
            throw new Error('GoogleSignin nu este disponibil pe web.');
        },
    };
}

export { GoogleSignin };