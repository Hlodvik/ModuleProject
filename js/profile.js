 
import { auth, db } from "./auth.js";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

document.addEventListener("DOMContentLoaded", async () => {
    if (!window.location.pathname.startsWith("/u/")) return;
    const pathSegments = window.location.pathname.split("/");
    const username = pathSegments[2]; // Extract "testuser" from /u/testuser
    const profilePic = document.getElementById("profilePic");
    
    if (!username) {
        console.error("No username found in the URL.");
        return;
    }

    // Check if profile picture is cached
    const cachedProfilePic = localStorage.getItem(`profilePic_${username}`);
    if (profilePic && cachedProfilePic) {
        profilePic.src = cachedProfilePic; // Load cached profile picture immediately
    }

    try {
        // Query Firestore to find user by username
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.error("User not found.");
            document.getElementById("username").textContent = "User not found";
            return;
        }

        // Get user data and update UI
        const userData = querySnapshot.docs[0].data();
        updateProfileUI(userData);
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
});

// Update the profile UI with user data
function updateProfileUI(userData) {
    document.getElementById("username").textContent = userData.username || "Anonymous";
    document.getElementById("userBio").textContent = userData.bio || "No bio available";
    document.getElementById("userLocation").textContent = userData.location || "Location not provided";
    document.getElementById("userPronouns").textContent = userData.pronouns || "";

    setProfileLink("linkedin", userData.linkedin);
    setProfileLink("github", userData.github);
    setProfileLink("instagram", userData.instagram);
    setProfileLink("x", userData.twitter);

    // Profile picture caching
    const profilePic = userData.profilePic || "../assets/default-picture.png";
    document.getElementById("profilePic").src = profilePic;
    localStorage.setItem(`profilePic_${userData.username}`, profilePic); // Cache profile pic
}

// Utility function for setting profile links
function setProfileLink(id, url) {
    const element = document.getElementById(id);
    if (element) {
        if (url) {
            element.href = url;
            element.textContent = url;
            element.classList.remove("d-none");
        } else if (element.parentElement) {
            element.parentElement.classList.add("d-none");
        }
    }
}

