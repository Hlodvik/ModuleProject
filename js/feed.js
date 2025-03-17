import { db } from "./main.js";
import { collection, doc, getDoc, getDocs, limit, query, where, orderBy } from "firebase/firestore";
import { renderFeed } from "./render-feed.js";

export async function fetchUserFeed(uid) {
    const container = document.getElementById("userFeed");
    try {
      if (!uid || !container) { 
        return;
      } 
      // 1. Get the user document by UID
      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);
  
      if (!userSnap.exists()) {
        console.error("No user found with that UID");
        return;
      }
  
      const userData = userSnap.data();
  
      // 2. Retrieve post IDs from user
      const { postIDs } = userData;
      if (!postIDs || postIDs.length === 0) {
        console.log("User has no posts to display.");
        return;
      }
  
      // 3. Fetch each post document
      const postDocs = [];
      for (const pid of postIDs) {
        const postRef = doc(db, "posts", pid);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          postDocs.push({ id: postSnap.id, ...postSnap.data() });
        }
      }
  
      // 4. Render the posts inside #userFeed
      renderFeed(postDocs, container);
    } catch (error) {
      console.error("Error fetching user feed:", error);
    }
  }
// Fetch and display the community feed 
export async function fetchCommunityFeed(communityId) {
    const container = document.getElementById("communityFeed");
    if (!container) { 
      return;
    }
  
    try {
      // 2. Fetch the community doc to retrieve postIDs
      const communityDocRef = doc(db, "communities", communityId);
      const communitySnap = await getDoc(communityDocRef);
  
      if (!communitySnap.exists()) {
        console.error("No community found with ID:", communityId);
        return;
      }
  
      const communityData = communitySnap.data();
      const { posts: postIDs } = communityData;
  
      if (!postIDs || postIDs.length === 0) {
        console.log("No posts found for this community.");
        return;
      }
  
      // 3. Build a Firestore query using the postIDs
      const postsRef = collection(db, "posts");
      const postQuery = query(
        postsRef,
        where("postID", "in", postIDs),
        orderBy("createdAt", "desc")
      );
  
      // 4. Use the provided getPosts function to fetch and sort them by your custom “score”
      const posts = await getPosts(postQuery);
  
      // 5. Render the fetched posts in the container
      renderFeed(posts, container);
  
    } catch (error) {
      console.error("Error fetching community feed:", error);
    }
  }

// Fetch and display the home feed based on the logged-in user's joined communities
function computeScoreForDoc(docSnap) {
    const data = docSnap.data();
    const now = new Date(); 
    const createdAt = data.createdAt?.toDate?.() || new Date();
    const ageInHours = (now - createdAt) / (1000 * 60 * 60);
    const score = (data.upvotes + 1) / Math.pow(ageInHours + 2, 0.8);
    return { id: docSnap.id, ...data, score };
  }
  
  /**
   * Splits an array into multiple arrays (chunks)
   * each up to 'size' items.
   */
  function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  export async function fetchHomeFeed() {
    const container = document.getElementById("homeFeed");
    if (!container) {
      console.error("No container found with ID 'homeFeed'.");
      return;
    }
  
    // 1. Get the currently signed-in user
    const user = auth.currentUser;
    if (!user) {
      console.error("No user is currently signed in.");
      return;
    }
  
    try {
      // 2. Fetch the user doc and retrieve the 'members' array
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
  
      if (!userSnap.exists()) {
        console.error("User doc not found.");
        return;
      }
  
      const userData = userSnap.data();
      const { members } = userData; 
      // e.g.: ["CritiqueCircle", "WritingPromptsDaily", "cantsleep", ...]
  
      if (!members || members.length === 0) {
        console.log("User is not a member of any communities.");
        return;
      }
  
      // 3. Because Firestore 'in' can only handle up to 10 items,
      //    split members into chunks of up to 10 communities each.
      const chunks = chunkArray(members, 10);
      let allPosts = [];
  
      // 4. For each chunk, run a Firestore query with limit(20).
      for (const chunk of chunks) {
        if (chunk.length === 0) continue;
  
        const postsRef = collection(db, "posts");
        const qRef = query(
          postsRef,
          where("communityId", "in", chunk),
          orderBy("createdAt", "desc"),
          limit(20) // up to 20 posts from this chunk
        );
  
        // 5. Get the snapshot and compute custom scores for each doc
        const snapshot = await getDocs(qRef);
        const postsInChunk = snapshot.docs.map(docSnap => computeScoreForDoc(docSnap));
  
        // Add chunk’s results to our master list
        allPosts = allPosts.concat(postsInChunk);
      }
  
      // 6. Now we may have more than 20 total (if multiple chunks).
      //    Sort them by your custom score, descending.
      allPosts.sort((a, b) => b.score - a.score);
  
      // 7. Take the top 20
      const topPosts = allPosts.slice(0, 20);
  
      // 8. Render the top 20 posts in #homeFeed
      renderFeed(topPosts, container);
  
    } catch (error) {
      console.error("Error fetching home feed:", error);
    }
  }

// Fetch posts from Firestore and process them with ranking logic
async function getPosts(postQuery) {
    const snapshot = await getDocs(postQuery);
    const now = new Date();

    return snapshot.docs.map(doc => {
        const data = doc.data();
        const ageInHours = (now - data.createdAt.toDate()) / (1000 * 60 * 60);
        const score = (data.votes + 1) / Math.pow(ageInHours + 2, 0.8);
        return { id: doc.id, ...data, score };
    }).sort((a, b) => b.score - a.score);
}

 

