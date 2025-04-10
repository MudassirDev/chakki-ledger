import { createOrder, addItemToOrder, deleteOrderItem, saveOrderToDb, displayOrderItems } from '../modules/orders.js';

const date = getCurrentDate();
const outcome = document.getElementById('outcome');
const addToDbForm = document.getElementById('add-to-db-form').querySelector('form');
const addToDbLoader = document.getElementById('add-to-db-form').querySelector('.loader');
const allForms = document.getElementById('add-to-cart-forms').querySelectorAll('form');

const order = createOrder();
order.date = date;

function getCurrentDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
}

function setupFormListeners() {
    allForms.forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            addItemToOrder(order, form);
            addToDbForm.querySelector('.order_value').innerText = `Total price of order: ${order.orderAmount}`;
            displayOrderItems(order, outcome, (itemKey) => {
                deleteOrderItem(order, itemKey);
                displayOrderItems(order, outcome, setupDeleteCallback);
            });
        });
    });
}

function setupDeleteCallback(itemKey) {
    deleteOrderItem(order, itemKey);
    displayOrderItems(order, outcome, setupDeleteCallback);
}

addToDbForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (order.orderAmount === 0) {
        alert("Please add an item to the order.");
        return;
    }
    const formData = new FormData(addToDbForm);
    order.paidAmount = parseFloat(formData.get('paid_amount')) || 0;
    order.remainingAmount = order.orderAmount - order.paidAmount;

    await saveOrderToDb(order, addToDbLoader, addToDbForm);
});

setupFormListeners();
