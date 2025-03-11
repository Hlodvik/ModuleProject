import {createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import {auth} from "./auth.js";
//all of the signing up functions that are used only in index.html

if (document.readyState === "loading") {

    async function addUserToIndex(userId, username) {
        await setDoc(doc(db, "searchIndex", userId), {
            name: username.toLowerCase(),
            type: "user",
            refId: userId
        });
    }
//async because that is what the web said to do for functions that have to do  with crud functions that work with the db
async function signup() {
    let email = document.getElementById("signupEmail").value;
    let username = document.getElementById("signupUsername").value.trim(); // Get username from input
    let password = document.getElementById("signupPassword").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    if (!email || !username || !password || !confirmPassword) {
        alert("Please fill out all fields.");
        return;
    }
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        // Store user data in Firestore
        await setDoc(doc(db, "users", userId), {
            username: username,
            email: email
        });

        // Add to searchIndex for search functionality
        await addUserToIndex(userId, username);

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
    document.querySelector("#googleSignupButton")?.addEventListener("click", signupGoogle);
    document.querySelector("#appleSignupButton")?.addEventListener("click", signupApple);
});}