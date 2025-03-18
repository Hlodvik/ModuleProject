import { auth, db } from "./main.js";
import { doc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, query, collection, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener("DOMContentLoaded", function () {
    const joinButton = document.getElementById("join");
    if (!joinButton) return;

    // Extract community subdomain from URL
    const pathSegments = window.location.pathname.split("/");
    const communitySubdomain = pathSegments[2];

    if (!communitySubdomain) {
        console.error("Community subdomain not found in URL.");
        return;
    }

    // get community data
    async function getCommunityData(subdomain) {
        const querySnapshot = await getDocs(query(collection(db, "communities"), where("subdomain", "==", subdomain)));
        if (querySnapshot.empty) {
            console.error("Community not found:", subdomain);
            return null;
        }
        return querySnapshot.docs[0]; // community document reference
    }

    onAuthStateChanged(auth, async (user) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const communityDoc = await getCommunityData(communitySubdomain);
        const communityRef = doc(db, "communities", communityDoc.id);
        const communityUID = communityDoc.id;

        setupJoinButton(userRef, communityRef, user.uid, communityUID, userData);
    });
});

async function setupJoinButton(userRef, communityRef, userId, communityUID, userData) {
    const joinContainer = document.getElementById("join-container"); // Wraps the join button/dropdown
    if (!joinContainer) return;

    // Clear previous content
    joinContainer.innerHTML = "";

    const isMember = userData.members?.includes(communityUID);

    if (!isMember) {
        // Standard "Join Community" button
        const joinButton = document.createElement("button");
        joinButton.textContent = "Join Community";
        joinButton.classList.add("custom-btn-orange");
        joinButton.onclick = async () => {
            try {
                await updateDoc(communityRef, { members: arrayUnion(userId) });
                await updateDoc(userRef, { members: arrayUnion(communityUID) });

                // Refresh UI after joining
                const updatedUserSnap = await getDoc(userRef);
                setupJoinButton(userRef, communityRef, userId, communityUID, updatedUserSnap.data());
            } catch (error) {
                console.error("Error joining community:", error);
            }
        };
        joinContainer.appendChild(joinButton);
    } else {
        // dropdown for "joined"
        joinContainer.innerHTML = `
            <div class="dropdown">
                <button class="custom-btn-dark dropdown-toggle" id="joinedDropdown" data-bs-toggle="dropdown">
                    Joined
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" role="button" id="favoriteCommunity"> Favorite</a></li>
                    <li><a class="dropdown-item text-danger" role="button" id="leaveCommunity"> Leave Community</a></li>
                </ul>
            </div>
        `;
 
        document.getElementById("leaveCommunity").onclick = async () => {
            try {
                await updateDoc(communityRef, { members: arrayRemove(userId) });
                await updateDoc(userRef, { members: arrayRemove(communityUID) });

                // Refresh UI after leaving
                const updatedUserSnap = await getDoc(userRef);
                setupJoinButton(userRef, communityRef, userId, communityUID, updatedUserSnap.data());
            } catch (error) {
                console.error("Error leaving community:", error);
            }
        };

        // Future implementation: Favorite Community
        document.getElementById("favoriteCommunity").onclick = () => {
            //favorite logic!
        };
    }
}