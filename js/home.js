import { auth } from "./auth.js";
import { fetchHomeFeed } from "./feed.js";
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener("DOMContentLoaded", function () { 
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await fetchHomeFeed(user.uid); // Pass the UID when auth is ready
        } else {
            console.error("No user signed in.");
        }
    });
});