import { showReceipt, saveDoc, deleteDocument } from "./utils.js";

export class Table {
    constructor() {
        this.table = document.querySelector('.complete-data .data-table');
        this.rows = new Map();
    }

    addRow(orderId, customerId, order) {
        const row = new Row(orderId, customerId, order);
        this.table.insertAdjacentHTML("beforeend", row.getHtml());
        row.addEventListeners();
        this.rows.set(orderId, row);
    }

    removeRow(orderId) {
        const row = this.rows.get(orderId);
        if (row) {
            row.remove();
            this.rows.delete(orderId);
        }
    }

    updateRow(orderId, updatedOrder) {
        const row = this.rows.get(orderId);
        if (row) {
            row.update(updatedOrder);
        }
    }

    clearTable() {
        for (const row of this.rows.values()) {
            row.remove();
        }

        this.rows.clear();
    }
}

class Row {
    constructor(orderId, customerId, order) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.order = order
    }


    getHtml() {
        const { orderId, customerId, order } = this;
        return `
        <div class="row" id="${orderId}" data-customerId="${customerId}" data-orderId="${orderId}">
            <p><span class="label">Order ID</span> ${formatOrderId(orderId)}</p>
            <p><span class="label">Customer</span> <span name="customer">${customerId}</span></p>
            <p><span class="label">Order Amount</span> <span name="order-amount">${order.orderAmount.toLocaleString()}</span></p>
            <p><span class="label">Paid Amount</span> <span name="paid-amount">${order.paidAmount.toLocaleString()}</span></p>
            <p><span class="label">Remaining Amount</span> <span name="remaining-amount">${order.remainingAmount.toLocaleString()}</span></p>
            <p><span class="label">Action</span> <button class="view-more-btn">View More</button></p>
        </div>
        `;
    }

    addEventListeners() {
        const viewMoreButton = document.getElementById(`${this.orderId}`).querySelector(`.view-more-btn`);
        if (viewMoreButton) {
            viewMoreButton.addEventListener('click', () => {
                showReceipt(this.order, this.customerId, this.orderId);
            });
        }

        const customer = document.getElementById(`${this.orderId}`).querySelector(`[name="customer"]`);
        customer.addEventListener('click', ()=>{
            if (customer.textContent == "-") return;
        });
    }

    remove() {
        document.getElementById(this.orderId).remove();
    }


    update(updatedOrder) {
        this.order = updatedOrder;

        document.getElementById(this.orderId).querySelector('[name="order-amount"]').textContent = ` ${updatedOrder.orderAmount.toLocaleString()}`;
        document.getElementById(this.orderId).querySelector('[name="paid-amount"]').textContent = ` ${updatedOrder.paidAmount.toLocaleString()}`;
        document.getElementById(this.orderId).querySelector('[name="remaining-amount"]').textContent = ` ${updatedOrder.remainingAmount.toLocaleString()}`;
    }

}

// helper function
function formatOrderId(orderId) {
    return `${orderId.slice(0, 3)}...${orderId.slice(-3)}`;
}

window.closeInvoice = () => {
    document.querySelector('.invoice-popup-main-parent').remove();
}

window.downloadInvoice = (button) => {
    const invoiceContainer = button.closest('.invoice-popup-main').querySelector('.invoice-container');
    invoiceContainer.style.maxWidth = "unset";
    html2canvas(invoiceContainer).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = "invoice.png";
        link.click();
    });
    invoiceContainer.style.maxWidth = "90%";
}


// important functions
window.deleteOrder = async (customer, orderId) => {
    if (customer == "-") {
        data.orders = data.orders.filter(obj => obj.id != orderId);
        await deleteDocument("Orders", orderId);
    } else {
        const customers = data.customers;
        const customerData = customers.find(custom => custom.id == customer);
        console.log(customerData)
        const updatedData = customerData.orders.filter(order => order.id !== orderId);
        customerData.orders = updatedData;
        await saveDoc("Customers", customer, {orders: customerData.orders});
        data.setCustomers(customers);
    }

    closeInvoice();
    window.table.removeRow(orderId);
    updateSummary();
}

window.saveOrder = async (customer, orderId) => {
    const paidInput = document.getElementById('paid-input');
    const newAmount = parseFloat(paidInput.value);
    const originalAmount = parseFloat(paidInput.getAttribute('data-value'));

    if (newAmount === originalAmount) {
        throw new Error("Values cannot be the same!");
    }

    const updateOrderAmounts = (order) => {
        order.paidAmount = newAmount;
        order.remainingAmount = order.orderAmount - newAmount;
        return order;
    };

    if (customer === "-") {
        const order = data.orders.find(o => o.id === orderId).order;
        updateOrderAmounts(order);
        await saveDoc("Orders", orderId, { order });
        window.table.updateRow(orderId, order);
    } else {
        const customerData = data.customers.find(c => c.id === customer);
        const order = customerData.orders.find(o => o.id === orderId);
        updateOrderAmounts(order);
        const updatedData = { orders: customerData.orders };
        await saveDoc("Customers", customer, updatedData);
        window.table.updateRow(orderId, order);
    }

    closeInvoice();
    updateSummary();
};