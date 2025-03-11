import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, OAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import {auth} from "./auth.js";

const appleProvider = new OAuthProvider('apple.com');
const googleProvider = new GoogleAuthProvider();

onAuthStateChanged(auth, (user) => {//Index is only viewable if you are not logged in. in case you are logged in already and open up the root page, be redirected to home
    if (user) {
        const currentPage = window.location.pathname;
        console.log("Logged in as UID:", user.uid);
        if (currentPage === "/index.html" || currentPage === "/") {
            window.location.href = "/html/home.html";
        }
    }
});

async function login() {
    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;
    //on succesful login, be redirected to home page
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {//give the function something to do if failure
        console.error("Login failed:", error.message);
        alert("Invalid email or password.");
    }
}

async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log("User signed in:", result.user);
        // Redirect or handle post-login logic
    } catch (error) {
        console.error("Google login failed:", error.message);
    }
}


async function loginWithApple() {
    try {
        const result = await signInWithPopup(auth, appleProvider);
        console.log("User signed in:", result.user);
        // Redirect or handle post-login logic
    } catch (error) {
        console.error("Apple login failed:", error.message);
    }
}

function logout() {
    signOut(auth).then(() => {  
        window.location.href = "/index.html";
    }).catch((error) => {
        alert("Error logging out: " + error.message);
    });
}


document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("#loginButton")?.addEventListener("click", login);
    document.querySelector("#googleLoginButton")?.addEventListener("click", loginWithGoogle);
    document.querySelector("#appleLoginButton")?.addEventListener("click", loginWithApple);
    document.querySelector("#logoutButton")?.addEventListener("click", logout);
});




 
