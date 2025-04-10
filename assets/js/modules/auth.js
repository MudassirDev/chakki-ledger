import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const auth = getAuth();

export const isUserLoggedIn = () => {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => resolve(!!user));
    });
};

export const getCurrentUser = () => {
    return auth.currentUser;
};
