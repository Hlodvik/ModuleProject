import {createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import {auth} from "./auth.js";
//all of the signing up functions that are used only in index.html


//async because that is what the web said to do for functions that have to do  with crud functions that work with the db
async function signup() {
    let email = document.getElementById("signupEmail").value;
    let password = document.getElementById("signupPassword").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    //make sure to get all the data required
    if (!email || !password || !confirmPassword) {
        alert("Please fill out all fields.");
        return;
    }
    //make sure passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }
    //this was supplied to me by firebase
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert(`Sign-up successful! Welcome, ${userCredential.user.email}`);
        document.getElementById("signupForm").reset();
        new bootstrap.Modal(document.getElementById('signupModal')).hide();
    } catch (error) {
        alert(error.message);
    }
}
//both this and the apple signup where also provided by firebase
async function signupGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const userCredential = await signInWithPopup(auth, provider);
        alert(`Signed up as ${userCredential.user.displayName}`);
        new bootstrap.Modal(document.getElementById('signupModal')).hide();
    } catch (error) {
        alert(error.message);
    }
}

async function signupApple() {
    const provider = new OAuthProvider('apple.com');
    try {
        const userCredential = await signInWithPopup(auth, provider);
        alert(`Signed up as ${userCredential.user.displayName}`);
        new bootstrap.Modal(document.getElementById('signupModal')).hide();
    } catch (error) {
        alert(error.message);
    }
}


document.addEventListener("DOMContentLoaded", function () {
    // Signup Buttons
    document.querySelector("#signupButton")?.addEventListener("click", signup);
    document.querySelector("#googleSignupButton")?.addEventListener("click", signupWithGoogle);
    document.querySelector("#appleSignupButton")?.addEventListener("click", signupWithApple);
});