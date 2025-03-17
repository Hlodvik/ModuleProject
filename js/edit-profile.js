import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "./auth.js";

document.addEventListener("DOMContentLoaded", function () {
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.addEventListener("click", saveProfileChanges);
    }

    trackFormChanges();
    setupUsernameValidation();
});

const modifiedFields = {}; 
let usernameAvailable = true;

function trackFormChanges() {
    const inputs = document.querySelectorAll("#editProfileForm input, #editProfileForm textarea");
    const saveBtn = document.getElementById("saveBtn");

    inputs.forEach(input => {
        input.addEventListener("input", () => {
            modifiedFields[input.id] = input.value.trim();
            saveBtn.disabled = false;
        });
    });
}

// username validation, ensure urls stay unique
function setupUsernameValidation() {
    const usernameInput = document.getElementById("username");
    if (!usernameInput) {
        return;
    }

    let usernameMessage = document.getElementById("usernameMessage");
    if (!usernameMessage) {
        usernameMessage = document.createElement("p");
        usernameMessage.id = "usernameMessage";
        usernameMessage.style.marginTop = "5px";
        usernameMessage.style.fontSize = "0.9rem";
        usernameInput.parentNode.appendChild(usernameMessage);
    }

    usernameInput.addEventListener("input", async () => {
        const newUsername = usernameInput.value.trim();
        const validUsernameRegex = /^[\p{L}0-9_-]+$/u; 

        if (newUsername.length < 3) {
            usernameMessage.textContent = "Username must be at least 3 characters.";
            usernameMessage.style.color = "red";
            usernameAvailable = false;
            return;
        }

        if (!validUsernameRegex.test(newUsername)) {
            usernameMessage.textContent = "Invalid username. Use only letters, numbers, dashes (-), or underscores (_).";
            usernameMessage.style.color = "red";
            usernameAvailable = false;
            return;
        }

        // Check if username is already taken
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", newUsername));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            usernameMessage.textContent = "Username is already taken.";
            usernameMessage.style.color = "red";
            usernameAvailable = false;
        } else {
            usernameMessage.textContent = "Username is available.";
            usernameMessage.style.color = "green";
            usernameAvailable = true;
        }
    });
}

async function saveProfileChanges(event) {
    event.preventDefault();

    const saveBtn = document.getElementById("saveBtn");
    const saveMessage = document.getElementById("saveMessage");

    if (Object.keys(modifiedFields).length === 0) {
        console.log("No changes detected.");
        return;
    }

    if (!usernameAvailable) {
        saveMessage.textContent = "Cannot save: Username is either invalid or taken.";
        saveMessage.style.color = "red";
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        console.error("No authenticated user.");
        return;
    }

    try {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        await updateDoc(doc(db, "users", user.uid), modifiedFields);

        console.log("Updated fields:", modifiedFields);
        saveMessage.textContent = "Profile updated successfully!";
        saveMessage.style.color = "green";

        Object.keys(modifiedFields).forEach(key => delete modifiedFields[key]);

        saveBtn.textContent = "Save Changes";
        saveBtn.disabled = true;
    } catch (error) {
        console.error("Error updating profile:", error);
        saveMessage.textContent = "Error saving profile. Try again.";
        saveMessage.style.color = "red";

        saveBtn.textContent = "Save Changes";
        saveBtn.disabled = false;
    }
}