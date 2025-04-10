import { globalInit } from "../modules/utils.js";
import { Table } from "../modules/datatable.js";

const summary = {
    "total-amount-out": 0,
    "total-amount-in": 0,
    "total-amount-remaining": 0
}

window.updateSummary = () => {
    ["total-amount-in", "total-amount-out", "total-amount-remaining"].forEach(key => {
        summary[key] = 0;
    });
    

    data.orders.forEach(obj => {
        const order = obj.order;
        updateVals(order);
    })

    data.customers.forEach(obj => {
        obj.orders.forEach(order => updateVals(order));
    })

    function updateVals(order) {
        summary["total-amount-in"] += order.paidAmount;
        summary["total-amount-out"] += order.orderAmount;
        summary["total-amount-remaining"] += order.remainingAmount;
    }

    for (const [id, number] of Object.entries(summary)) {
        document.getElementById(id).textContent = number;
    }
}

function getData() {
    window.table = new Table();

    data.orders.forEach(obj => {
        const orderId = obj.id;
        const customer = "-";
        const order = obj.order;
        window.table.addRow(orderId, customer, order);
    });

    data.customers.forEach(obj => {
        const customer = obj.id;
        obj.orders.forEach(order => {
            const orderId = order.id;
            window.table.addRow(orderId, customer, order);
        })
    })
}

async function init() {
    await globalInit();
    updateSummary();
    getData();
}

init();