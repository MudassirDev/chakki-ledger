import { addDoc, collection, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import { db } from './firebase.js';

export const createOrder = () => ({
    date: getFormattedDate(), // Use current date as default
    items: {},
    orderAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
});

export const addItemToOrder = (order, form) => {
    const formData = new FormData(form);
    const quantity = formData.get("quantity");
    const amount = `${formData.get("amount")}${formData.get("unit")}`;
    const price = parseFloat(formData.get("price"));

    const item = `${form.getAttribute('id')}-${amount}`;

    order.items[item] = { quantity, amount, price };
    updateOrderAmount(order);
};

export const updateOrderAmount = (order) => {
    order.orderAmount = Object.values(order.items).reduce((total, item) => total + item.price, 0);
};

export const displayOrderItems = (order, container, deleteCallback) => {
    container.innerHTML = ""; // Clear existing items

    for (const [key, value] of Object.entries(order.items)) {
        const div = document.createElement('div');
        div.classList.add('item');

        const itemName = document.createElement('p');
        itemName.innerText = key;
        div.appendChild(itemName);

        for (const [k, v] of Object.entries(value)) {
            const p = document.createElement('p');
            p.innerText = `${k}: ${v}`;
            div.appendChild(p);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = "Delete";
        deleteBtn.addEventListener('click', () => deleteCallback(key));
        div.appendChild(deleteBtn);

        container.appendChild(div);
    }
};

export const deleteOrderItem = (order, itemKey) => {
    delete order.items[itemKey];
    updateOrderAmount(order);
};

export const saveOrderToDb = async (order, loader, form) => {
    try {
        loader.style.display = "block";
        form.style.display = "none";

        const docRef = await addDoc(collection(db, "Orders"), { order });
        console.log("Order saved with ID:", docRef.id);
    } catch (err) {
        console.error("Error saving order:", err);
    } finally {
        loader.style.display = "none";
        form.style.display = "block";
    }
};

export const saveCustomerOrderToDb = async (order, customerId, loader, form) => {
    try {
        loader.style.display = "block";
        form.style.display = "none";

        const customerRef = doc(db, "Customers", customerId.toLowerCase());
        const customerSnap = await getDoc(customerRef);

        if (customerSnap.exists()) {
            const customerData = customerSnap.data();
            const orders = customerData.orders || [];

            const uuid = await (await fetch('https://www.uuidtools.com/api/generate/v1')).json();
            order.id = uuid[0];

            orders.push(order);
            await setDoc(customerRef, { orders });

            console.log("Customer orders updated:", orders);
        } else {
            console.log("No such customer found!");
        }
    } catch (err) {
        console.error("Error saving customer order:", err);
    } finally {
        loader.style.display = "none";
        form.style.display = "block";
    }
};

function getFormattedDate() {
  const today = new Date();
  return `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
}