import { storage, db, auth } from "./auth.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, getDoc, query, where, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Track current community being edited
let currentCommunityId = null;
if (document.readyState === "loading") {
// Ensure script runs after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {

/** Function to upload an image and return its URL */
async function uploadImage(file, path) {
    if (!file) return null;

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
}

/** Check if subdomain is unique */
async function isSubdomainUnique(subdomain) {
    const q = query(collection(db, "community"), where("subdomain", "==", subdomain));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // True if subdomain is unique
}

/** Handle creating a new community */
const createCommunityForm = document.getElementById("createCommunityForm");
if (createCommunityForm) {
    createCommunityForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Create Community Form Submitted");

        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to create a community.");
            return;
        }

        const communityName = document.getElementById("communityName").value.trim();
        const subdomain = document.getElementById("subdomain").value.trim();
        const bio = document.getElementById("communityBio").value.trim();
        const imageFile = document.getElementById("communityImage").files[0];
        const bannerFile = document.getElementById("communityBanner").files[0];

        // Validate subdomain
        const subdomainRegex = /^[a-zA-Z0-9_-]+$/;
        if (!subdomainRegex.test(subdomain)) {
            alert("Subdomain can only contain letters, numbers, underscores, and hyphens.");
            return;
        }

        if (!(await isSubdomainUnique(subdomain))) {
            alert("This subdomain is already taken. Please choose another.");
            return;
        }

        try {
            // Upload images if available
            const timestamp = Date.now();
            const communityImageUrl = imageFile ? await uploadImage(imageFile, `communityImages/${subdomain}-${timestamp}.png`) : "";
            const communityBannerUrl = bannerFile ? await uploadImage(bannerFile, `communityBanners/${subdomain}-${timestamp}.png`) : "";

            // Store new community in Firestore
            const newCommunity = {
                name: communityName,
                subdomain,
                bio,
                createdBy: user.uid,
                admins: [user.uid],
                members: [user.uid],
                imageUrl: communityImageUrl,
                bannerUrl: communityBannerUrl,
            };

            await addDoc(collection(db, "community"), newCommunity);
            alert("Community created successfully.");

            // Reset form and reload communities
            createCommunityForm.reset();
            loadUserCommunities();
            bootstrap.Modal.getInstance(document.getElementById("createCommunityModal")).hide();
        } catch (error) {
            console.error("Error creating community:", error);
            alert("Failed to create community. Please try again.");
        }
    });
}

/** Load communities the user is an admin of */
async function loadUserCommunities() {
    const user = auth.currentUser;
    if (!user) return;

    const communityList = document.getElementById("communityList");
    if (!communityList) return;

    communityList.innerHTML = "";

    const q = query(collection(db, "community"), where("admins", "array-contains", user.uid));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const div = document.createElement("div");
        div.classList.add("d-flex", "justify-content-between", "align-items-center", "p-2", "border", "rounded", "mb-2");

        div.innerHTML = `
            <span class="text-white">${data.name} (${data.subdomain})</span>
            <button class="btn btn-sm btn-outline-light edit-community" data-id="${doc.id}">Edit</button>
        `;

        communityList.appendChild(div);
    });

    document.querySelectorAll(".edit-community").forEach(button => {
        button.addEventListener("click", (e) => {
            const communityId = e.target.getAttribute("data-id");
            loadEditForm(communityId);
        });
    });
}

/** Load community data into the edit form */
async function loadEditForm(communityId) {
    if (!communityId) {
        console.error("No community ID provided for editing.");
        return;
    }
    currentCommunityId = communityId;

    const docRef = doc(db, "community", communityId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById("editCommunityName").value = data.name;
        document.getElementById("editSubdomain").value = data.subdomain;
        document.getElementById("editCommunityBio").value = data.bio;

        document.getElementById("editCommunityFormContainer").classList.remove("d-none");
        document.getElementById("communityList").classList.add("d-none");
    }
}

/** Handle updating community details */
const editCommunityForm = document.getElementById("editCommunityForm");
if (editCommunityForm) {
    editCommunityForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentCommunityId) return;

        const docRef = doc(db, "community", currentCommunityId);
        const updatedData = {
            name: document.getElementById("editCommunityName").value,
            bio: document.getElementById("editCommunityBio").value,
        };

        try {
            const newImageFile = document.getElementById("editCommunityImage").files[0];
            const newBannerFile = document.getElementById("editCommunityBanner").files[0];

            if (newImageFile) {
                const timestamp = Date.now();
                updatedData.imageUrl = await uploadImage(newImageFile, `communityImages/${currentCommunityId}-${timestamp}.png`);
            }
            if (newBannerFile) {
                const timestamp = Date.now();
                updatedData.bannerUrl = await uploadImage(newBannerFile, `communityBanners/${currentCommunityId}-${timestamp}.png`);
            }

            await updateDoc(docRef, updatedData);
            alert("Community updated successfully.");

            document.getElementById("editCommunityFormContainer").classList.add("d-none");
            document.getElementById("communityList").classList.remove("d-none");

            loadUserCommunities();
        } catch (error) {
            console.error("Error updating community:", error);
            alert("Failed to update community. Please try again.");
        }
    });
}

/** Handle back button in edit form */
const backToListBtn = document.getElementById("backToList");
if (backToListBtn) {
    backToListBtn.addEventListener("click", () => {
        document.getElementById("editCommunityFormContainer").classList.add("d-none");
        document.getElementById("communityList").classList.remove("d-none");
    });
}

/** Ensure user is authenticated before loading communities */
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadUserCommunities();
    } else {
        console.log("User is not logged in");
    }
});
});}
