import { setPersistence, signInWithEmailAndPassword, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { auth } from "../modules/firebase.js";

// DOM Element
const loginForm = document.getElementById('login-form');

// Event Listener for Login Form Submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
        // Set session persistence and sign in the user
        await setPersistence(auth, browserSessionPersistence);
        await signInWithEmailAndPassword(auth, email, password);

        // Redirect after successful login
        window.location.href = "/chakki-ledger/";
    } catch (error) {
        // Log error details
        console.error("Login failed:", error.code, error.message);
    }
});
