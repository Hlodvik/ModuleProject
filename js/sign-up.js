import { auth, db } from "./auth.js"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { collection, query, where, getDocs, doc, setDoc, getDoc, writeBatch } from "firebase/firestore"
import * as bootstrap from "bootstrap";
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
} else {
    console.error("Signup form not found in the DOM.");
}
 
async function handleSignup(event) {
    event.preventDefault();

    const email = document.getElementById("signupEmail"); 
    const username = document.getElementById("signupUsername");
    const password = document.getElementById("signupPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const emailError = document.getElementById("emailError"); 
    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");
    [emailError, usernameError, passwordError, confirmPasswordError].forEach(error => error.textContent = "");

    let valid = true;

    if (!email.value.trim()) {
        emailError.textContent = "Email is required.";
        valid = false;
    }
    if (!username.value.trim()) {
        usernameError.textContent = "Username is required.";
        valid = false;
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username.value.trim())) {
        usernameError.textContent = "Username can only contain letters, numbers, dashes (-), and underscores (_).";
        valid = false;
    }
    if (!password.value) {
        passwordError.textContent = "Password is required.";
        valid = false;
    }
    if (!confirmPassword.value) {
        confirmPasswordError.textContent = "Please confirm your password.";
        valid = false;
    }
    if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
        confirmPasswordError.textContent = "Passwords do not match.";
        valid = false;
    }
    if (!valid) return;
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username.value.trim()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            usernameError.textContent = "Username is already taken.";
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email.value.trim(), password.value);
        const userId = userCredential.user.uid;
        await storeUserProfile(userId, username.value.trim(), email.value.trim());
        console.log("User successfully registered.");
        closeSignupModal();
        await loginUser(email.value.trim(), password.value);
        // redirect to signup
        window.location.href = "/html/setup-profile.html";
    } catch (error) {
        console.error("Error during signup:", error);
        emailError.textContent = "Signup failed. Please try again.";
    }
}
async function storeUserProfile(userId, username, email) {
    if (!username) {
        username = `user_${userId.substring(0, 5)}`; // Generate a default username
    }
    const userRef = doc(db, "users", userId);
    const usernameRef = doc(db, "usernames", username);
    const searchIndexRef = doc(db, "searchIndex", userId);
    const userDoc = await getDoc(userRef);
    let userPostID = userDoc.exists() && userDoc.data().userPostID
        ? userDoc.data().userPostID
        : await generateUserPostID();
    const batch = writeBatch(db);
    batch.set(userRef, { username, email, userPostID }, { merge: true });
    batch.set(usernameRef, { uid: userId, username }); 
    await batch.commit();
}
async function generateUserPostID() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let postID, docSnap;

    do {
        postID = Array.from({ length: 5 }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
        docSnap = await getDoc(doc(db, "userPostIDs", postID));
    } while (docSnap.exists()); // repeat if the id is already taken

    // if unique, save it in firestore before returning it
    await setDoc(doc(db, "userPostIDs", postID), { assigned: true });

    return postID;
}
function closeSignupModal() {
    const signupModal = document.getElementById("signupModal");
    if (signupModal) {
        const modalInstance = bootstrap.Modal.getInstance(signupModal) || new bootstrap.Modal(signupModal);
        modalInstance.hide();
    }
}
async function loginUser(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in successfully.");
    } catch (error) {
        console.error("Login failed:", error);
    }
}