import {
    cert,
    getApps,
    initializeApp,
} from "firebase-admin/app";

import {
    getMessaging,
} from "firebase-admin/messaging";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
        "Firebase environment variables are missing."
    );
}

const firebaseApp =
    getApps().length > 0
        ? getApps()[0]
        : initializeApp({
              credential: cert({
                  projectId,
                  clientEmail,
                  privateKey: privateKey.replace(/\\n/g, "\n"),
              }),
          });

export const firebaseMessaging = getMessaging(firebaseApp);

export default firebaseApp;