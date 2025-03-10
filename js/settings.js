import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateEmail, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db } from "./auth.js";   

const storage = getStorage();

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("authButton")?.addEventListener("click", authenticateUser);
    document.getElementById("currentPassword")?.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            authenticateUser();
        }
    });
    document.getElementById("updatePasswordBtn")?.addEventListener("click", updateUserPassword);
    document.getElementById("updateEmailBtn")?.addEventListener("click", updateUserEmail);

    setupProfileUpload();
});

onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        const usernameField = document.getElementById("username");
        if (usernameField) usernameField.value = userData.username || "";
        
        const locationField = document.getElementById("location");
        if (locationField) locationField.value = userData.location || "";
        
        const bioField = document.getElementById("bio");
        if (bioField) bioField.value = userData.bio || "";
        
        const socialLinks1 = document.getElementById("socialLinks1");
        if (socialLinks1) socialLinks1.value = userData.linkedin || "";
        
        const socialLinks2 = document.getElementById("socialLinks2");
        if (socialLinks2) socialLinks2.value = userData.github || "";
        
        const socialLinks3 = document.getElementById("socialLinks3");
        if (socialLinks3) socialLinks3.value = userData.instagram || "";
        
        const socialLinks4 = document.getElementById("socialLinks4");
        if (socialLinks4) socialLinks4.value = userData.x || "";

        if (userData.profilePic) {
            document.getElementById("profilePreview").src = userData.profilePic;
        }
    }
});

async function authenticateUser() {
    const user = auth.currentUser;
    const currentPassword = document.getElementById("currentPassword")?.value;
    if (!currentPassword) {
        alert("Please enter your current password.");
        return;
    }
    try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        document.getElementById("updateSection")?.classList.remove("d-none");
        ["newPassword", "confirmNewPassword", "updatePasswordBtn", "newEmail", "confirmNewEmail", "updateEmailBtn"]
            .forEach(id => document.getElementById(id)?.removeAttribute("disabled"));
    } catch (error) {
        alert("Authentication failed: " + error.message);
    }
}

async function updateUserPassword() {
    const user = auth.currentUser;
    const newPassword = document.getElementById("newPassword")?.value;
    const confirmNewPassword = document.getElementById("confirmNewPassword")?.value;
    if (!newPassword || !confirmNewPassword) {
        alert("Please enter a new password.");
        return;
    }
    if (newPassword !== confirmNewPassword) {
        alert("Passwords do not match.");
        return;
    }
    try {
        await updatePassword(user, newPassword);
        alert("Password updated successfully!");
    } catch (error) {
        alert("Error updating password: " + error.message);
    }
}

async function updateUserEmail() {
    const user = auth.currentUser;
    const newEmail = document.getElementById("newEmail")?.value;
    const confirmNewEmail = document.getElementById("confirmNewEmail")?.value;
    if (!newEmail || !confirmNewEmail) {
        alert("Please enter a new email.");
        return;
    }
    if (newEmail !== confirmNewEmail) {
        alert("Emails do not match.");
        return;
    }
    try {
        await updateEmail(user, newEmail);
        alert("Email updated successfully! Please verify your new email.");
    } catch (error) {
        alert("Error updating email: " + error.message);
    }
}

function setupProfileUpload() {
    const uploadInput = document.getElementById("profileUpload");
    const previewImage = document.getElementById("profilePreview");
    const modalPreviewImage = document.getElementById("modalProfilePreview");
    const confirmUploadBtn = document.getElementById("confirmUpload");
    const profilePreviewModalElement = document.getElementById("profilePreviewModal");
    const uploadLoader = document.getElementById("uploadLoader");

    let profilePreviewModal = profilePreviewModalElement ? new bootstrap.Modal(profilePreviewModalElement) : null;
    let selectedFile = null;

    if (!uploadInput || !previewImage || !modalPreviewImage || !confirmUploadBtn || !uploadLoader) return;

    uploadInput.addEventListener("change", (event) => {
        selectedFile = event.target.files[0];
        if (!selectedFile) return;
        const objectURL = URL.createObjectURL(selectedFile);
        previewImage.src = objectURL;
        modalPreviewImage.src = objectURL;
        profilePreviewModal?.show();
    });

    confirmUploadBtn.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!selectedFile || !user) return;

        try {
            confirmUploadBtn.disabled = true;
            uploadLoader.classList.remove("d-none");
            const imageUrl = await uploadProfilePicture(selectedFile, user.uid);
            if (!imageUrl) throw new Error("Upload failed");
            await setDoc(doc(db, "users", user.uid), { profilePic: imageUrl }, { merge: true });
            await updateProfile(user, { photoURL: imageUrl });
            previewImage.src = imageUrl;
        } finally {
            confirmUploadBtn.disabled = false;
            uploadLoader.classList.add("d-none");
            profilePreviewModal?.hide();
        }
    });
}