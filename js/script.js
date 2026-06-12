// ---------- PRODUCT DATABASE ----------
const USD_TO_GHS = 11.50;

const products = [
    { id: 1, name: "Oversized Linen Shirt", category: "men", priceUSD: 7.826, image: "images/men/linen-shirt.jpeg", stock: 15 },
    { id: 2, name: "Slim Fit Chino Pants", category: "men", priceUSD: 10.435, image: "images/men/slim-fit pant.jpeg", stock: 12 },
    { id: 3, name: "Classic Bomber Jacket", category: "men", priceUSD: 13.0431, image: "images/men/classic bomber jacket.jpeg", stock: 8 },
    { id: 4, name: "Silk Midi Dress", category: "women", priceUSD: 21.739, image: "images/men/women/silk midi dress.jpeg", stock: 10 },
    { id: 5, name: "Cropped Cashmere Sweater", category: "women", priceUSD: 8.696, image: "images/men/women/Cropped Cashmere Sweater.avif", stock: 6 },
    { id: 6, name: "Wide Leg Trousers", category: "women", priceUSD: 21.739, image: "images/men/women/wide leg trouser.webp", stock: 14 },
    { id: 7, name: "Leather Crossbody Bag", category: "accessories", priceUSD: 8.696, image: "images/men/accessories/leather crossbody bag.jpeg", stock: 20 },
    { id: 8, name: "Minimalist Watch", category: "accessories", priceUSD: 15.652, image: "images/men/accessories/minimalist watch.jpg", stock: 5 },
    { id: 9, name: "Aviator Sunglasses", category: "accessories", priceUSD: 7.826, image: "images/men/accessories/aviator sunglass.jpg", stock: 18 },
    { id: 10, name: "Merino Wool Beanie", category: "accessories", priceUSD: 4.348, image: "images/men/accessories/merino wool.webp", stock: 25 },
    { id: 11, name: "Relaxed Denim Jacket", category: "men", priceUSD: 13.0431, image: "images/men/Denim jacket.webp", stock: 7 },
    { id: 12, name: "Floral Maxi Dress", category: "women", priceUSD: 26.087, image: "images/men/women/floral dress.webp", stock: 4 }
];

products.forEach(p => { p.priceGHS = p.priceUSD * USD_TO_GHS; });

const deliveryFees = {
    "Greater Accra": 20, "Ashanti": 30, "Western": 35, "Eastern": 30,
    "Central": 30, "Volta": 40, "Northern": 50, "Upper East": 55,
    "Upper West": 55, "Bono": 35, "Ahafo": 35, "Savannah": 45,
    "North East": 45, "Oti": 40, "Western North": 35
};
const DEFAULT_DELIVERY_FEE = 40;

let cart = [];
let wishlist = [];
let currentFilter = "all";
let currentDeliveryFee = 0;
let searchQuery = "";

function formatGHS(amount) { return `GH₵${amount.toFixed(2)}`; }
function generateOrderId() { return Math.floor(100000 + Math.random() * 900000).toString(); }
function saveCartToLocal() { localStorage.setItem("maames_cart", JSON.stringify(cart)); }
function saveWishlistToLocal() { localStorage.setItem("maames_wishlist", JSON.stringify(wishlist)); }
function saveProductsToLocal() { localStorage.setItem("maames_products", JSON.stringify(products)); }

function loadProductsFromLocal() {
    const stored = localStorage.getItem("maames_products");
    if (stored) {
        try {
            const savedProducts = JSON.parse(stored);
            savedProducts.forEach((saved, idx) => { if (products[idx]) products[idx].stock = saved.stock; });
        } catch(e) {}
    }
}

function loadCartFromLocal() {
    const stored = localStorage.getItem("maames_cart");
    if (stored) {
        try {
            cart = JSON.parse(stored);
            cart = cart.filter(item => item && item.id).map(item => {
                const fullProduct = products.find(p => p.id === item.id);
                if (fullProduct) return { ...item, product: fullProduct };
                return null;
            }).filter(item => item !== null);
        } catch(e) { cart = []; }
    } else { cart = []; }
    updateCartUI();
    updateCartCountBadge();
}

function loadWishlistFromLocal() {
    const stored = localStorage.getItem("maames_wishlist");
    if (stored) {
        try { wishlist = JSON.parse(stored); wishlist = wishlist.filter(id => products.find(p => p.id === id)); }
        catch(e) { wishlist = []; }
    } else { wishlist = []; }
    updateWishlistUI();
    updateWishlistCountBadge();
}

function updateCartCountBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById("cartCountBadge");
    if (badge) badge.innerText = totalItems;
}

function updateWishlistCountBadge() {
    const badge = document.getElementById("wishlistCountBadge");
    if (badge) badge.innerText = wishlist.length;
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
        cartContainer.innerHTML = `<div style="text-align:center; color:#aaa; padding:2rem;"><i class="fas fa-bag-shopping"></i><br>Your cart is empty</div>`;
        subtotalSpan.innerText = formatGHS(0); deliveryFeeSpan.innerText = formatGHS(0); totalSpan.innerText = formatGHS(0);
        updateCartCountBadge(); return;
    }
    let html = '';
    cart.forEach((item) => {
        const prod = item.product;
        const itemTotal = prod.priceGHS * item.quantity;
        html += `<div class="cart-item"><div class="cart-item-img"><img src="${prod.image}" onerror="this.src='https://placehold.co/400x400'"></div>
            <div class="cart-item-details"><div class="cart-item-title">${prod.name}</div><div class="cart-item-price">${formatGHS(prod.priceGHS)}</div>
            <div class="cart-item-qty"><button class="qty-btn" data-id="${prod.id}" data-delta="-1">-</button><span>${item.quantity}</span>
            <button class="qty-btn" data-id="${prod.id}" data-delta="1">+</button><button class="remove-item" data-id="${prod.id}"><i class="fas fa-trash-alt"></i></button></div></div>
            <div>${formatGHS(itemTotal)}</div></div>`;
    });
    cartContainer.innerHTML = html;
    const subtotal = getCartSubtotalGHS();
    subtotalSpan.innerText = formatGHS(subtotal);
    deliveryFeeSpan.innerText = formatGHS(currentDeliveryFee);
    totalSpan.innerText = formatGHS(subtotal + currentDeliveryFee);
    updateCartCountBadge();
    document.querySelectorAll('.qty-btn').forEach(btn => btn.addEventListener('click', () => updateQuantity(parseInt(btn.dataset.id), parseInt(btn.dataset.delta))));
    document.querySelectorAll('.remove-item').forEach(btn => btn.addEventListener('click', () => removeItemCompletely(parseInt(btn.dataset.id))));
}

function updateWishlistUI() {
    const container = document.getElementById("wishlistItemsList");
    if (!container) return;
    if (wishlist.length === 0) { container.innerHTML = `<div style="text-align:center; color:#aaa; padding:2rem;"><i class="far fa-heart"></i><br>Your wishlist is empty</div>`; return; }
    let html = '';
    wishlist.forEach(id => {
        const prod = products.find(p => p.id === id);
        if (prod) html += `<div class="wishlist-item"><div class="wishlist-item-img"><img src="${prod.image}" onerror="this.src='https://placehold.co/400x400'"></div>
            <div class="wishlist-item-details"><div class="wishlist-item-title">${prod.name}</div><div class="wishlist-item-price">${formatGHS(prod.priceGHS)}</div>
            <button class="add-to-cart-wishlist" data-id="${prod.id}" style="margin-top:5px; background:#c28a4c; border:none; padding:4px 10px; border-radius:20px; cursor:pointer;">Add to Cart</button>
            <button class="remove-wishlist" data-id="${prod.id}" style="margin-left:5px; background:none; border:none; color:#b15e3a; cursor:pointer;">Remove</button></div></div>`;
    });
    container.innerHTML = html;
    document.querySelectorAll('.add-to-cart-wishlist').forEach(btn => btn.addEventListener('click', () => { const p = products.find(p => p.id === parseInt(btn.dataset.id)); if(p && p.stock > 0) addToCartLogic(p,1); else showToast("Out of stock!"); }));
    document.querySelectorAll('.remove-wishlist').forEach(btn => btn.addEventListener('click', () => { wishlist = wishlist.filter(id => id !== parseInt(btn.dataset.id)); saveWishlistToLocal(); updateWishlistUI(); updateWishlistCountBadge(); renderProducts(); showToast("Removed from wishlist"); }));
}

function updateQuantity(productId, delta) {
    const index = cart.findIndex(item => item.product.id === productId);
    if (index !== -1) {
        const newQty = cart[index].quantity + delta;
        if (newQty <= 0) cart.splice(index, 1);
        else cart[index].quantity = newQty;
        saveCartToLocal(); updateCartUI(); showToast(delta > 0 ? "Quantity updated" : "Item removed");
    }
}

function removeItemCompletely(productId) {
    cart = cart.filter(item => item.product.id !== productId);
    saveCartToLocal(); updateCartUI(); showToast("Item removed from cart");
}

function addToCartLogic(product, quantity = 1) {
    const productStock = product.stock;
    const existing = cart.find(item => item.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty + quantity > productStock) {
        showToast(`Sorry, only ${productStock} left in stock!`);
        return;
    }
    if (existing) existing.quantity += quantity;
    else cart.push({ id: product.id, product: product, quantity: quantity });
    saveCartToLocal(); updateCartUI(); updateCartCountBadge(); showToast(`${product.name} added to cart`);
}

function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    if (index === -1) { wishlist.push(productId); showToast("Added to wishlist"); }
    else { wishlist.splice(index, 1); showToast("Removed from wishlist"); }
    saveWishlistToLocal(); updateWishlistUI(); updateWishlistCountBadge(); renderProducts();
}

function showToast(message) {
    const toast = document.getElementById("toastMsg");
    toast.innerText = message; toast.style.opacity = "1";
    setTimeout(() => { toast.style.opacity = "0"; }, 1800);
}

function renderProducts() {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;
    let filtered = products.filter(p => {
        const matchesCategory = currentFilter === "all" || p.category === currentFilter;
        const matchesSearch = searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    if (filtered.length === 0) { grid.innerHTML = `<div style="grid-column:1/-1; text-align:center;">No items found</div>`; return; }
    grid.innerHTML = filtered.map(product => {
        const stockClass = product.stock <= 3 ? 'low' : '';
        const stockText = product.stock <= 0 ? 'Out of Stock' : `${product.stock} left`;
        return `<div class="product-card"><button class="wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}" data-id="${product.id}"><i class="${wishlist.includes(product.id) ? 'fas' : 'far'} fa-heart"></i></button>
            <div class="product-img"><img src="${product.image}" onerror="this.src='https://placehold.co/400x400'"></div>
            <div class="product-info"><div class="product-title">${product.name}</div><div class="product-category">${product.category.toUpperCase()}</div>
            <div class="product-price">${formatGHS(product.priceGHS)}</div>
            <div class="stock-badge ${stockClass}"><i class="fas fa-box"></i> ${stockText}</div>
            <button class="add-to-cart" data-id="${product.id}" ${product.stock <= 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                <i class="fas fa-cart-plus"></i> ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button></div></div>`;
    }).join('');
    document.querySelectorAll('.add-to-cart:not([disabled])').forEach(btn => btn.addEventListener('click', () => { const p = products.find(p => p.id === parseInt(btn.dataset.id)); if(p && p.stock > 0) addToCartLogic(p,1); }));
    document.querySelectorAll('.wishlist-btn').forEach(btn => btn.addEventListener('click', (e) => { e.stopPropagation(); toggleWishlist(parseInt(btn.dataset.id)); }));
}

function deductStock(orderItems) {
    orderItems.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            product.stock -= item.quantity;
            if (product.stock < 0) product.stock = 0;
        }
    });
    saveProductsToLocal();
    renderProducts();
}

function finalizeOrder(orderData, orderId) {
    deductStock(orderData.items);
    const orders = JSON.parse(localStorage.getItem("maames_orders") || "[]");
    orders.push({ ...orderData, orderId: orderId, date: new Date().toISOString(), status: "Pending" });
    localStorage.setItem("maames_orders", JSON.stringify(orders));
    cart = [];
    saveCartToLocal(); updateCartUI(); updateCartCountBadge(); closeCheckoutModal(); closeCartSidebar();
    const detailsDiv = document.getElementById("orderDetails");
    detailsDiv.innerHTML = `<p><strong>Order #${orderId}</strong></p><p>Total: ${formatGHS(orderData.total)}</p><p>Delivery: ${orderData.address}, ${orderData.region}</p><p>Payment: ${orderData.payment}</p>`;
    document.getElementById("confirmationModal").classList.add("open");
    showToast(`Order #${orderId} placed successfully!`);
}

async function handlePlaceOrder(e) {
    e.preventDefault();
    const fullName = document.getElementById("fullName").value;
    const phone = document.getElementById("phone").value;
    const region = document.getElementById("region").value;
    const address = document.getElementById("address").value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    if (!fullName || !phone || !region || !address) { showToast("Please fill in all required fields"); return; }
    if (phone.length < 9) { showToast("Enter valid phone number"); return; }
    if (paymentMethod === "Card Payment") {
        const cardNum = document.getElementById("cardNumber")?.value.replace(/\s/g, '');
        const expiry = document.getElementById("expiryDate")?.value;
        const cvv = document.getElementById("cvv")?.value;
        if (!cardNum || cardNum.length < 15 || !expiry || !expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/) || !cvv || cvv.length < 3) {
            showToast("Please enter valid card details"); return;
        }
    }
    const subtotal = getCartSubtotalGHS();
    const total = subtotal + currentDeliveryFee;
    const orderId = generateOrderId();
    const orderData = { customer: fullName, phone, region, address, payment: paymentMethod, subtotal, deliveryFee: currentDeliveryFee, total, items: cart.map(i => ({ id: i.product.id, name: i.product.name, quantity: i.quantity, price: i.product.priceGHS })) };
    
    finalizeOrder(orderData, orderId);
}

function updateDeliveryFee() {
    const region = document.getElementById("region").value;
    currentDeliveryFee = deliveryFees[region] || DEFAULT_DELIVERY_FEE;
    updateCartUI();
    const subtotal = getCartSubtotalGHS();
    document.getElementById("summarySubtotal").innerText = formatGHS(subtotal);
    document.getElementById("summaryDelivery").innerText = formatGHS(currentDeliveryFee);
    document.getElementById("summaryTotal").innerText = formatGHS(subtotal + currentDeliveryFee);
}

function togglePaymentDetails() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const momoDetails = document.getElementById("mobileMoneyDetails");
    const cardDetails = document.getElementById("cardDetails");
    if (paymentMethod === "Mobile Money") { momoDetails.style.display = "block"; cardDetails.style.display = "none"; }
    else if (paymentMethod === "Card Payment") { momoDetails.style.display = "none"; cardDetails.style.display = "block"; }
    else { momoDetails.style.display = "none"; cardDetails.style.display = "none"; }
}

function openCartSidebar() { document.getElementById("cartOverlay").classList.add("open"); }
function closeCartSidebar() { document.getElementById("cartOverlay").classList.remove("open"); }
function openWishlistSidebar() { document.getElementById("wishlistOverlay").classList.add("open"); }
function closeWishlistSidebar() { document.getElementById("wishlistOverlay").classList.remove("open"); }
function openCheckoutModal() {
    if (cart.length === 0) { showToast("Cart is empty"); return; }
    const subtotal = getCartSubtotalGHS();
    document.getElementById("summarySubtotal").innerText = formatGHS(subtotal);
    document.getElementById("summaryDelivery").innerText = formatGHS(currentDeliveryFee);
    document.getElementById("summaryTotal").innerText = formatGHS(subtotal + currentDeliveryFee);
    document.getElementById("checkoutModal").classList.add("open");
}
function closeCheckoutModal() { document.getElementById("checkoutModal").classList.remove("open"); }
function setActiveFilter(filterValue) { currentFilter = filterValue; renderProducts(); }
function toggleSearch() { document.getElementById("searchBar").classList.toggle("open"); }

document.addEventListener("DOMContentLoaded", () => {
    loadProductsFromLocal();
    loadCartFromLocal(); loadWishlistFromLocal(); renderProducts();
    document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => setActiveFilter(btn.dataset.filter)));
    document.querySelectorAll('.nav-links a[data-category]').forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); setActiveFilter(link.dataset.category); }));
    document.getElementById("cartIconBtn").addEventListener("click", openCartSidebar);
    document.getElementById("wishlistIconBtn").addEventListener("click", openWishlistSidebar);
    document.getElementById("searchIconBtn").addEventListener("click", toggleSearch);
    document.getElementById("closeSearchBtn").addEventListener("click", toggleSearch);
    document.getElementById("searchInput").addEventListener("input", (e) => { searchQuery = e.target.value; renderProducts(); });
    document.getElementById("closeCartBtn").addEventListener("click", closeCartSidebar);
    document.getElementById("closeWishlistBtn").addEventListener("click", closeWishlistSidebar);
    document.getElementById("cartOverlay").addEventListener("click", (e) => { if (e.target === document.getElementById("cartOverlay")) closeCartSidebar(); });
    document.getElementById("wishlistOverlay").addEventListener("click", (e) => { if (e.target === document.getElementById("wishlistOverlay")) closeWishlistSidebar(); });
    document.getElementById("checkoutBtn").addEventListener("click", openCheckoutModal);
    document.getElementById("closeCheckoutBtn").addEventListener("click", closeCheckoutModal);
    document.getElementById("checkoutForm").addEventListener("submit", handlePlaceOrder);
    document.getElementById("region").addEventListener("change", updateDeliveryFee);
    document.querySelectorAll('input[name="payment"]').forEach(radio => radio.addEventListener("change", togglePaymentDetails));
    togglePaymentDetails(); setActiveFilter("all");
    
    const cardNumInput = document.getElementById("cardNumber");
    if (cardNumInput) cardNumInput.addEventListener("input", (e) => { let val = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim(); e.target.value = val; });
    const expiryInput = document.getElementById("expiryDate");
    if (expiryInput) expiryInput.addEventListener("input", (e) => { let val = e.target.value.replace(/\//g, ''); if (val.length >= 2) val = val.slice(0,2) + '/' + val.slice(2,4); e.target.value = val; });
});