import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().find((a) => a.name === "[DEFAULT]") ?? initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// Secondary app — used to create new Firebase Auth users without signing out the current admin
const secondary = getApps().find((a) => a.name === "secondary") ?? initializeApp(firebaseConfig, "secondary");
export const secondaryAuth = getAuth(secondary);

// Public app — used for phone OTP on the public donation form (isolated from admin auth)
const publicApp = getApps().find((a) => a.name === "public") ?? initializeApp(firebaseConfig, "public");
export const publicAuth = getAuth(publicApp);
