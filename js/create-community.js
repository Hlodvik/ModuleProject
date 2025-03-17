import { auth, db, storage } from "./main.js";
import { collection, setDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Compressor from "compressorjs";

 

/** Function to generate a unique 3-character communityPostID */
async function generateUniqueCommunityPostID() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let postID;
    let isUnique = false;

    while (!isUnique) {
        postID = Array.from({ length: 3 }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
        const docRef = doc(db, "communities", postID);
        const docSnap = await getDoc(docRef);
        isUnique = !docSnap.exists(); // If the document doesn't exist, it's unique
    }
    return postID;
}

/** Function to compress and upload images */
async function compressAndUploadImage(file, path) {
    return new Promise((resolve, reject) => {
        new Compressor(file, {
            quality: 0.6, // Adjust compression quality (0 to 1)
            maxWidth: 500, // Resize to fit within 500px width
            maxHeight: 500, // Resize to fit within 500px height
            success(result) {
                const storageRef = ref(storage, path);
                uploadBytes(storageRef, result)
                    .then(async (snapshot) => {
                        const downloadURL = await getDownloadURL(snapshot.ref);
                        resolve(downloadURL);
                    })
                    .catch(reject);
            },
            error(err) {
                reject(err);
            }
        });
    });
}

/** Function to upload banner image without compression */
async function uploadBannerImage(file, path) {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        uploadBytes(storageRef, file)
            .then(async (snapshot) => {
                const downloadURL = await getDownloadURL(snapshot.ref);
                resolve(downloadURL);
            })
            .catch(reject);
    });
}

/** Function to add community to search index */
async function addCommunityToIndex(communityId, communityName) {
    try {
        await setDoc(doc(db, "searchIndex", communityId), {
            name: communityName.toLowerCase(),
            type: "community",
            refId: communityId
        });
    } catch (error) {
        console.error("Error adding community to index:", error);
    }
}

/** Check if subdomain is unique */
async function isSubdomainUnique(subdomain) {
    const docRef = doc(db, "communities", subdomain);
    const docSnap = await getDoc(docRef);
    return !docSnap.exists(); // True if unique
}

/** Handle creating a new community */
document.addEventListener("DOMContentLoaded", () => {
    const createCommunityForm = document.getElementById("createCommunityForm");
    const createCommunityBtn = document.getElementById("createCommunityBtn");
    const communityPicInput = document.getElementById("communityPicInput");
    const communityBannerInput = document.getElementById("communityBannerInput");

    if (createCommunityForm && createCommunityBtn) {
        createCommunityBtn.addEventListener("click", async (e) => {
            e.preventDefault(); // Prevent default form submission

            const user = auth.currentUser;
            if (!user) {
                alert("You must be logged in to create a community.");
                return;
            }

            const communityName = document.getElementById("communityName").value.trim();
            const subdomain = document.getElementById("subdomain").value.trim().toLowerCase();
            const bio = document.getElementById("communityBio").value.trim();

            // Validate input fields
            if (!communityName || !subdomain || !bio) {
                alert("Please fill out all required fields.");
                return;
            }

            // Validate subdomain format
            if (!/^[a-zA-Z0-9_-]+$/.test(subdomain)) {
                alert("Subdomain can only contain letters, numbers, underscores, and hyphens.");
                return;
            }
            if (subdomain.length > 50) {
                alert("Subdomain must be 50 characters or fewer.");
                return;
            }

            if (!(await isSubdomainUnique(subdomain))) {
                alert("This subdomain is already taken. Please choose another.");
                return;
            }

            try {
                // Disable button & show loading state
                createCommunityBtn.disabled = true;
                createCommunityBtn.textContent = "Creating...";

                // Generate unique communityPostID
                const communityPostID = await generateUniqueCommunityPostID();

                // Upload images if provided
                let communityPicUrl = "";
                let communityBannerUrl = "";

                if (communityPicInput.files.length > 0) {
                    communityPicUrl = await compressAndUploadImage(
                        communityPicInput.files[0], 
                        `community_pics/${subdomain}_profile.jpg`
                    );
                }

                if (communityBannerInput.files.length > 0) {
                    communityBannerUrl = await uploadBannerImage(
                        communityBannerInput.files[0], 
                        `community_pics/${subdomain}_banner.jpg`
                    );
                }

                // Store new community in Firestore (using subdomain as ID)
                const newCommunity = {
                    name: communityName,
                    subdomain,
                    bio,
                    createdBy: user.uid,
                    admins: [user.uid],
                    members: [user.uid],
                    communityPostID, // Store unique communityPostID
                    communityPic: communityPicUrl,  // Store image URL
                    banner: communityBannerUrl  // Store image URL
                };

                await setDoc(doc(db, "communities", subdomain), newCommunity);

                // Add new community to searchIndex
                await addCommunityToIndex(subdomain, communityName);

                alert("Community created successfully.");
                createCommunityForm.reset();
                bootstrap.Modal.getInstance(document.getElementById("createCommunityModal")).hide();
            } catch (error) {
                console.error("Error creating community:", error);
                alert("Failed to create community. Please try again.");
            } finally {
                // Re-enable button
                createCommunityBtn.disabled = false;
                createCommunityBtn.textContent = "Create Community";
            }
        });
    }
});

 