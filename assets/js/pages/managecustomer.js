import { globalInit, checkUsersPerm, deleteDocument } from "../modules/utils.js";
import { Table } from "../modules/datatable.js";

globalInit();
window.table = new Table();

const currentData = {
    totalOrders: 0,
    totalOut: 0,
    totalIn: 0,
    totalRemaining: 0,
    currentCustomer: "select"
}

const updatedHtml = () => `
<div class="total-details">
            <div class="container">
                <div class="header">
                    <h6>Total Orders</h6>
                </div>
                <div class="body"><p id="total-orders">${currentData.totalOrders}</p></div>
            </div>
            <div class="container">
                <div class="header">
                    <h6>Total Amount Out</h6>
                </div>
                <div class="body"><p id="total-amount-out">${currentData.totalOut}</p></div>
            </div>
            <div class="container">
                <div class="header">
                    <h6>Total Amount In</h6>
                </div>
                <div class="body"><p id="total-amount-in">${currentData.totalIn}</p></div>
            </div>
            <div class="container">
                <div class="header">
                    <h6>Total Amount Remaining</h6>
                </div>
                <div class="body"><p id="total-amount-remaining">${currentData.totalRemaining}</p></div>
            </div>
        </div>
`;

(async()=>{
    const customerSelect = document.getElementById('selectCustomer');
    data.getCustomers().then(data =>{
        data.forEach(customer => {
            const option = document.createElement("option");
            option.value = customer.id.toLowerCase();
            option.innerText = customer.id.toLowerCase();
            customerSelect.appendChild(option);
        })
    }).catch(err => console.error(err)).finally(()=>{
        customerSelect.addEventListener("change", ()=>{
            currentData.currentCustomer = customerSelect.value;
            getData(customerSelect.value);
        })
    });
})();

function getData(customerId) {
    const customer = data.customers.find(customer => customer.id.toLowerCase() === customerId);
    updateData(customer?.orders);
}

function updateData(orders) {
    currentData.totalOrders = orders?.length || 0;
    let totalOut = 0, totalIn = 0, totalRemaining = 0;
    orders?.forEach(order => {
        totalOut += order.orderAmount;
        totalIn += order.paidAmount;
        totalRemaining += order.remainingAmount;
    })
    currentData.totalIn = totalIn;
    currentData.totalOut = totalOut;
    currentData.totalRemaining = totalRemaining;
    showData(orders);
}

function showData(orders) {
    document.querySelector('.total-details').outerHTML = updatedHtml();
    window.table.clearTable();

    orders?.forEach(order => {
        window.table.addRow(order.id, currentData.currentCustomer, order);
    });
}

async function deleteCustomer() {
    if (currentData.currentCustomer == "select") return;

    const userChoice = confirm("Deleting the customer will delete all it's data, continue?");;
    if (userChoice) {
        await deleteDocument("Customers", currentData.currentCustomer);
    }
}

document.addEventListener('user-added', ()=>{
    console.log("ok")
    if (checkUsersPerm()) {
        const button = document.createElement("button");
        button.textContent = "Delete";
        button.style.marginTop = "20px";
        button.addEventListener("click", deleteCustomer);
        document.getElementById('main').appendChild(button);
    }
})


window.updateSummary = () => {
    getData(currentData.currentCustomer);
}