import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./auth.js";
import { loadPic } from "./load-user-pic.js";
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener("DOMContentLoaded", function () {
  const profilePic = document.getElementById("profilePic");
  const profileUpload = document.getElementById("profileUpload");
  const profilePreviewModalElement = document.getElementById("profilePreviewModal");

  if (!profilePic || !profileUpload || !profilePreviewModalElement) return;

  // Attach the file input "change" listener immediately
  profileUpload.addEventListener("change", handleFileSelect);

  // Clicking on the profile picture will trigger a click on the hidden file input
  profilePic.addEventListener("click", () => {
    profileUpload.click();
  });

  // Ensure user is authenticated before loading picture
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await loadPic(user.uid, profilePic);
    }
  });
});

function handleFileSelect(event) {
  const profileUpload = event.target;
  const selectedFile = profileUpload.files[0];
  if (!selectedFile) return;

  const profileModalPic = document.getElementById("profileModalPic");
  const uploadConfirm = document.getElementById("confirmUpload");
  const profilePreviewModalElement = document.getElementById("profilePreviewModal");
  const uploadSpinner = document.getElementById("uploadSpinner");

  if (!profileModalPic || !uploadConfirm || !profilePreviewModalElement || !uploadSpinner) {
    console.error("One or more profile upload elements are missing.");
    return;
  }

  // Load the selected image into the modal preview
  const reader = new FileReader();
  reader.onload = function (e) {
    profileModalPic.src = e.target.result;
  };
  reader.readAsDataURL(selectedFile);

  // Create or get the modal instance and show it
  let profilePreviewModal = bootstrap.Modal.getInstance(profilePreviewModalElement) ||
                              new bootstrap.Modal(profilePreviewModalElement);
  profilePreviewModal.show();

  // To avoid duplicate listeners, replace confirmUpload with a clone that has no listeners
  uploadConfirm.replaceWith(uploadConfirm.cloneNode(true));
  document.getElementById("confirmUpload").addEventListener("click", async function () {
    await handleConfirmUpload(selectedFile, profilePreviewModal);
  });
}

async function handleConfirmUpload(selectedFile, profilePreviewModal) {
  const uploadConfirm = document.getElementById("confirmUpload");
  const uploadSpinner = document.getElementById("uploadSpinner");
  const profilePic = document.getElementById("profilePic");

  if (!selectedFile) return;

  const user = auth.currentUser;
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
    await loadPic(user.uid, profilePic);
    
    document.dispatchEvent(new CustomEvent("profilePicUpdated", { detail: { newPic: profilePicUrl } }));
  } catch (error) {
    console.error("Error updating profile picture:", error);
  } finally {
    uploadConfirm.disabled = false;
    uploadSpinner.classList.add("d-none");
    profilePreviewModal.hide();
  }
}