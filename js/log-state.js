async function loadAuthProviders() {
    const { OAuthProvider, GoogleAuthProvider, getAuth } = await import("firebase/auth");
    return {
        auth: getAuth(),
        appleProvider: new OAuthProvider("apple.com"),
        googleProvider: new GoogleAuthProvider()
    };
}

document.addEventListener("DOMContentLoaded", async function () {
    const { auth, appleProvider, googleProvider } = await loadAuthProviders();

    document.querySelector("#loginButton")?.addEventListener("click", () => login(auth));
    document.querySelector("#googleLoginButton")?.addEventListener("click", () => loginWithGoogle(auth, googleProvider));
    document.querySelector("#appleLoginButton")?.addEventListener("click", () => loginWithApple(auth, appleProvider));
});

async function login(auth) {
    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const errorMessage = document.getElementById("loginError");

    if (!emailInput || !passwordInput || !errorMessage) {
        console.error("Login elements not found.");
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        errorMessage.textContent = "Please enter both email and password.";
        return;
    }

    try {
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "/html/home.html";
    } catch (error) {
        handleLoginError(errorMessage, error);
    }
}

async function loginWithGoogle(auth, googleProvider) {
    try {
        const { signInWithPopup } = await import("firebase/auth");
        const result = await signInWithPopup(auth, googleProvider);
        console.log("User signed in:", result.user);
        window.location.href = "/html/home.html";
    } catch (error) {
        handleLoginError(document.getElementById("loginError"), error);
    }
}

async function loginWithApple(auth, appleProvider) {
    try {
        const { signInWithPopup } = await import("firebase/auth");
        const result = await signInWithPopup(auth, appleProvider);
        console.log("User signed in:", result.user);
        window.location.href = "/html/home.html";
    } catch (error) {
        handleLoginError(document.getElementById("loginError"), error);
    }
}

export async function logout() {
    try {
        const { signOut, getAuth } = await import("firebase/auth");
        const auth = getAuth();
        await signOut(auth);
        window.location.href = "/index.html";
    } catch (error) {
        console.error("Error logging out:", error);
    }
}

// Handles Firebase authentication errors
function handleLoginError(errorElement, error) {
    console.error("Login failed:", error.message);

    let errorMessage = "An error occurred. Please try again.";

    if (error.code === "auth/user-not-found") {
        errorMessage = "User not found.";
    } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
    } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
    } else if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Login canceled.";
    }

    if (errorElement) {
        errorElement.textContent = errorMessage;
    }
}
