let productData;
let cartQuantity = 1;


function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
     
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    closeMenu.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
    
  
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}


function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = `
        <div class="loader-spinner">Loading...</div>
    `;
    document.body.appendChild(loader);
}


function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}


function showModal(title, message, confirmText, cancelText, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="modal-buttons">
                <button class="modal-btn cancel-btn">${cancelText}</button>
                <button class="modal-btn success-btn">${confirmText}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
   
    setTimeout(() => modal.classList.add('active'), 10);
    
    const confirmBtn = modal.querySelector('.success-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    confirmBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            if (onConfirm) onConfirm();
        }, 300);
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });
}


function showFetchProductsButton() {
    const main = document.querySelector('main');
    if (!main) return;
    
    const fetchProductsDiv = document.createElement('div');
    fetchProductsDiv.style.textAlign = 'center';
    fetchProductsDiv.style.padding = '2rem';
    fetchProductsDiv.innerHTML = `
        <button class="checkout-btn" style="max-width: 200px;" onclick="fetchCartData()">Fetch Products</button>
    `;
    
    main.innerHTML = '';
    main.appendChild(fetchProductsDiv);
}



async function fetchCartData() {
    showLoader(); 

  
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const response = await fetch("https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889");
        if (!response.ok) throw new Error('Network response was not ok');

        productData = await response.json();
        cartQuantity = 1;
        localStorage.setItem('cartData', JSON.stringify(productData));
        localStorage.setItem('cartQuantity', cartQuantity.toString());

        renderCart(); 
    } catch (error) {
        console.error('Error fetching cart data:', error);
        showModal(
            'Error',
            'Failed to fetch cart data. Please try again.',
            'OK',
            'Cancel',
            null
        );
    } finally {
        hideLoader(); 
    }
}


function formatPrice(price) {
    return `₹${Number(price).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    })}`;
}


function renderCart() {
    if (!productData?.items?.length) {
        showFetchProductsButton();
        return;
    }

    const main = document.querySelector('main');
    if (!main) return;

    const item = productData.items[0];
    const subtotal = item.price * cartQuantity;
    
    main.innerHTML = `
        <div class="cart-section">
            <div class="cart-headers">
                <span class="product-col">Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Subtotal</span>
            </div>
            
            <div class="cart-items">
                <div class="cart-item">
                    <div class="product-info">
                        <img src="${item.image}" alt="${item.title}" class="product-image">
                        <div class="product-details">
                            <span class="product-name">${item.title}</span>
                            <div class="mobile-price">${formatPrice(item.price)}</div>
                        </div>
                    </div>
                    <div class="price desktop-only">${formatPrice(item.price)}</div>
                    <div class="quantity-controls">
                        <button class="qty-btn minus" data-action="decrease">-</button>
                        <span class="qty-display">${cartQuantity}</span>
                        <button class="qty-btn plus" data-action="increase">+</button>
                    </div>
                    <div class="subtotal">${formatPrice(subtotal)}</div>
                    <button class="delete-btn" data-action="delete">
                        <img src="./images/trash.png" alt="delete">
                    </button>
                </div>
            </div>
        </div>

        <aside class="cart-totals">
            <h2>Cart Totals</h2>
            <div class="total-rows">
                <div class="total-row">
                    <span>Subtotal</span>
                    <span class="subtotal-amount">${formatPrice(subtotal)}</span>
                </div>
                <div class="total-row">
                    <span>Total</span>
                    <span class="total-amount">${formatPrice(subtotal)}</span>
                </div>
            </div>
            <button class="checkout-btn" data-action="checkout">Check Out</button>
        </aside>
    `;
}

function handleQuantityChange(change) {
    const newQuantity = cartQuantity + change;
    
    if (newQuantity === 0) {
        showModal(
            'Remove Item',
            'Are you sure you want to remove this item?',
            'Remove',
            'Cancel',
            () => {
                cartQuantity = 0;
                localStorage.removeItem('cartData');
                localStorage.removeItem('cartQuantity');
                showFetchProductsButton();
            }
        );
        return;
    }
    
    if (newQuantity >= 1) {
        cartQuantity = newQuantity;
        localStorage.setItem('cartQuantity', cartQuantity.toString());
        renderCart();
    }
}


function setupCartEventListeners(e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    
    switch (action) {
        case 'increase':
            handleQuantityChange(1);
            break;
        case 'decrease':
            handleQuantityChange(-1);
            break;
        case 'delete':
            showModal(
                'Remove Item',
                'Are you sure you want to remove this item from cart?',
                'Remove',
                'Cancel',
                () => {
                    cartQuantity = 0;
                    localStorage.removeItem('cartData');
                    localStorage.removeItem('cartQuantity');
                    showFetchProductsButton();
                }
            );
            break;
        case 'checkout':
            showModal(
                'Checkout',
                'Proceed to checkout?',
                'Continue',
                'Cancel',
                () => {
                    alert('Processing checkout...');
                }
            );
            break;
    }
}


document.addEventListener('DOMContentLoaded', () => {
 
    setupHamburgerMenu();
    
    const savedData = localStorage.getItem('cartData');
    const savedQuantity = localStorage.getItem('cartQuantity');
    
  
    const main = document.querySelector('main');
    if (main) {
        main.addEventListener('click', setupCartEventListeners);
    }
    
    if (savedData && savedQuantity) {
        productData = JSON.parse(savedData);
        cartQuantity = parseInt(savedQuantity);
        if (cartQuantity > 0) {
            renderCart();
        } else {
            showFetchProductsButton();
        }
    } else {
        fetchCartData();
    }
});