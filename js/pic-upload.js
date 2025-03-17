import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./auth.js";
import { loadPic } from "./load-user-pic.js";
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener("DOMContentLoaded", function () {
    const profilePic = document.getElementById("profilePic");
    if (!profilePic) return;

    profilePic.addEventListener("click", setupPicUpload);

    // Ensure user is authenticated before loading picture
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await loadPic(user.uid, profilePic);
        }
    });
});

function setupPicUpload() {
    const profileUpload = document.getElementById("profileUpload");
    const profileModalPic = document.getElementById("profileModalPic");
    const uploadConfirm = document.getElementById("confirmUpload");
    const profilePreviewModalElement = document.getElementById("profilePreviewModal");
    const uploadSpinner = document.getElementById("uploadSpinner");

    if (!profileUpload || !profileModalPic || !uploadConfirm || !profilePreviewModalElement || !uploadSpinner) {
        console.error("One or more profile upload elements are missing.");
        return;
    }

    profileUpload.addEventListener("submit", function (event) {
        event.preventDefault();
    });
    let profilePreviewModal = bootstrap.Modal.getInstance(profilePreviewModalElement) || new bootstrap.Modal(profilePreviewModalElement);
    let selectedFile = null;

    profileUpload.addEventListener("change", function (event) {
        selectedFile = event.target.files[0];
        if (!selectedFile) return;

        console.log("File selected:", selectedFile);
        
        const reader = new FileReader();
        reader.onload = function (e) {
            profileModalPic.src = e.target.result;
        };
        reader.readAsDataURL(selectedFile);

        profilePreviewModal.show();
    });
    uploadConfirm.replaceWith(uploadConfirm.cloneNode(true)); // Prevent duplicate listeners
    document.getElementById("confirmUpload").addEventListener("click", async function () {
        if (!selectedFile) return;

        const user = auth.currentUser; // Ensure user is authenticated inside event
        if (!user) {
            console.error("No authenticated user.");
            return;
        }

        try {
            uploadConfirm.disabled = true;
            uploadSpinner.classList.remove("d-none");

            const storageRef = ref(storage, `profile_pics/${user.uid}.jpg`);
            await uploadBytes(storageRef, selectedFile);
            
            const profilePicUrl = await getDownloadURL(storageRef);
            await updateDoc(doc(db, "users", user.uid), { profilePic: profilePicUrl });
            await loadPic(user.uid, document.getElementById("profilePic"));
            
            document.dispatchEvent(new CustomEvent("profilePicUpdated", { detail: { newPic: profilePicUrl } }));// update navbar 

        } catch (error) {
            console.error("Error updating profile picture:", error);
        } finally {
            uploadConfirm.disabled = false;
            uploadSpinner.classList.add("d-none");
            profilePreviewModal.hide();
            selectedFile = null;
        }
    });
}