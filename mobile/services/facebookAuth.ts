import { Platform } from 'react-native';

let AccessToken: any;
let LoginManager: any;

if (Platform.OS !== 'web') {
    const fbsdk = require('react-native-fbsdk-next');
    AccessToken = fbsdk.AccessToken;
    LoginManager = fbsdk.LoginManager;
} else {
    AccessToken = {
        getCurrentAccessToken: async () => null,
    };
    LoginManager = {
        logInWithPermissions: async () => {
            throw new Error('Facebook Login nu este disponibil pe web.');
        },
    };
}

export { AccessToken, LoginManager };