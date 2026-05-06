// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDfzxF8oNKZXfBrb1egGxtnqFZfrmf6VJ0",
  authDomain: "nusaweather-7a05f.firebaseapp.com",
  projectId: "nusaweather-7a05f",
  storageBucket: "nusaweather-7a05f.firebasestorage.app",
  messagingSenderId: "377571025989",
  appId: "1:377571025989:web:f96858b3cebdf2bbbdaf2c",
  measurementId: "G-42WPNZ1FJP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;