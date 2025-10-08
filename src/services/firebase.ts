import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
// Note: These should be environment variables in production
const firebaseConfig = {
  apiKey: "AIzaSyBTkUMeJkDRRZ-PmAgBZHWWUkFBqk9-sn8",
  authDomain: "learning-models-hub.firebaseapp.com",
  projectId: "learning-models-hub",
  storageBucket: "learning-models-hub.firebasestorage.app",
  messagingSenderId: "502571504865",
  appId: "1:502571504865:web:f44545a11dbc718b35d3a0",
  measurementId: "G-FLJ8CPWZ1J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
