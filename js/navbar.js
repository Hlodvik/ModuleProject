import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db} from "./auth.js";
import { logout } from "./log-state.js";
import { loadPic } from "./load-user-pic.js";
document.addEventListener("DOMContentLoaded", async () => {
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const profileBtn = document.getElementById("profileBtn");
    const homeBtn = document.getElementById("homeBtn");
    const settingsBtn = document.getElementById("settingsBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            window.location.href = "/html/home.html";
        });
    }

    if (profileBtn) {
        profileBtn.addEventListener("click", async () => {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const username = userDoc.data().username;
                    window.location.href = `/u/${username}`;
                }
            }
        });
    }

    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {window.location.href = "/html/settings.html";});
    }

    if (searchInput) {
        searchInput.setAttribute("autocomplete", "new-password");
        searchInput.setAttribute("autocorrect", "off");
        searchInput.setAttribute("spellcheck", "false");
    }

    if (!searchInput || !searchResults) return;

    async function searchIndex(searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const usersRef = collection(db, "users");
        const communitiesRef = collection(db, "communities");
    
        const usersSnapshot = await getDocs(usersRef);
        const userResults = usersSnapshot.docs
            .map(doc => doc.data())
            .filter(user => {
                const username = user.username?.toLowerCase() || "";
                const displayName = user.displayName?.toLowerCase() || "";
                return username.includes(lowerSearchTerm) || displayName.includes(lowerSearchTerm);
            })
            .map(user => ({
                id: user.username,
                name: `${user.displayName} (@${user.username})`,
                type: "user"
            }));
    
        const communitiesSnapshot = await getDocs(communitiesRef);
        const communityResults = communitiesSnapshot.docs
            .map(doc => {
                const communityData = doc.data();
                return {
                    name: communityData.name, // Preserve case-sensitive display
                    refId: doc.id, // Correctly assign refId
                    type: "community"
                };
            })
            .filter(community => community.name.toLowerCase().includes(lowerSearchTerm)); // Apply filtering **after** mapping
    
        return [...userResults, ...communityResults];
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
            console.log("Search Result Item:", item); // Debug log

            const resultItem = document.createElement("a");
            resultItem.classList.add("dropdown-item", "text-white");
            resultItem.textContent = item.name;

            if (item.type === "user") {
                resultItem.href = `/u/${item.id}`;
            } else if (item.type === "community") {
                resultItem.href = `/co/${item.refId}`;
            }

            console.log("Final Link:", resultItem.href); // Debug log to check href
            searchResults.appendChild(resultItem);
        });
    }

    // Close search results when clicking outside
    document.addEventListener("click", (event) => {
        if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.classList.remove("show");
        }
    });
 

    // Auth State Handling
    onAuthStateChanged(auth, async (user) => {
        if (!user) {return;}
   
        const navPic = document.getElementById("navPic");
        if (navPic) await loadPic(user.uid, navPic);

        // Fetch user details
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (profileBtn) profileBtn.href = `/u/${userData.username}`;
            if (logoutBtn) {
                logoutBtn.removeEventListener("click", logout);
                logoutBtn.addEventListener("click", logout);
            }
        }
    });
});
 