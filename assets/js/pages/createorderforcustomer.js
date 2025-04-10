import { createOrder, addItemToOrder, deleteOrderItem, saveCustomerOrderToDb, displayOrderItems } from '../modules/orders.js';
import { DataCache, globalInit } from '../modules/utils.js';

// important functions
// checkUser();
// initLogout();
globalInit();

const customerSelect = document.getElementById('selectCustomer');
const addToDbForm = document.getElementById('add-to-db-form').querySelector('form');
const addToDbLoader = document.getElementById('add-to-db-form').querySelector('.loader');
const allForms = document.getElementById('add-to-cart-forms').querySelectorAll('form');
const outcome = document.getElementById('outcome');
const completeData = new DataCache();

const order = createOrder();

async function fillCustomerSelect() {
    const customers = await completeData.getCustomers();
    customerSelect.innerHTML = "<option value='select'>Select Customer</option>";
    customers.forEach(doc => {
        const option = document.createElement("option");
        option.value = doc.id.toLowerCase();
        option.innerText = doc.id.toLowerCase();
        customerSelect.appendChild(option);
    });
}

function setupCustomerSelectListener() {
    customerSelect.addEventListener('change', () => {
        document.getElementById('main-add-to-cart-div').style.display = customerSelect.value !== "select" ? "block" : "none";
    });
}

function setupFormListeners() {
    allForms.forEach(form => {
        form.addEventListener('submit', e => {
            e.preventDefault();
            addItemToOrder(order, form);
            displayOrderItems(order, outcome, setupDeleteCallback);
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

    await saveCustomerOrderToDb(order, customerSelect.value, addToDbLoader, addToDbForm);
});

fillCustomerSelect();
setupCustomerSelectListener();
setupFormListeners();