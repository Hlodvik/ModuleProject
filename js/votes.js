import { doc, updateDoc, onSnapshot, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db } from "./main.js";

// Handles vote updates in Firestore and UI
export async function handleVote(postId, voteType) {
    const user = auth.currentUser;
    if (!user) {
        console.error("User not authenticated.");
        return;
    }

    const postRef = doc(db, "posts", postId);
    const userId = user.uid;

    try {
        if (voteType === "upvote") {
            await updateDoc(postRef, {
                upvotes: arrayUnion(userId),
                downvotes: arrayRemove(userId)
            });
        } else if (voteType === "downvote") {
            await updateDoc(postRef, {
                upvotes: arrayRemove(userId),
                downvotes: arrayUnion(userId)
            });
        } else if (voteType === "remove-upvote") {
            await updateDoc(postRef, {
                upvotes: arrayRemove(userId)
            });
        } else if (voteType === "remove-downvote") {
            await updateDoc(postRef, {
                downvotes: arrayRemove(userId)
            });
        }
        console.log(`User ${userId} voted ${voteType} on post ${postId}`);
    } catch (error) {
        console.error("Error updating vote:", error);
    }
}

// Live listener for post votes
export function listenToPostVotes(postId, voteCountElement, upvoteButton, downvoteButton) {
    const postRef = doc(db, "posts", postId);
    const user = auth.currentUser;

    onSnapshot(postRef, (docSnap) => {
        if (docSnap.exists()) {
            const postData = docSnap.data();
            const upvotes = postData.upvotes || [];
            const downvotes = postData.downvotes || [];

            // Update vote count dynamically
            voteCountElement.textContent = upvotes.length - downvotes.length;

            // Check if the current user has voted
            if (user) {
                const userId = user.uid;
                upvoteButton.dataset.voted = upvotes.includes(userId) ? "true" : "false";
                downvoteButton.dataset.voted = downvotes.includes(userId) ? "true" : "false";

                upvoteButton.classList.toggle("active-upvote", upvotes.includes(userId));
                downvoteButton.classList.toggle("active-downvote", downvotes.includes(userId));
            }
        }
    });
}