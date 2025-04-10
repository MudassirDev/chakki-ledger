export const attachFilterEvents = () => {
    document.getElementById('filter-button')?.addEventListener('click', () => {
        document.querySelector('.filter-sidebar').style.transform = "translate(0px)";
    });

    document.getElementById('main')?.addEventListener('click', (e) => {
        hideFilter(e.target);
    });

    function hideFilter(target) {
        const filterSidebar = document.querySelector('.filter-sidebar');
        if (target.id !== "filter-button" && !filterSidebar.contains(target)) {
            filterSidebar.style.transform = "translate(-400px)";
        }
    }
}

export const appendFilter = (customerFilters, customerId) => {
    const filterHTML = `
        <div class="filter customerFilter">
            <input type="checkbox" name="${customerId}" id="${customerId}">
            <label for="${customerId}">${customerId}</label>
        </div>
    `;
    customerFilters.insertAdjacentHTML('beforeend', filterHTML);
}

export const initializeFilters = () => {
    const allFilters = document.querySelectorAll('.filter');
    const allOrders = document.querySelectorAll('.row:not(:first-child)');
    const customerOrderFilter = document.getElementById('customer-orders');
    const otherOrderFilter = document.getElementById('other-orders');
    const allCustomerFilters = [...document.querySelectorAll('.customerFilter')];

    const isShowCustomerOrder = () => customerOrderFilter.checked;
    const isShowOtherOrder = () => otherOrderFilter.checked;

    document.querySelectorAll('.filter-sidebar .body .category').forEach(category => {
        const label = category.querySelector('.label');
        const filters = category.querySelector('.filters');
        label.addEventListener('click', () => {
            const isCollapsed = window.getComputedStyle(filters).height === "0px";
            filters.style.height = isCollapsed ? "auto" : "0px";
            filters.style.transform = isCollapsed ? "translate(0px, 0px)" : "translate(-100vw, 0px)";
        });
    });

    allFilters.forEach(filter => {
        const input = filter.querySelector('input');
        if (input.type === "checkbox") {
            input.addEventListener('change', applyFilters);
        }
    });

    function applyFilters() {
        allOrders.forEach(row => {
            const customerName = row.querySelector('[name="customer"]').innerHTML.toLowerCase();
            const showCustomerOrder = isShowCustomerOrder() && customerName !== "-";
            const showOtherOrder = isShowOtherOrder() && customerName === "-";
            const hasActiveFilters = allCustomerFilters.some(filter => filter.querySelector('input').checked);

            row.classList.add('hide');

            if (showCustomerOrder) {
                if (!hasActiveFilters || allCustomerFilters.some(filter => {
                    const filterName = filter.querySelector('label').innerText.trim().toLowerCase();
                    return filter.querySelector('input').checked && filterName === customerName;
                })) {
                    row.classList.remove('hide');
                }
            }

            if (showOtherOrder || (!isShowCustomerOrder() && !isShowOtherOrder())) {
                row.classList.remove('hide');
            }
        });
    }
}
