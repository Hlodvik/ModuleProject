import { db } from "./auth.js";
import { doc, getDoc, collection, query, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

if (window.location.pathname.startsWith("/post/")) {
    let postId = window.location.pathname.split("/")[2] || null;

    if (postId) {
        loadPost(postId);
    }
}
// Load post data from Firestore
async function loadPost(postId) {
    try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            console.error("Post not found");
            return;
        }

        const postData = postSnap.data();

        // Update post content safely
        updateElementText("postCommunity", `Posted in /co/${postData.communityID}`);
        updateElementHref("postCommunity", `/co/${postData.communityID}`);

        updateElementText("authorName", postData.authorName);
        updateElementHref("authorName", `/u/${postData.userPostID}`);

        updateElementText("postTitle", postData.title);
        updateElementText("postContent", postData.content);

        if (postData.authorPic) updateElementSrc("authorPic", postData.authorPic);

        updateElementText("upvoteCount", postData.upvotes || 0);

        // Fetch real-time comment count from Firestore
        const commentsRef = collection(db, "posts", postId, "comments");
        const commentsSnap = await getDocs(commentsRef);
        updateElementText("commentCount", commentsSnap.size);

        // Listen for real-time updates (votes)
        onSnapshot(postRef, (docSnap) => {
            if (docSnap.exists()) {
                const updatedData = docSnap.data();
                updateElementText("upvoteCount", updatedData.upvotes || 0);
            }
        });

        loadComments(postId);
    } catch (error) {
        console.error("Error loading post:", error);
    }
}

// Load comments from Firestore
async function loadComments(postId) {
    try {
        const commentsRef = collection(db, "posts", postId, "comments");
        const q = query(commentsRef);
        const querySnapshot = await getDocs(q);

        const commentsList = document.getElementById("commentsList");
        if (!commentsList) return;
        commentsList.innerHTML = ""; // Clear only once

        querySnapshot.forEach((doc) => {
            addCommentToList(doc.data(), commentsList);
        });

        // Listen for real-time updates (new comments)
        onSnapshot(commentsRef, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    addCommentToList(change.doc.data(), commentsList);
                }
            });
        });
    } catch (error) {
        console.error("Error loading comments:", error);
    }
}

// Helper function to add a comment to the list
function addCommentToList(commentData, commentsList) {
    const commentElement = document.createElement("div");
    commentElement.classList.add("card", "bg-dark", "text-white", "p-2", "mb-2");

    commentElement.innerHTML = `
        <p class="fw-bold">${commentData.authorName}</p>
        <p>${commentData.content}</p>
    `;

    commentsList.appendChild(commentElement);
}

// Utility functions to update elements safely
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
}

function updateElementHref(id, href) {
    const element = document.getElementById(id);
    if (element) element.href = href;
}

function updateElementSrc(id, src) {
    const element = document.getElementById(id);
    if (element) element.src = src;
}
