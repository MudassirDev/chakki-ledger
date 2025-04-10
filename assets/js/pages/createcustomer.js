import { collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { db } from "../modules/firebase.js";
import { globalInit } from "../modules/utils.js";

globalInit();

// DOM Elements
const createCustomerForm = document.getElementById('customer-main').querySelector('form');
const loader = document.getElementById('customer-main').querySelector('.loader');

// Event Listener for Customer Creation
createCustomerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Toggle form and loader visibility
    createCustomerForm.style.display = "none";
    loader.style.display = "block";

    const formData = new FormData(createCustomerForm);
    const name = formData.get("customer-name").toLowerCase();

    try {
        // Check if customer already exists
        const exists = await customerExists(name);
        if (exists) {
            alert("This customer already exists");
        } else {
            console.log("This customer doesn't exist");
            await setDoc(doc(db, "Customers", name), { orders: [] });
            alert("Customer Added");
        }
    } catch (error) {
        console.error("Error adding customer: ", error);
    }

    // Toggle form and loader back
    createCustomerForm.style.display = "block";
    loader.style.display = "none";
});

// Function to Check if Customer Exists
async function customerExists(nameToCheck) {
    try {
        const querySnapshot = await getDocs(collection(db, "Customers"));
        return querySnapshot.docs.some(doc => doc.id.toLowerCase() === nameToCheck);
    } catch (error) {
        console.error("Error checking customer existence: ", error);
        throw error;
    }
}