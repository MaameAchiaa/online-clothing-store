
// ---------- PRODUCT DATABASE ----------
const products = [
    { id: 1, name: "Oversized Linen Shirt", category: "men", price: 59.99, icon: "👔", gender: "men" },
    { id: 2, name: "Slim Fit Chino Pants", category: "men", price: 79.99, icon: "👖", gender: "men" },
    { id: 3, name: "Classic Bomber Jacket", category: "men", price: 129.99, icon: "🧥", gender: "men" },
    { id: 4, name: "Silk Midi Dress", category: "women", price: 89.99, icon: "👗", gender: "women" },
    { id: 5, name: "Cropped Cashmere Sweater", category: "women", price: 109.99, icon: "🧶", gender: "women" },
    { id: 6, name: "Wide Leg Trousers", category: "women", price: 74.99, icon: "👖", gender: "women" },
    { id: 7, name: "Leather Crossbody Bag", category: "accessories", price: 49.99, icon: "👜", gender: "accessories" },
    { id: 8, name: "Minimalist Watch", category: "accessories", price: 89.99, icon: "⌚", gender: "accessories" },
    { id: 9, name: "Aviator Sunglasses", category: "accessories", price: 39.99, icon: "🕶️", gender: "accessories" },
    { id: 10, name: "Merino Wool Beanie", category: "accessories", price: 29.99, icon: "🧢", gender: "accessories" },
    { id: 11, name: "Relaxed Denim Jacket", category: "men", price: 99.99, icon: "🧥", gender: "men" },
    { id: 12, name: "Floral Maxi Dress", category: "women", price: 119.99, icon: "👗", gender: "women" }
];

// Cart state
let cart = [];
let currentFilter = "all";

// Helper functions
function saveCartToLocal() {
    localStorage.setItem("urbanmoda_cart", JSON.stringify(cart));
}

function loadCartFromLocal() {
    const stored = localStorage.getItem("urbanmoda_cart");
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

function updateCartUI() {
    const cartContainer = document.getElementById("cartItemsList");
    const totalSpan = document.getElementById("cartTotalPrice");
    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `<div style="text-align:center; color:#aaa; padding:2rem;"><i class="fas fa-bag-shopping"></i> Your cart feels light.<br>Add some style!</div>`;
        totalSpan.innerText = `$0.00`;
        updateCartCountBadge();
        return;
    }

    let total = 0;
    let html = '';
    cart.forEach((item, idx) => {
        const prod = item.product;
        const itemTotal = prod.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item" data-cartindex="${idx}">
                <div class="cart-item-img">${prod.icon}</div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${prod.name}</div>
                    <div class="cart-item-price">$${prod.price.toFixed(2)}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" data-id="${prod.id}" data-delta="-1">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" data-id="${prod.id}" data-delta="1">+</button>
                        <button class="remove-item" data-id="${prod.id}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
                <div>$${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });
    cartContainer.innerHTML = html;
    totalSpan.innerText = `$${total.toFixed(2)}`;
    updateCartCountBadge();

    // Attach dynamic handlers
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
            <div class="product-img">${product.icon}</div>
            <div class="product-info">
                <div class="product-title">${product.name}</div>
                <div class="product-category">${product.category.toUpperCase()}</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
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
    document.querySelectorAll('.nav-links a[data-category]').forEach(link => {
        const cat = link.getAttribute('data-category');
        if (cat === filterValue) {
            link.style.color = "#c28a4c";
        } else if (cat) {
            link.style.color = "#2c3e4e";
        }
    });
}

function openCartSidebar() {
    document.getElementById("cartOverlay").classList.add("open");
}

function closeCartSidebar() {
    document.getElementById("cartOverlay").classList.remove("open");
}

function handleCheckout() {
    if (cart.length === 0) {
        showToast("Your cart is empty! Add some items first.");
        return;
    }
    showToast("✨ Thank you for shopping! (Demo order placed)");
    cart = [];
    saveCartToLocal();
    updateCartUI();
    updateCartCountBadge();
    closeCartSidebar();
    renderProducts();
}

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocal();
    renderProducts();

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filterVal = btn.getAttribute('data-filter');
            setActiveFilter(filterVal);
        });
    });

    // Nav category clicks
    document.querySelectorAll('.nav-links a[data-category]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const cat = link.getAttribute('data-category');
            setActiveFilter(cat);
        });
    });

    // Cart icon and sidebar
    document.getElementById("cartIconBtn").addEventListener("click", openCartSidebar);
    document.getElementById("closeCartBtn").addEventListener("click", closeCartSidebar);
    document.getElementById("cartOverlay").addEventListener("click", (e) => {
        if (e.target === document.getElementById("cartOverlay")) closeCartSidebar();
    });
    document.getElementById("checkoutBtn").addEventListener("click", handleCheckout);
    
    setActiveFilter("all");
});