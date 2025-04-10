import { auth, db } from "./firebase.js"
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { deleteDoc, setDoc, doc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

function checkUser() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                window.userLoggedIn = true;
                window.user = user;
                document.dispatchEvent(new CustomEvent("user-added"))
            } else {
                window.userLoggedIn = false;
                if (window.location.pathname != "/chakki-ledger/pages/login.html") {
                    window.location.href = "/chakki-ledger/pages/login.html"
                }
            }
        });
}

const initLogout = () => {
    const logoutBtn = document.getElementById('logoutBtn');

    logoutBtn.addEventListener('click', function() {
        signOut(auth).then(() => {
            window.location.href = '/chakki-ledger/';
        }).catch((error) => {
            console.log(error)
        });
    })
}

export const saveDoc = async (database, document, data) => {
    try {
        await setDoc(doc(db, database, document), data);
    } catch (error) {
        console.error(error)
    }
}

export const deleteDocument = async (database, document) => {
    try {
        await deleteDoc(doc(db, database, document));
    } catch (error) {
        console.error(error);
    }
}

export class DataCache {
    constructor() {
      this.orders = null;
      this.customers = null;
    }
  
    async fetchCollection(collectionName) {
      const snapshot = await getDocs(collection(db, collectionName));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  
    async getOrders() {
      if (!this.orders) {
        console.log("Fetching Orders from Firebase...");
        this.orders = await this.fetchCollection("Orders");
      } else {
        console.log("Using cached Orders data.");
      }
      return this.orders;
    }
  
    async getCustomers() {
      if (!this.customers) {
        console.log("Fetching Customers from Firebase...");
        this.customers = await this.fetchCollection("Customers");
      } else {
        console.log("Using cached Customers data.");
      }
      return this.customers;
    }

    setOrders(newOrders) {
        this.orders = newOrders;
    }

    setCustomers(newData) {
        this.customers = newData;
    }
  
    clearCache() {
      this.orders = null;
      this.customers = null;
      console.log("Cache cleared.");
    }
}

export const checkUsersPerm = () => {
  console.log("user permissions")
  return window.user?.displayName?.toLowerCase() === "admin";
};


const navbar = () => {
  if (checkUsersPerm()) {
    document.getElementById('home-item')?.insertAdjacentHTML('afterend', `
      <li class="navbar-item flexbox-left">
        <a href="/chakki-ledger/pages/createcustomer.html" class="navbar-item-inner flexbox-left">
          <div class="navbar-item-inner-icon-wrapper flexbox">
            <img src="/chakki-ledger/assets/images/customer.png" style="max-width: 30px;" alt="customer icon" />
          </div>
          <span class="link-text">Create Customer</span>
        </a>
      </li>
      
      <li class="navbar-item flexbox-left">
        <a href="/chakki-ledger/pages/createorder.html" class="navbar-item-inner flexbox-left">
          <div class="navbar-item-inner-icon-wrapper flexbox">
            <img src="/chakki-ledger/assets/images/order.png" style="max-width: 35px;" alt="order icon" />
          </div>
          <span class="link-text">Create Order</span>
        </a>
      </li>
      
      <li class="navbar-item flexbox-left">
        <a href="/chakki-ledger/pages/createorderforcustomer.html" class="navbar-item-inner flexbox-left">
          <div class="navbar-item-inner-icon-wrapper flexbox">
            <img src="/chakki-ledger/assets/images/order.png" style="max-width: 35px;" alt="order icon" />
          </div>
          <span class="link-text">Create Order (For Customer)</span>
        </a>
      </li>
    `);
  }
}


export const globalInit = async () => {
    checkUser();
    document.addEventListener('user-added', ()=>{
        navbar();
        initLogout();
    })

    window.data = new DataCache();
    await data.getCustomers();
    await data.getOrders();
}


export function showReceipt(order, customerId, orderId) {
    const renderInvoiceItems = (items) =>
        Object.entries(items)
            .map(([key, value]) => `
                <tr>
                    <td>
                        <h4>${key.split("-")[0].replace("_", " ")}</h4>
                        <p>${value.amount}</p>
                    </td>
                    <td>${value.quantity}</td>
                    <td>${value.price}</td>
                </tr>
            `)
            .join("");

    const renderActionButtons = () =>
        checkUsersPerm()
            ? `
                <button class="save-invoice" onclick="saveOrder('${customerId}', '${orderId}')">Save</button>
                <button class="delete-invoice" onclick="deleteOrder('${customerId}', '${orderId}')">Delete</button>
            `
            : "";

    const invoiceHTML = `
        <div class="invoice-popup-main-parent">
            <div class="overlay" onclick="closeInvoice()"></div>
            <div class="invoice-popup-main">
                <div class="invoice-container">
                    <div class="inv-title"><h1>Invoice</h1></div>
                    <div class="inv-header">
                        <div><h2>${customerId || '-'}</h2></div>
                        <div>
                            <table>
                                <tr><th>Date</th><td>${order.date}</td></tr>
                            </table>
                        </div>
                    </div>
                    <div class="inv-body">
                        <table>
                            <thead>
                                <tr><th>Product</th><th>Quantity</th><th>Price</th></tr>
                            </thead>
                            <tbody>
                                ${renderInvoiceItems(order.items)}
                            </tbody>
                        </table>
                    </div>
                    <div class="inv-footer">
                        <div></div>
                        <table>
                            <tr><th>Remaining</th><td>${order.remainingAmount}</td></tr>
                            <tr>
                                <th>Paid</th>
                                <td>
                                    <input 
                                        type="number" 
                                        id="paid-input" 
                                        value="${order.paidAmount}" 
                                        data-value="${order.paidAmount}"
                                    />
                                </td>
                            </tr>
                            <tr><th>Total</th><td>${order.orderAmount}</td></tr>
                        </table>
                    </div>
                </div>
                <div class="inv-actions">
                    <button onclick="closeInvoice()">Close</button>
                    <button class="download-invoice" onclick="downloadInvoice(this)">Download Invoice</button>
                    ${renderActionButtons()}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", invoiceHTML);
    if (!checkUsersPerm()) {
      document.getElementById('paid-input').disabled = true;
    }
}
