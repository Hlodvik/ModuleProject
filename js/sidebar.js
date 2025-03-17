import { auth, db } from "./auth.js";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, async (user) => {
    if (!user) return; // No user is signed in

    const userId = user.uid;
    const userRef = doc(db, "users", userId);

    try {
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            console.warn("User document not found.");
            return;
        }

        // Get community IDs from the `members` array in the user document
        const userData = userDoc.data();
        const userCommunities = userData.members || []; // Array of community IDs

        if (userCommunities.length === 0) return;

        // Fetch all community details
        const communitiesRef = collection(db, "communities");
        const communityQuery = query(communitiesRef, where("__name__", "in", userCommunities));
        const communitySnapshot = await getDocs(communityQuery);

        const communityList = document.getElementById("userCommunities");
        if (!communityList) return;

        communityList.innerHTML = ""; // Clear existing content

        const communities = [];
        communitySnapshot.forEach((doc) => {
            const communityData = doc.data();
            communities.push({
                id: doc.id,
                name: communityData.name,
            });
        });

        // Sort alphabetically (optional)
        communities.sort((a, b) => a.name.localeCompare(b.name));

        // Render initial list
        renderCommunityList(communities, false);

        // Add "Show More / Show Less" button if more than 3 communities
        if (communities.length > 3) {
            const toggleButton = document.createElement("button");
            toggleButton.classList.add("btn", "btn-outline-secondary", "mt-2", "w-100");
            toggleButton.textContent = "Show More";
            let expanded = false;

            toggleButton.addEventListener("click", () => {
                expanded = !expanded;
                renderCommunityList(communities, expanded);
                toggleButton.textContent = expanded ? "Show Less" : "Show More";
            });

            communityList.appendChild(toggleButton);
        }

    } catch (error) {
        console.error("Error loading user communities:", error);
    }
});

function renderCommunityList(communities, showAll) {
    const communityList = document.getElementById("userCommunities");
    if (!communityList) return;

    communityList.innerHTML = ""; // Clear list before rendering

    const visibleCommunities = showAll ? communities : communities.slice(0, 3);
    visibleCommunities.forEach((community) => {
        const listItem = document.createElement("li");
        listItem.classList.add("nav-item");

        const link = document.createElement("a");
        link.classList.add("nav-link", "text-white");
        link.href = `/co/${community.id}`;
        link.innerHTML = `<i class="bi bi-people me-2"></i> ${community.name}`;

        listItem.appendChild(link);
        communityList.appendChild(listItem);
    });
}