import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
  

//this was supplied to me to add when I created the project in firebase
const firebaseConfig = {
    apiKey: "AIzaSyBjx0embPKzNqLoxm8bMDFsgFRUs_QInVw",
    authDomain: "projectsignupapi.firebaseapp.com",
    projectId: "projectsignupapi",
    messagingSenderId: "348958277147",
    appId: "1:348958277147:web:f9d54e7d0f5a2b1e4702be",
    measurementId: "G-G1PTB6MMNS"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
 

 
 