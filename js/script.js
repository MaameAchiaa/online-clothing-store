// ---------- PRODUCT DATABASE (Prices in USD, will convert to GHS) ----------
const USD_TO_GHS = 15.50; // Exchange rate (1 USD = 15.50 GHS)

const products = [
    { id: 1, name: "Oversized Linen Shirt", category: "men", priceUSD: 59.99, image: "images/men/linen-shirt.jpeg" },
    { id: 2, name: "Slim Fit Chino Pants", category: "men", priceUSD: 79.99, image: "images/men/slim-fit pant.jpeg" },
    { id: 3, name: "Classic Bomber Jacket", category: "men", priceUSD: 129.99, image: "images/men/classic bomber jacket.jpeg" },
    { id: 4, name: "Silk Midi Dress", category: "women", priceUSD: 89.99, image: "images/women/silk midi dress.jpeg" },
    { id: 5, name: "Cropped Cashmere Sweater", category: "women", priceUSD: 109.99, image: "images/women/Cropped Cashmere Sweater.avif" },
    { id: 6, name: "Wide Leg Trousers", category: "women", priceUSD: 74.99, image: "images/women/wide leg trouser.webp" },
    { id: 7, name: "Leather Crossbody Bag", category: "accessories", priceUSD: 49.99, image: "images/accessories/leather crossbody bag.jpeg" },
    { id: 8, name: "Minimalist Watch", category: "accessories", priceUSD: 89.99, image: "images/accessories/minimalist watch.jpg" },
    { id: 9, name: "Aviator Sunglasses", category: "accessories", priceUSD: 39.99, image: "images/accessories/aviator sunglass.jpg" },
    { id: 10, name: "Merino Wool Beanie", category: "accessories", priceUSD: 29.99, image: "images/accessories/merino wool.webp" },
    { id: 11, name: "Relaxed Denim Jacket", category: "men", priceUSD: 99.99, image: "images/men/Denim jacket.webp" },
    { id: 12, name: "Floral Maxi Dress", category: "women", priceUSD: 119.99, image: "images/women/floral dress.webp" }
];

// Add GHS price to each product
products.forEach(p => {
    p.priceGHS = p.priceUSD * USD_TO_GHS;
});

// Delivery fee based on region (nationwide Ghana)
const deliveryFees = {
    "Greater Accra": 20,
    "Ashanti": 30,
    "Western": 35,
    "Eastern": 30,
    "Central": 30,
    "Volta": 40,
    "Northern": 50,
    "Upper East": 55,
    "Upper West": 55,
    "Bono": 35,
    "Ahafo": 35,
    "Savannah": 45,
    "North East": 45,
    "Oti": 40,
    "Western North": 35
};
const DEFAULT_DELIVERY_FEE = 40;

let cart = [];
let currentFilter = "all";
let currentDeliveryFee = 0;

function convertToGHS(usd) {
    return usd * USD_TO_GHS;
}

function formatGHS(amount) {
    return `GH₵${amount.toFixed(2)}`;
}

function saveCartToLocal() {
    localStorage.setItem("maames_cart", JSON.stringify(cart));
}

function loadCartFromLocal() {
    const stored = localStorage.getItem("maames_cart");
    if (stored) {
        try {
            cart = JSON.parse(stored);
            cart = cart.filter(item => item && item.id).map(item => {
                const fullProduct = products.find(p => p.id === item.id);
                if (fullProduct) {
                    return { ...item, product: fullProduct };
                }
                return null;
            }).filter(item => item !== null);
        } catch(e) { cart = []; }
    } else {
        cart = [];
    }
    updateCartUI();
    updateCartCountBadge();
}

function updateCartCountBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById("cartCountBadge");
    if (badge) badge.innerText = totalItems;
}

function getCartSubtotalGHS() {
    return cart.reduce((sum, item) => sum + (item.product.priceGHS * item.quantity), 0);
}

function updateCartUI() {
    const cartContainer = document.getElementById("cartItemsList");
    const subtotalSpan = document.getElementById("cartSubtotal");
    const totalSpan = document.getElementById("cartTotalPrice");
    const deliveryFeeSpan = document.getElementById("deliveryFee");
    
    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `<div style="text-align:center; color:#aaa; padding:2rem;"><i class="fas fa-bag-shopping"></i> Your cart feels light.<br>Add some style!</div>`;
        subtotalSpan.innerText = formatGHS(0);
        deliveryFeeSpan.innerText = formatGHS(0);
        totalSpan.innerText = formatGHS(0);
        updateCartCountBadge();
        return;
    }

    let html = '';
    cart.forEach((item, idx) => {
        const prod = item.product;
        const itemTotal = prod.priceGHS * item.quantity;
        const cartImage = prod.image ? `<img src="${prod.image}" alt="${prod.name}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-tag"></i>`;

        html += `
            <div class="cart-item" data-cartindex="${idx}">
                <div class="cart-item-img">${cartImage}</div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${prod.name}</div>
                    <div class="cart-item-price">${formatGHS(prod.priceGHS)}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" data-id="${prod.id}" data-delta="-1">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" data-id="${prod.id}" data-delta="1">+</button>
                        <button class="remove-item" data-id="${prod.id}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div>${formatGHS(itemTotal)}</div>
            </div>
        `;
    });
    cartContainer.innerHTML = html;
    
    const subtotal = getCartSubtotalGHS();
    subtotalSpan.innerText = formatGHS(subtotal);
    deliveryFeeSpan.innerText = formatGHS(currentDeliveryFee);
    totalSpan.innerText = formatGHS(subtotal + currentDeliveryFee);
    updateCartCountBadge();

    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const prodId = parseInt(btn.getAttribute('data-id'));
            const delta = parseInt(btn.getAttribute('data-delta'));
            updateQuantity(prodId, delta);
        });
    });
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const prodId = parseInt(btn.getAttribute('data-id'));
            removeItemCompletely(prodId);
        });
    });
}

function updateQuantity(productId, delta) {
    const index = cart.findIndex(item => item.product.id === productId);
    if (index !== -1) {
        const newQty = cart[index].quantity + delta;
        if (newQty <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = newQty;
        }
        saveCartToLocal();
        updateCartUI();
        showToast(delta > 0 ? "Quantity updated" : "Item removed");
    } else if (delta > 0) {
        const product = products.find(p => p.id === productId);
        if(product) addToCartLogic(product);
    }
}

function removeItemCompletely(productId) {
    cart = cart.filter(item => item.product.id !== productId);
    saveCartToLocal();
    updateCartUI();
    showToast("Item removed from cart");
}

function addToCartLogic(product, quantity = 1) {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id: product.id, product: product, quantity: quantity });
    }
    saveCartToLocal();
    updateCartUI();
    updateCartCountBadge();
    showToast(`${product.name} added to cart`);
}

function showToast(message) {
    const toast = document.getElementById("toastMsg");
    toast.innerText = message;
    toast.style.opacity = "1";
    setTimeout(() => {
        toast.style.opacity = "0";
    }, 1800);
}

function renderProducts() {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;
    let filtered = products;
    if (currentFilter !== "all") {
        filtered = products.filter(p => p.category === currentFilter);
    }
    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center;">No items in this category</div>`;
        return;
    }
    grid.innerHTML = filtered.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/400x400?text=Image+Not+Found'">
            </div>
            <div class="product-info">
                <div class="product-title">${product.name}</div>
                <div class="product-category">${product.category.toUpperCase()}</div>
                <div class="product-price">${formatGHS(product.priceGHS)}</div>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const prodId = parseInt(btn.getAttribute('data-id'));
            const product = products.find(p => p.id === prodId);
            if (product) addToCartLogic(product, 1);
        });
    });
}

function setActiveFilter(filterValue) {
    currentFilter = filterValue;
    renderProducts();
    document.querySelectorAll('.filter-btn').forEach(btn => {
        const btnFilter = btn.getAttribute('data-filter');
        if (btnFilter === filterValue) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function openCartSidebar() {
    document.getElementById("cartOverlay").classList.add("open");
}

function closeCartSidebar() {
    document.getElementById("cartOverlay").classList.remove("open");
}

function openCheckoutModal() {
    if (cart.length === 0) {
        showToast("Your cart is empty! Add some items first.");
        return;
    }
    // Update order summary in modal
    const subtotal = getCartSubtotalGHS();
    document.getElementById("summarySubtotal").innerText = formatGHS(subtotal);
    document.getElementById("summaryDelivery").innerText = formatGHS(currentDeliveryFee);
    document.getElementById("summaryTotal").innerText = formatGHS(subtotal + currentDeliveryFee);
    document.getElementById("checkoutModal").classList.add("open");
}

function closeCheckoutModal() {
    document.getElementById("checkoutModal").classList.remove("open");
}

function openConfirmationModal(orderData) {
    const detailsDiv = document.getElementById("orderDetails");
    detailsDiv.innerHTML = `
        <p><strong>Order #${Math.floor(Math.random() * 1000000)}</strong></p>
        <p>Delivery to: ${orderData.address}</p>
        <p>Region: ${orderData.region}</p>
        <p>Payment: ${orderData.payment}</p>
        <p>Total: ${formatGHS(orderData.total)}</p>
        <p style="margin-top: 1rem;">📦 Your order will be delivered within 2-5 business days across Ghana!</p>
    `;
    document.getElementById("confirmationModal").classList.add("open");
}

function handlePlaceOrder(e) {
    e.preventDefault();
    
    const fullName = document.getElementById("fullName").value;
    const phone = document.getElementById("phone").value;
    const region = document.getElementById("region").value;
    const address = document.getElementById("address").value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    if (!fullName || !phone || !region || !address) {
        showToast("Please fill in all required fields");
        return;
    }
    
    if (phone.length < 9) {
        showToast("Please enter a valid phone number");
        return;
    }
    
    const subtotal = getCartSubtotalGHS();
    const total = subtotal + currentDeliveryFee;
    
    const orderData = {
        customer: fullName,
        phone: phone,
        region: region,
        address: address,
        payment: paymentMethod,
        subtotal: subtotal,
        deliveryFee: currentDeliveryFee,
        total: total,
        items: [...cart]
    };
    
    // Save order to localStorage for demo
    const orders = JSON.parse(localStorage.getItem("maames_orders") || "[]");
    orders.push({ ...orderData, date: new Date().toISOString() });
    localStorage.setItem("maames_orders", JSON.stringify(orders));
    
    // Clear cart
    cart = [];
    saveCartToLocal();
    updateCartUI();
    updateCartCountBadge();
    closeCheckoutModal();
    closeCartSidebar();
    
    openConfirmationModal(orderData);
    showToast("Order placed successfully! 🎉");
}

// Update delivery fee when region changes
function updateDeliveryFee() {
    const region = document.getElementById("region").value;
    currentDeliveryFee = deliveryFees[region] || DEFAULT_DELIVERY_FEE;
    updateCartUI();
    
    // Also update summary if modal is open
    const subtotal = getCartSubtotalGHS();
    document.getElementById("summarySubtotal").innerText = formatGHS(subtotal);
    document.getElementById("summaryDelivery").innerText = formatGHS(currentDeliveryFee);
    document.getElementById("summaryTotal").innerText = formatGHS(subtotal + currentDeliveryFee);
}

// Toggle mobile money details
function togglePaymentDetails() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const momoDetails = document.getElementById("mobileMoneyDetails");
    if (paymentMethod === "Mobile Money") {
        momoDetails.style.display = "block";
    } else {
        momoDetails.style.display = "none";
    }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocal();
    renderProducts();
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filterVal = btn.getAttribute('data-filter');
            setActiveFilter(filterVal);
        });
    });
    
    document.querySelectorAll('.nav-links a[data-category]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const cat = link.getAttribute('data-category');
            setActiveFilter(cat);
        });
    });
    
    document.getElementById("cartIconBtn").addEventListener("click", openCartSidebar);
    document.getElementById("closeCartBtn").addEventListener("click", closeCartSidebar);
    document.getElementById("cartOverlay").addEventListener("click", (e) => {
        if (e.target === document.getElementById("cartOverlay")) closeCartSidebar();
    });
    document.getElementById("checkoutBtn").addEventListener("click", openCheckoutModal);
    document.getElementById("closeCheckoutBtn").addEventListener("click", closeCheckoutModal);
    document.getElementById("checkoutModal").addEventListener("click", (e) => {
        if (e.target === document.getElementById("checkoutModal")) closeCheckoutModal();
    });
    document.getElementById("checkoutForm").addEventListener("submit", handlePlaceOrder);
    document.getElementById("region").addEventListener("change", updateDeliveryFee);
    
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener("change", togglePaymentDetails);
    });
    togglePaymentDetails();
    
    setActiveFilter("all");
});