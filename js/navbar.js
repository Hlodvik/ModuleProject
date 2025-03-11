import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    
    if (!searchInput || !searchResults) {
        return;
    }
    

    async function searchIndex(searchTerm) {
        const searchRef = collection(db, "searchIndex");
        const q = query(
            searchRef,
            where("name", ">=", searchTerm),
            where("name", "<=", searchTerm + "\uf8ff")
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.data().refId,
            name: doc.data().name,
            type: doc.data().type
        }));
    }

    searchInput.addEventListener("input", async () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm.length < 2) {
            searchResults.innerHTML = "";
            searchResults.classList.remove("show");
            return;
        }

        const results = await searchIndex(searchTerm);
        displaySearchResults(results);
    });

    function displaySearchResults(results) {
        searchResults.innerHTML = "";
        searchResults.classList.add("show");

        if (results.length === 0) {
            searchResults.innerHTML = `<a class="dropdown-item text-white">No results found</a>`;
            return;
        }

        results.forEach(item => {
            const resultItem = document.createElement("a");
            resultItem.classList.add("dropdown-item", "text-white");
            resultItem.textContent = item.type === "user" ? `User: ${item.name}` : `Community: ${item.name}`;
            resultItem.href = item.type === "user" ? `/u/${item.name}` : `/co/${item.id}`;
            searchResults.appendChild(resultItem);
        });
    }


    const profilePic = document.getElementById("profilePic");
    const cachedProfilePic = localStorage.getItem("profilePic");

    if (profilePic && cachedProfilePic) {
        profilePic.src = cachedProfilePic; // Load from cache instantly
    }
});


onAuthStateChanged(auth, async (user) => {
    const profilePic = document.getElementById("profilePic");
    if (!profilePic) return;

    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const profilePicUrl = userData.profilePic ? userData.profilePic : "../assets/default-picture.png";

            profilePic.src = profilePicUrl;
            localStorage.setItem("profilePic", profilePicUrl); // Store in cache
        }
    } else {
        profilePic.src = "../assets/default-picture.png";
    }
});