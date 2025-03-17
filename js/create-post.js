import { auth, db, storage } from "./main.js";
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp, updateDoc, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

document.addEventListener("DOMContentLoaded", function () {
    const postForm = document.getElementById("postForm");
    const postBody = document.getElementById("postBody");
    const postTitle = document.getElementById("postTitle");
    const mediaInput = document.getElementById("postMedia");

    if (!postForm || !postBody || !postTitle || !mediaInput) {
        console.warn("Post form elements missing.");
        return;
    }

    postForm.addEventListener("submit", function (event) {
        event.preventDefault();
        submitPost(postTitle, postBody, mediaInput);
    });
});

async function generatePostID() {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not authenticated.");
        return null;
    }

    const pathSegments = window.location.pathname.split("/");
    const communityId = pathSegments[2];
    if (!communityId) {
        console.error("Community ID not found in URL.");
        return null;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userPostID = userSnap.data().userPostID;
    const username = userSnap.data().username;
    const communityRef = doc(db, "communities", communityId);
    const communitySnap = await getDoc(communityRef);
    const communityPostID = communitySnap.data().communityPostID;

    const userCommunityPostsField = `posts.${communityId}`;
    let postCount = userSnap.data().posts?.[communityId] || 0;
    postCount++;

    await updateDoc(userRef, { [userCommunityPostsField]: postCount });

    return `${communityPostID}${userPostID}_${postCount}`;
}

async function resizeImageFile(file, maxWidth = 800, maxHeight = 800) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const aspectRatio = width / height;
                    if (width > height) {
                        width = maxWidth;
                        height = width / aspectRatio;
                    } else {
                        height = maxHeight;
                        width = height * aspectRatio;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.85);
            };
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function uploadMediaFiles(files) {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not authenticated.");
        return [];
    }

    const uploadPromises = [];
    const mediaUrls = [];

    for (let file of files) {
        const resizedBlob = await resizeImageFile(file);
        const storageRef = ref(storage, `post_media/${user.uid}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytes(storageRef, resizedBlob).then(async (snapshot) => {
            const downloadUrl = await getDownloadURL(snapshot.ref);
            mediaUrls.push(downloadUrl);
            return downloadUrl;
        });
        uploadPromises.push(uploadTask);
    }

    await Promise.all(uploadPromises);
    return mediaUrls;
}

async function submitPost() {
    const postTitle = document.getElementById("postTitle");
    const postBody = document.getElementById("postBody");
    const mediaInput = document.getElementById("postMedia");
  
    const postTitleValue = postTitle.value.trim();
    const postBodyValue = postBody.innerHTML.trim();
  
    if (!postTitleValue || !postBodyValue) {
      alert("Title and content cannot be empty.");
      return;
    }
  
    try {
      const postID = await generatePostID();
      if (!postID) throw new Error("Failed to generate post ID");
  
      let mediaUrls = [];
      if (mediaInput.files.length > 0) {
        mediaUrls = await uploadMediaFiles(mediaInput.files);
      }
  
      let formattedContent = postBody.innerHTML;
      mediaUrls.forEach((url) => {
        formattedContent = formattedContent.replace(
          "[MEDIA_PLACEHOLDER]",
          `<img src='${url}' alt='Uploaded Image'/>`
        );
      });
  
      const pathSegments = window.location.pathname.split("/");
      const communityId = pathSegments[2];
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user.");
        return;
      }
  
      // 1. Create the post doc
      await setDoc(doc(db, "posts", postID), {
        postID: postID,
        title: postTitleValue,
        content: formattedContent,
        communityId: communityId,
        postAuthor: username,
        createdAt: serverTimestamp(),
        mediaUrls: mediaUrls,
      });
  
      // 2. Add the post ID to the user doc
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        postIDs: arrayUnion(postID),
      });
  
      // 3. Add the post ID to the community doc
      const communityRef = doc(db, "communities", communityId);
      await updateDoc(communityRef, {
        posts: arrayUnion(postID),
      });
  
      alert(`Post submitted successfully.`);
      postTitle.value = "";
      postBody.innerHTML = "";
      mediaInput.value = "";
      bootstrap.Modal.getInstance(document.getElementById("createPostModal")).hide();
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("Failed to submit post.");
    }
  }
