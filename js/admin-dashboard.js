import {  db, auth } from "./auth.js";
import { collection, addDoc, getDocs, getDoc, query, where, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Track current community being edited
let currentCommunityId = null;

// Ensure script runs after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {

    async function addCommunityToIndex(communityId, communityName) { //for searchbar functionality
        await setDoc(doc(db, "searchIndex", communityId), {
            name: communityName.toLowerCase(),
            type: "community",
            refId: communityId
        });
    }
    /** Function to upload an image and return its URL */
    async function uploadImageToImgur(file) {
        if (!file) return null;

        const clientId = "440423f8b6da4b0"; // Your Imgur Client ID
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("https://api.imgur.com/3/upload", {
                method: "POST",
                headers: {
                    Authorization: `Client-ID ${clientId}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                return data.data.link; // Return the direct image URL
            } else {
                console.error("Imgur upload failed:", data);
                return null;
            }
        } catch (error) {
            console.error("Error uploading to Imgur:", error);
            return null;
        }
    }
    /** Check if subdomain is unique */
    async function isSubdomainUnique(subdomain) {
        const q = query(collection(db, "communities"), where("subdomain", "==", subdomain));
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
                const communityImageUrl = imageFile ? await uploadImageToImgur(imageFile) : "";
                const communityBannerUrl = bannerFile ? await uploadImageToImgur(bannerFile) : "";
        
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
        
                const docRef = await addDoc(collection(db, "communities"), newCommunity);
        
                // Add new community to searchIndex
                await addCommunityToIndex(docRef.id, communityName);
        
                alert("Community created successfully.");
        
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

        const q = query(collection(db, "communities"), where("admins", "array-contains", user.uid));
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
            button.removeEventListener("click", loadEditForm); // Remove existing listeners
            button.addEventListener("click", (e) => {
                const communityId = e.target.getAttribute("data-id");
                if (communityId) {
                    console.log("Edit button clicked for:", communityId);
                    loadEditForm(communityId);
                } else {
                    console.error("Edit button missing data-id");
                }
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

        try {
            const docRef = doc(db, "communities", communityId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                console.error(`Community with ID ${communityId} not found.`);
                return;
            }

            const data = docSnap.data();

            // Get form elements
            const editNameInput = document.getElementById("editCommunityName");
            const editSubdomainInput = document.getElementById("editSubdomain");
            const editBioInput = document.getElementById("editCommunityBio");
            const editContainer = document.getElementById("editCommunityFormContainer");
            const communityList = document.getElementById("communityList");

            // Check if all necessary elements exist before modifying them
            if (!editNameInput || !editSubdomainInput || !editBioInput || !editContainer || !communityList) {
                console.error("One or more edit form elements are missing in the DOM.");
                return;
            }

            // Populate form fields
            editNameInput.value = data.name || "";
            editSubdomainInput.value = data.subdomain || "";
            editBioInput.value = data.bio || "";

            // Toggle visibility
            editContainer.classList.remove("d-none");
            communityList.classList.add("d-none");

            console.log(`Editing community: ${data.name} (${communityId})`);
        } catch (error) {
            console.error("Error loading community data for editing:", error);
        }
    }
    /** Handle updating community details */
    const editCommunityForm = document.getElementById("editCommunityForm");
    if (editCommunityForm) {
        editCommunityForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!currentCommunityId) {
                console.error("No community ID found for updating.");
                return;
            }

            const docRef = doc(db, "communities", currentCommunityId);
            const updatedData = {
                name: document.getElementById("editCommunityName")?.value.trim() || "",
                bio: document.getElementById("editCommunityBio")?.value.trim() || "",
            };

            try {
                // Check if image inputs exist before accessing them
                const imageInput = document.getElementById("editCommunityImage");
                const bannerInput = document.getElementById("editCommunityBanner");
                const newImageFile = imageInput?.files[0] || null;
                const newBannerFile = bannerInput?.files[0] || null;

                if (newImageFile) {
                    updatedData.imageUrl = await uploadImageToImgur(newImageFile);
                }
                if (newBannerFile) {
                    updatedData.bannerUrl = await uploadImageToImgur(newBannerFile);
                }

                await updateDoc(docRef, updatedData);
                alert("Community updated successfully.");

                // Hide edit form, show community list
                document.getElementById("editCommunityFormContainer")?.classList.add("d-none");
                document.getElementById("communityList")?.classList.remove("d-none");

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
            document.getElementById("editCommunityFormContainer")?.classList.add("d-none");
            document.getElementById("communityList")?.classList.remove("d-none");
        });
    }

    /** Ensure user is authenticated before loading communities */
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadUserCommunities();
        } else {
            console.log("User is not logged in.");
        }
    });
}); 