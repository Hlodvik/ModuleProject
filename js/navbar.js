import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { auth, db } from "./auth.js";  

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("userSearchInput");
    const searchResults = document.getElementById("searchResults");

    searchInput.addEventListener("input", async () => {
        const searchTerm = searchInput.value.trim();

        if (searchTerm.length < 1) {
            searchResults.innerHTML = "";
            searchResults.classList.remove("show");
            return;
        }

        try {
            // Query Firestore for users whose username starts with the search term
            const usersRef = collection(db, "users");
            const q = query(usersRef, orderBy("username"), startAt(searchTerm), endAt(searchTerm + "\uf8ff"));
            const querySnapshot = await getDocs(q);

            searchResults.innerHTML = ""; // Clear previous results

            if (querySnapshot.empty) {
                searchResults.innerHTML = `<div class="dropdown-item text-white">No users found</div>`;
            } else {
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    const userItem = document.createElement("a");
                    userItem.href = `/u/${userData.username}`;
                    userItem.classList.add("dropdown-item", "text-white");
                    userItem.textContent = userData.username;
                    searchResults.appendChild(userItem);
                });
            }

            searchResults.classList.add("show");
        } catch (error) {
            console.error("Error searching users:", error);
        }
    });
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const profileImage = document.querySelector("#userMenu img");
    
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.profilePic) {
                profileImage.src = userData.profilePic; // use users profile pic
            } else {
                profileImage.src = "../assets/default-picture.png"; // use default if none
            }
        }
    }
});

 
