import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateEmail, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "./auth.js";

document.addEventListener("DOMContentLoaded", function () {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await populateUserData(user);
            setupEventListeners();
        }
    });
});

// Fetch user data and populate the form fields
async function populateUserData(user) {
    const userRef = doc(db, "users", user.uid);
    try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();

            document.getElementById("displayName").value = userData.displayName || "";
            document.getElementById("username").value = userData.username || "";
            document.getElementById("location").value = userData.location || "";
            document.getElementById("pronouns").value = userData.pronouns || "";
            document.getElementById("bio").value = userData.bio || "";
            document.getElementById("linkedin").value = userData.linkedin || "";
            document.getElementById("github").value = userData.github || "";
            document.getElementById("instagram").value = userData.instagram || "";
            document.getElementById("twitter").value = userData.twitter || "";
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

// Set up event listeners for authentication and updates
function setupEventListeners() {
    const authButton = document.getElementById("authButton");
    const updatePasswordBtn = document.getElementById("updatePasswordBtn");
    const updateEmailBtn = document.getElementById("updateEmailBtn");
    const updateDisplayNameBtn = document.getElementById("updateDisplayNameBtn");
    const updateCredentialsForm = document.getElementById("updateCredentialsForm");
    const currentPasswordField = document.getElementById("currentPassword");

    if (currentPasswordField) {
        currentPasswordField.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                authenticateUser();
            }
        });
    }

    if (authButton) authButton.addEventListener("click", authenticateUser);
    if (updatePasswordBtn) updatePasswordBtn.addEventListener("click", updateUserPassword);
    if (updateEmailBtn) updateEmailBtn.addEventListener("click", updateUserEmail);
    if (updateDisplayNameBtn) updateDisplayNameBtn.addEventListener("click", updateDisplayName);
    if (updateCredentialsForm) updateCredentialsForm.addEventListener("submit", (event) => event.preventDefault());
}

// Update display name in Firestore and Firebase Auth
async function updateDisplayName() {
    const user = auth.currentUser;
    const displayNameInput = document.getElementById("displayName").value.trim();

    if (!displayNameInput) {
        showMessage("Please enter a display name.", "error");
        return;
    }

    try {
        await updateProfile(user, { displayName: displayNameInput });
        await updateDoc(doc(db, "users", user.uid), { displayName: displayNameInput });

        showMessage("Display name updated successfully.", "success");
    } catch (error) {
        showMessage("Failed to update display name: " + error.message, "error");
    }
}

// Authenticate user before updating email or password
async function authenticateUser() {
    const user = auth.currentUser;
    const currentPassword = document.getElementById("currentPassword");
    if (!currentPassword || !currentPassword.value.trim()) {
        showMessage("Incorrect password", "error");
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword.value.trim());
        await reauthenticateWithCredential(user, credential);

        // Unlock update fields
        document.getElementById("updateSection")?.classList.remove("d-none");
        ["newPassword", "confirmNewPassword", "updatePasswordBtn", "newEmail", "confirmNewEmail", "updateEmailBtn"]
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.removeAttribute("disabled");
            });

        showMessage("Authentication successful. You can now update your email or password.", "success");
    } catch (error) {
        showMessage("Authentication failed: " + error.message, "error");
    }
}

// Update password function
async function updateUserPassword() {
    const user = auth.currentUser;
    const newPassword = document.getElementById("newPassword");
    const confirmNewPassword = document.getElementById("confirmNewPassword");

    if (!newPassword || !confirmNewPassword || !newPassword.value.trim() || !confirmNewPassword.value.trim()) {
        showMessage("Please enter a new password and confirm it.", "error");
        return;
    }

    if (newPassword.value.trim() !== confirmNewPassword.value.trim()) {
        showMessage("Passwords do not match.", "error");
        return;
    }

    try {
        await updatePassword(user, newPassword.value.trim());
        showMessage("Password updated successfully.", "success");
    } catch (error) {
        showMessage("Failed to update password: " + error.message, "error");
    }
}

// Update email function
async function updateUserEmail() {
    const user = auth.currentUser;
    const newEmail = document.getElementById("newEmail");
    const confirmNewEmail = document.getElementById("confirmNewEmail");

    if (!newEmail || !confirmNewEmail || !newEmail.value.trim() || !confirmNewEmail.value.trim()) {
        showMessage("Please enter a new email and confirm it.", "error");
        return;
    }

    if (newEmail.value.trim() !== confirmNewEmail.value.trim()) {
        showMessage("Emails do not match.", "error");
        return;
    }

    try {
        await updateEmail(user, newEmail.value.trim());
        showMessage("Email updated successfully.", "success");
    } catch (error) {
        showMessage("Failed to update email: " + error.message, "error");
    }
}

// Show messages to the user
function showMessage(message, type) {
    let updateMessage = document.getElementById("updateMessage");
    if (!updateMessage) {
        updateMessage = document.createElement("p");
        updateMessage.id = "updateMessage";
        updateMessage.style.color = "white";

        const updateCredentialsForm = document.getElementById("updateCredentialsForm");
        if (updateCredentialsForm) {
            updateCredentialsForm.appendChild(updateMessage);
        } else {
            console.error("updateCredentialsForm element not found.");
            return;
        }
    }
    updateMessage.textContent = message;
    updateMessage.style.color = type === "success" ? "lightgreen" : "red";
}
