 import { auth, db } from "./auth.js"
import { createUserWithEmailAndPassword, signInWithPopup, OAuthProvider, GoogleAuthProvider } from "firebase/auth"
import { collection, query, where, getDocs, doc, setDoc, getDoc, writeBatch } from "firebase/firestore"
 
 

    const signupForm = document.getElementById("signupForm");
    signupForm?.addEventListener("submit", handleSignup);

    async function handleSignup(event) {
        event.preventDefault();

        const email = document.getElementById("signupEmail");
        const displayName = document.getElementById("signupDisplayName");
        const username = document.getElementById("signupUsername");
        const password = document.getElementById("signupPassword");
        const confirmPassword = document.getElementById("confirmPassword");

        const emailError = document.getElementById("emailError");
        const displayNameError = document.getElementById("displayNameError");
        const usernameError = document.getElementById("usernameError");
        const passwordError = document.getElementById("passwordError");
        const confirmPasswordError = document.getElementById("confirmPasswordError");

        [emailError, displayNameError, usernameError, passwordError, confirmPasswordError].forEach(error => error.textContent = "");

        let valid = true;

        if (!email.value.trim()) {
            emailError.textContent = "Email is required.";
            valid = false;
        }
        if (!displayName.value.trim()) {
            displayNameError.textContent = "Display name is required.";
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

            await storeUserProfile(userId, displayName.value.trim(), username.value.trim(), email.value.trim());
            console.log("User successfully registered.");
            closeSignupModal();
        } catch (error) {
            console.error("Error during signup:", error);
            emailError.textContent = "Signup failed. Please try again.";
        }
    }

    async function storeUserProfile(userId, displayName, username, email) {
        const userRef = doc(db, "users", userId);
        const usernameRef = doc(db, "usernames", username);
        const searchIndexRef = doc(db, "searchIndex", userId);

        const userDoc = await getDoc(userRef);
        let userPostID = userDoc.exists() && userDoc.data().userPostID 
            ? userDoc.data().userPostID 
            : await generateUserPostID();

        const batch = writeBatch(db);
        batch.set(userRef, { displayName, username, email, userPostID }, { merge: true });
        batch.set(usernameRef, { uid: userId, username });
        batch.set(searchIndexRef, { name: displayName.toLowerCase(), type: "user", refId: userId });

        await batch.commit();
    }

    async function generateUserPostID() {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let postID;
        let isUnique = false;

        while (!isUnique) {
            postID = Array.from({ length: 5 }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
            const docRef = doc(db, "userPostIDs", postID);
            const docSnap = await getDoc(docRef);
            isUnique = !docSnap.exists();
        }

        await setDoc(doc(db, "userPostIDs", postID), { assigned: true });
        return postID;
    }

    async function signupGoogle(provider) {
        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;
            await storeUserProfile(user.uid, user.displayName || "Google User", user.email);
            closeSignupModal();
        } catch (error) {
            console.error("Google Signup Error:", error);
        }
    }

    async function signupApple(provider) {
        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;
            await storeUserProfile(user.uid, user.displayName || "Apple User", user.email);
            closeSignupModal();
        } catch (error) {
            console.error("Apple Signup Error:", error);
        }
    }

    function closeSignupModal() {
        const signupModal = document.getElementById("signupModal");
        if (signupModal) {
            const modalInstance = bootstrap.Modal.getInstance(signupModal) || new bootstrap.Modal(signupModal);
            modalInstance.hide();
        }
    }
 