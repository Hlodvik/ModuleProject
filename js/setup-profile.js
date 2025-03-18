import { auth, db } from "./auth.js";
import { doc, setDoc } from "firebase/firestore";
import gsap from "gsap"; 
import { ScrollToPlugin } from "gsap/ScrollToPlugin"; 
gsap.registerPlugin(ScrollToPlugin);

document.addEventListener("DOMContentLoaded", async () => {
  // If your HTML sections are: <div id="step1">, <div id="step2">, <div id="step3">, <div id="step4">
  const steps = ["step1", "step2", "step3", "step4"];
  let currentStep = 0;

  function showNextStep() {
    // Gray out the current step
    document.getElementById(steps[currentStep])?.classList.add("grayed-out");

    // Move to the next step
    currentStep++;
    if (currentStep < steps.length) {
      gsap.to(window, {
        scrollTo: `#${steps[currentStep]}`,
        duration: 1
      });
      document.getElementById(steps[currentStep])?.classList.remove("d-none");
    }
  }

  // STEP 1: Save Display Name
  document.getElementById("next1")?.addEventListener("click", async () => {
    const displayName = document.getElementById("displayNameInput")?.value.trim();
    if (!displayName) {
      alert("Please enter a display name.");
      return;
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    try {
      await setDoc(userRef, { displayName }, { merge: true });
      showNextStep();
    } catch (error) {
      console.error("Error saving display name:", error);
    }
  });

  // STEP 2: Profile Picture (Handled in a separate module)
  // Both "next2" and "skipProfilePic" move on to the next step
  document.getElementById("next2")?.addEventListener("click", () => showNextStep());
  document.getElementById("skipProfilePic")?.addEventListener("click", () => showNextStep());

  // STEP 3: Save Bio & Social Links
  document.getElementById("next3")?.addEventListener("click", async () => {
    const bio = document.getElementById("bio")?.value.trim();
    const github = document.getElementById("github")?.value.trim();
    const linkedin = document.getElementById("linkedin")?.value.trim();
    const instagram = document.getElementById("instagram")?.value.trim();
    const twitter = document.getElementById("twitter")?.value.trim();

    const userRef = doc(db, "users", auth.currentUser.uid);
    try {
      // If you prefer updateDoc, import it and change to updateDoc(userRef, {...})
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

  // STEP 4: Redirect to Home (or next page)
  // Make sure there's an element with id="finishSetup" in your step4
  document.getElementById("finishSetup")?.addEventListener("click", () => {
    window.location.href = "/html/home.html";
  });
});