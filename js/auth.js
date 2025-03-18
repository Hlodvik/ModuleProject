import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
  
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjx0embPKzNqLoxm8bMDFsgFRUs_QInVw",
  authDomain: "projectsignupapi.firebaseapp.com",
  projectId: "projectsignupapi",
  storageBucket: "projectsignupapi.firebasestorage.app",
  messagingSenderId: "348958277147",
  appId: "1:348958277147:web:f9d54e7d0f5a2b1e4702be",
  measurementId: "G-G1PTB6MMNS"
}; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);
 
setPersistence(auth, browserLocalPersistence)
window.auth = auth;
