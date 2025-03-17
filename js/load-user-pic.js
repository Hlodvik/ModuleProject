import { doc, getDoc } from "firebase/firestore";
import { db } from "./auth.js";

export async function loadPic(userId, imgElem) {
    if (!userId || !imgElem) return;

    try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
  
        const userData = userDoc.data();
        imgElem.src = userData.profilePic || "../images/default-picture.png";

    } catch (error) {
        console.error("Error fetching profile picture:", error);
        imgElem.src = "../images/default-picture.png";
    }
}