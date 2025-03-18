import { auth, db, storage } from "./auth.js";
import { collection, getDocs, getDoc, query, where, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import Compressor from "compressorjs";

let currentCommunityId = null;

/** Ensure Firebase Auth is Ready Before Loading Communities */
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadUserCommunities(user.uid);
        } else {
            showToast("User is not authenticated.", "danger");
        }
    });
});

/** Load communities the user is an admin of */
async function loadUserCommunities(userId) {
    if (!userId) {
        showToast("No user ID provided.", "danger");
        return;
    }

    const communityList = document.querySelector("#communityList ul");
    if (!communityList) return;

    communityList.innerHTML = ""; // Clear existing list

    try {
        const q = query(collection(db, "communities"), where("admins", "array-contains", userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            communityList.innerHTML = `<li class="list-group-item bg-dark text-white text-center">No communities found.</li>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const li = document.createElement("li");
            li.classList.add("list-group-item", "bg-dark", "text-white", "d-flex", "justify-content-between", "align-items-center");

            li.innerHTML = `
                <span>${data.name} (${data.subdomain})</span>
                <button class="btn btn-sm btn-outline-light edit-community" data-id="${doc.id}">Edit</button>
            `;

            communityList.appendChild(li);
        });

        document.querySelectorAll(".edit-community").forEach(button => {
            button.removeEventListener("click", loadEditForm);
            button.addEventListener("click", (e) => {
                const communityId = e.target.getAttribute("data-id");
                if (communityId) {
                    loadEditForm(communityId);
                }
            });
        });

    } catch (error) {
        showToast("Error loading communities.", "danger");
        console.error(error);
    }
}

/** Function to load images from Firebase Storage */
async function loadCommunityImages(communitySubdomain) {
    const communityPicPreview = document.getElementById("editCommunityPicPreview");
    const communityBannerPreview = document.getElementById("editCommunityBannerPreview");

    if (!communityPicPreview || !communityBannerPreview) {
        showToast("Image preview elements not found.", "danger");
        return;
    }

    try {
        const communityPicRef = ref(storage, `community_pics/${communitySubdomain}_profile.jpg`);
        const communityBannerRef = ref(storage, `community_pics/${communitySubdomain}_banner.jpg`);

        const picUrl = await getDownloadURL(communityPicRef);
        communityPicPreview.src = picUrl;
        localStorage.setItem(`communityPic_${communitySubdomain}`, picUrl);
    } catch {
        console.warn("Community profile picture not found.");
    }

    try {
        const bannerUrl = await getDownloadURL(communityBannerRef);
        communityBannerPreview.src = bannerUrl;
        localStorage.setItem(`communityBanner_${communitySubdomain}`, bannerUrl);
    } catch {
        console.warn("Community banner not found.");
    }
}

/** Load community data into the edit form */
async function loadEditForm(communityId) {
    if (!communityId) {
        showToast("No community ID provided.", "danger");
        return;
    }
    currentCommunityId = communityId;

    try {
        const docRef = doc(db, "communities", communityId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return;

        const data = docSnap.data();
        document.getElementById("editCommunityName").value = data.name || "";
        document.getElementById("editSubdomain").value = data.subdomain || "";
        document.getElementById("editCommunityBio").value = data.bio || "";

        loadCommunityImages(data.subdomain);

        document.getElementById("editCommunityFormContainer").classList.remove("d-none");
        document.getElementById("communityList").classList.add("d-none");

    } catch (error) {
        showToast("Error loading community data for editing.", "danger");
        console.error(error);
    }
}

/** Function to compress and upload image to Firebase Storage */
async function uploadCompressedImage(file, path) {
    return new Promise((resolve, reject) => {
        new Compressor(file, {
            quality: 0.7,
            maxWidth: 500,
            maxHeight: 500,
            success(result) {
                const storageRef = ref(storage, path);
                const reader = new FileReader();
                
                reader.onload = async function (event) {
                    const blob = new Blob([result], { type: result.type });
                    try {
                        await uploadBytes(storageRef, blob);
                        const downloadURL = await getDownloadURL(storageRef);
                        resolve(downloadURL);
                    } catch (uploadError) {
                        reject(uploadError);
                    }
                };

                reader.onerror = reject;
                reader.readAsArrayBuffer(result);
            },
            error(err) {
                reject(err);
            }
        });
    });
}

/** Handle updating community details */
document.addEventListener("DOMContentLoaded", () => {
    const editCommunityForm = document.getElementById("editCommunityForm");
    const editCommunityPicInput = document.getElementById("editCommunityPicInput");
    const editCommunityBannerInput = document.getElementById("editCommunityBannerInput");

    if (editCommunityForm) { //I kept changing my mind about keeping ever js module in main, this is what I would do if I still wanted to do that.
        editCommunityForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!currentCommunityId) return;

            const docRef = doc(db, "communities", currentCommunityId);
            const updatedData = {
                name: document.getElementById("editCommunityName").value.trim() || "",
                bio: document.getElementById("editCommunityBio").value.trim() || "",
            };

            try {
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) {
                    showToast("Community not found.", "danger");
                    return;
                }

                const data = docSnap.data();
                const subdomain = data.subdomain;
                // because values can be nullish
                if (editCommunityPicInput?.files.length > 0) {
                    const picUrl = await uploadCompressedImage(editCommunityPicInput.files[0], `community_pics/${subdomain}_profile.jpg`);
                    updatedData.communityPicUrl = picUrl;
                }
                
                if (editCommunityBannerInput?.files.length > 0) {
                    const bannerUrl = await uploadCompressedImage(editCommunityBannerInput.files[0], `community_pics/${subdomain}_banner.jpg`);
                    updatedData.bannerUrl = bannerUrl;
                }

                await updateDoc(docRef, updatedData); 
                showToast("Community updated successfully.", "success");

                editCommunityForm.reset(); 
                document.getElementById("editCommunityFormContainer").classList.add("d-none");
                document.getElementById("communityList").classList.remove("d-none");

                loadUserCommunities(auth.currentUser.uid);
            } catch (error) {
                showToast("Failed to update community. Please try again.", "danger");
                console.error(error);
            }
        });
    }
});

/* toast is for alerting!*/
function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show`;
    toast.role = "alert";
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
        </div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
