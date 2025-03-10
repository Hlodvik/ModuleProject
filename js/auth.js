import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, OAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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

const firebaseApp = initializeApp(firebaseConfig);//init
export const auth = getAuth(firebaseApp);//exports
export const db = getFirestore(firebaseApp);  







