import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./main.js";

document.addEventListener("DOMContentLoaded", async function () {
    const profilePicElem = document.getElementById("profilePic");  
    if (!profilePicElem) return;

    const pathSegments = window.location.pathname.split("/");
    const username = pathSegments[2]; // Assumes format: /u/{username}
    
    if (!username) {
        console.warn("No username found in URL.");
        return;
    } 

    try {
        // Query Firestore to get UID from username
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.warn("User not found:", username);
            return;
        }

        // Get user document data
        const userData = querySnapshot.docs[0].data();

        // Default profile picture
        const defaultPic = "/images/default-picture.png"; 

        // Set the profile picture or fallback to the default
        profilePicElem.src = userData.profilePic || defaultPic; 

    } catch (error) {
        console.error("Error loading profile picture:", error);
    }
});