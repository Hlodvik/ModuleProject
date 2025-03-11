import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

 
//this was supplied to me to add when I created the project in firebase
const firebaseConfig = {
    apiKey: "AIzaSyBjx0embPKzNqLoxm8bMDFsgFRUs_QInVw",
    authDomain: "projectsignupapi.firebaseapp.com",
    projectId: "projectsignupapi",
    storageBucket: "projectsignupapi.appspot.com",
    messagingSenderId: "348958277147",
    appId: "1:348958277147:web:f9d54e7d0f5a2b1e4702be",
    measurementId: "G-G1PTB6MMNS"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Connect to Firebase Emulators for local testing
if (window.location.hostname === "localhost") {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
}


