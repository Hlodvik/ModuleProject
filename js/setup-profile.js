import { auth, db } from "./auth.js";
import { updateDoc, doc } from "firebase/firestore";
import gsap from "gsap";

document.addEventListener("DOMContentLoaded", async () => {
    const steps = ["step1", "step2", "step3", "finish"];
    let currentStep = 0;

    function showNextStep() {
        // Gray out current step
        document.getElementById(steps[currentStep]).classList.add("grayed-out");

        // Move to the next step
        currentStep++;
        if (currentStep < steps.length) {
            gsap.to(window, { scrollTo: `#${steps[currentStep]}`, duration: 1 });
            document.getElementById(steps[currentStep]).classList.remove("d-none");
        }
    }

    // Step 1: Save Display Name
    document.getElementById("next1").addEventListener("click", async () => {
        const displayName = document.getElementById("displayNameInput").value.trim();
        if (!displayName) return alert("Please enter a display name.");

        const userRef = doc(db, "users", auth.currentUser.uid);
        try {
            await setDoc(userRef, { displayName }, { merge: true });
            showNextStep();
        } catch (error) {
            console.error("Error saving display name:", error);
        }
    });

    // Step 2: Profile Picture (Handled in a separate module)
    document.getElementById("next2").addEventListener("click", () => showNextStep());
    document.getElementById("skipProfilePic").addEventListener("click", () => showNextStep());

    // Step 3: Save Bio & Social Links
    document.getElementById("next3").addEventListener("click", async () => {
        const bio = document.getElementById("bio").value.trim();
        const github = document.getElementById("github").value.trim();
        const linkedin = document.getElementById("linkedin").value.trim();
        const instagram = document.getElementById("instagram").value.trim();
        const twitter = document.getElementById("twitter").value.trim();

        const userRef = doc(db, "users", auth.currentUser.uid);
        try {
            await setDoc(userRef, {
                bio: bio || "",
                github: github || "",
                linkedin: linkedin || "",
                instagram: instagram || "",
                twitter: twitter || ""
            }, { merge: true });

            showNextStep();
        } catch (error) {
            console.error("Error saving profile data:", error);
        }
    });

    // Step 4: Redirect to Category & Community Selection (Handled Separately)
    document.getElementById("finishSetup").addEventListener("click", () => {
        window.location.href = "/html/home.html"; // Redirect to home or next setup page
    });
});

 