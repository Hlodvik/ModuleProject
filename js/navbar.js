import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./auth.js";  

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const profileImage = document.querySelector("#userMenu img");
    
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.profilePic) {
                profileImage.src = userData.profilePic; // use users profile pic
            } else {
                profileImage.src = "../assets/default-picture.png"; // use default if none
            }
        }
    }
});

 
