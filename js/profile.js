import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./auth.js";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

// Check if we are on a user profile URL or the logged-in user's profile
document.addEventListener("DOMContentLoaded", async () => {
    const pathSegments = window.location.pathname.split("/");
    const lastSegment = pathSegments[pathSegments.length - 1];

    if (lastSegment.startsWith("u/")) {
        // Viewing another user's profile
        const username = lastSegment.replace("u/", "");
        await loadUserProfile(username);
    } else {
        // Viewing own profile
        onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                updateProfileUI(userDoc.data());
            }
        });
    }
});

async function loadUserProfile(username) {
    if (!username) {
        console.error("No username found in URL.");
        return;
    }

    try {
        // Query Firestore for the user document with this username
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error("User not found");
            document.getElementById("username").textContent = "User not found";
            return;
        }

        // Get the first matching user document
        const userData = querySnapshot.docs[0].data();
        updateProfileUI(userData);
    } catch (error) {
        console.error("Error loading user profile:", error);
    }
}

// Update the profile UI with user data
function updateProfileUI(userData) {
    document.getElementById("username").textContent = userData.username || "Anonymous";
    document.getElementById("userBio").textContent = userData.bio || "No bio available";
    document.getElementById("userLocation").textContent = userData.location || "Location not provided";
    document.getElementById("userPronouns").textContent = userData.pronouns || "";

    setProfileLink("linkedin", userData.linkedin);
    setProfileLink("github", userData.github);
    setProfileLink("instagram", userData.instagram);
    setProfileLink("x", userData.x);

    // Profile picture
    const profilePic = userData.profilePic || "../assets/default-picture.png";
    document.querySelectorAll("#profilePic").forEach(img => img.src = profilePic);
}

// Utility function for setting profile links
function setProfileLink(id, url) {
    const element = document.getElementById(id);
    if (element) {
        if (url) {
            element.href = url;
            element.textContent = url; // Show full URL next to the icon
            element.classList.remove("d-none");
        } else {
            element.parentElement.classList.add("d-none"); // Hide if no link
        }
    }
}