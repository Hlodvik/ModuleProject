import { auth, db, storage } from "./main.js";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { fetchUserFeed } from "./feed.js";
import { renderFeed } from "./render-feed.js";

document.addEventListener("DOMContentLoaded", async function () {
    // Extract the username from the URL (assuming format: /u/{username})
    const urlParts = window.location.pathname.split("/");
    const username = urlParts[urlParts.indexOf("u") + 1];

    if (!username) return;

    try {
        // Query firestore for user doc
        const usersRef = collection(db, "users");
        const userQuery = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) return;

        // eh, whatsup, doc?
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // update the profile UI
        await updateProfileUI(userData);

        await fetchUserFeed(userDoc.id);
 

    } catch (error) {
        console.error("Error fetching user data:", error);
    }
});

// Update profile UI with user data
async function updateProfileUI(userData) {
    updateElement("username", userData.username);
    updateElement("userBio", userData.bio);
    updateElement("userLocation", userData.location);
    updateElement("userPronouns", userData.pronouns);
    setSocialLinks("linkedin", userData.linkedin);
    setSocialLinks("github", userData.github);
    setSocialLinks("instagram", userData.instagram);
    setSocialLinks("twitter", userData.twitter);
}

// Utility function to update text content
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element && value) {
        element.textContent = value;
    }
}

// Utility function for setting social links
function setSocialLinks(id, url) {
    const element = document.getElementById(id);
    if (element && url) {
        element.href = url;
        element.textContent = url;
        element.classList.remove("d-none");
    }
}