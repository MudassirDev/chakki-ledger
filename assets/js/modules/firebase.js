import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBeuONQC7De8eSdPyWqAbIqEoYjudVA404",
    authDomain: "chakki-57ff2.firebaseapp.com",
    projectId: "chakki-57ff2",
    storageBucket: "chakki-57ff2.firebasestorage.app",
    messagingSenderId: "347536808244",
    appId: "1:347536808244:web:c2154fe5099fe5bb552d61",
    measurementId: "G-B5K3TRFYL0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
