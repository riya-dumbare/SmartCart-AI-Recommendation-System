const products = [
  { id: 1, name: "Galaxy Ultra Phone", category: "Mobiles", price: 899, rating: 4.8, imageIcon: "fas fa-mobile-alt", desc: "6.8” AMOLED, 200MP camera, 5000mAh", specs: "Snapdragon 8 Gen 2, 256GB" },
  { id: 2, name: "AirBoost Pro Laptop", category: "Laptops", price: 1299, rating: 4.7, imageIcon: "fas fa-laptop", desc: "16GB RAM, 1TB SSD, RTX 4060", specs: "Intel i9, 16\" 4K" },
  { id: 3, name: "Wireless Noise Cancelling Headphones", category: "Headphones", price: 249, rating: 4.9, imageIcon: "fas fa-headphones", desc: "40h battery, Hi-Res audio", specs: "Bluetooth 5.3, ANC" },
  { id: 4, name: "Smart Watch X7", category: "Smart Watches", price: 199, rating: 4.5, imageIcon: "fas fa-clock", desc: "Heart rate, GPS, AMOLED", specs: "1.7\" display" },
  { id: 5, name: "Mechanical RGB Keyboard", category: "Accessories", price: 89, rating: 4.6, imageIcon: "fas fa-keyboard", desc: "RGB backlit, programmable keys", specs: "USB-C, hot-swappable" },
  { id: 6, name: "Ergonomic Mouse", category: "Accessories", price: 39, rating: 4.4, imageIcon: "fas fa-mouse", desc: "Wireless, 4000 DPI", specs: "Silent click" },
  { id: 7, name: "Gaming Laptop Zephyr", category: "Laptops", price: 1599, rating: 4.9, imageIcon: "fas fa-laptop-code", desc: "240Hz display, RTX 4070", specs: "32GB RAM" },
  { id: 8, name: "True Wireless Earbuds", category: "Headphones", price: 129, rating: 4.7, imageIcon: "fas fa-bluetooth", desc: "Active noise cancellation, IPX7", specs: "30h battery" },
  { id: 9, name: "Foldable Phone X", category: "Mobiles", price: 1499, rating: 4.6, imageIcon: "fas fa-mobile-alt", desc: "Foldable display, 512GB", specs: "Snapdragon 8+" },
  { id: 10, name: "Smart Watch Ultra", category: "Smart Watches", price: 349, rating: 4.8, imageIcon: "fas fa-clock", desc: "ECG, SpO2, titanium", specs: "5ATM water resistant" },
  { id: 11, name: "Laptop Cooling Pad", category: "Accessories", price: 45, rating: 4.3, imageIcon: "fas fa-fan", desc: "RGB fans, ergonomic lift", specs: "USB powered" },
  { id: 12, name: "Premium Laptop Bag", category: "Accessories", price: 59, rating: 4.5, imageIcon: "fas fa-briefcase", desc: "Waterproof, 15.6\" laptop compartment", specs: "Anti-theft" },
  { id: 13, name: "Office Wireless Mouse", category: "Accessories", price: 29, rating: 4.4, imageIcon: "fas fa-mouse", desc: "Silent clicks, ergonomic", specs: "2.4GHz" }
];

// AI recommendation logic : based on view context or last interacted category
let currentUserInterests = [];  // stores category viewed
let lastViewedProductId = null;

// cart state
let cart = JSON.parse(localStorage.getItem('smartcart_cart')) || [];

// helper: save cart & update badge
function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartCountBadge');
  if (badge) badge.innerText = totalItems;
  localStorage.setItem('smartcart_cart', JSON.stringify(cart));
}

// add to cart
function addToCart(productId, qty = 1) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...product, quantity: qty });
  }
  updateCartBadge();
  alert(`${product.name} added to cart!`);
}

// remove from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCartBadge();
  renderCurrentPage(); // rerender current page (cart or home etc)
}

// AI Recommended products based on user's last viewed product category or interest
function getAIRecommendations(limit = 4) {
  if (lastViewedProductId) {
    const viewedProduct = products.find(p => p.id === lastViewedProductId);
    if (viewedProduct) {
      const cat = viewedProduct.category;
      // define companion mapping: Laptop -> accessories, mobiles -> earphones etc
      let companionIds = [];
      if (cat === 'Laptops') companionIds = [5,6,11,12]; // keyboard, mouse, cooling pad, laptop bag
      else if (cat === 'Mobiles') companionIds = [3,8,10]; // headphones, earbuds, smartwatch
      else if (cat === 'Headphones') companionIds = [5,4,6];
      else if (cat === 'Smart Watches') companionIds = [3,8];
      else if (cat === 'Accessories') companionIds = [2,7,1];
      else companionIds = [1,2,3];
      
      let recs = companionIds.map(id => products.find(p => p.id === id)).filter(p => p && p.id !== viewedProduct.id);
      // fill more if less
      while(recs.length < limit) {
        recs.push(products[Math.floor(Math.random() * products.length)]);
      }
      return recs.slice(0, limit);
    }
  }
  // Default: return top rated or trending
  return products.sort((a,b) => b.rating - a.rating).slice(0, limit);
}

// ---------- RENDERING PAGES (SPA) ----------
const appContainer = document.getElementById('app');

function renderHomePage() {
  const featured = products.slice(0, 6);
  const aiRecs = getAIRecommendations(4);
  const categories = ['Mobiles','Laptops','Accessories','Smart Watches','Headphones'];
  const categoryIcons = {'Mobiles':'fa-mobile-alt','Laptops':'fa-laptop','Accessories':'fa-plug','Smart Watches':'fa-clock','Headphones':'fa-headphones'};
  
  const html = `
    <div class="hero">
      <div class="hero-content">
        <span class="hero-badge">⚡ AI-Powered Smart Recommendations</span>
        <h1>Next-Gen Electronics</h1>
        <p>Discover the future of tech with SmartCart’s intelligent engine.</p>
        <button class="btn-primary" onclick="filterByCategory('Laptops')">Shop Now <i class="fas fa-arrow-right"></i></button>
      </div>
      <div class="hero-img"><i class="fas fa-robot" style="font-size: 5rem; color:#3b82f6;"></i></div>
    </div>
    
    <div class="section-title"><i class="fas fa-th-large"></i> Featured Categories</div>
    <div class="categories-grid">
      ${categories.map(cat => `
        <div class="cat-card" onclick="filterByCategory('${cat}')">
          <i class="fas ${categoryIcons[cat]}"></i>
          <h4>${cat}</h4>
        </div>
      `).join('')}
    </div>

    <div class="section-title"><i class="fas fa-star"></i> Featured Products</div>
    <div class="products-grid">
      ${featured.map(p => renderProductCard(p)).join('')}
    </div>

    <div class="ai-section">
      <div class="ai-header">
        <i class="fas fa-brain"></i>
        <h2>🤖 AI Recommended For You</h2>
        <span style="margin-left: auto; font-size:0.8rem; background:#fff; padding:4px 12px; border-radius:40px;">Based on your recent views</span>
      </div>
      <div class="products-grid" style="margin:0">
        ${aiRecs.map(p => renderProductCard(p)).join('')}
      </div>
    </div>

    <div class="offer-banner">
      <div><i class="fas fa-tag"></i> <strong>Limited Deal:</strong> Up to 30% off on premium accessories</div>
      <button class="btn-outline" style="background:white;" onclick="filterByCategory('Accessories')">Grab Now →</button>
    </div>
  `;
  appContainer.innerHTML = html;
}

// product card helper
function renderProductCard(product) {
  return `
    <div class="product-card">
      <div class="product-img"><i class="${product.imageIcon} fa-3x"></i></div>
      <div class="product-title">${product.name}</div>
      <div class="rating">${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 ? '½' : ''} ${product.rating}</div>
      <div class="product-price">$${product.price}</div>
      <div class="card-actions">
        <button class="btn-cart" onclick="addToCart(${product.id},1); renderCurrentPage();">Add to Cart</button>
        <button class="btn-wishlist" onclick="viewProductDetails(${product.id})"><i class="far fa-heart"></i></button>
      </div>
    </div>
  `;
}

function renderProductListing(filterCat = null) {
  let filtered = [...products];
  if (filterCat && filterCat !== 'All') filtered = products.filter(p => p.category === filterCat);
  const html = `
    <div style="margin: 2rem 2rem 0 2rem; display:flex; justify-content: space-between; align-items:center;">
      <h2><i class="fas fa-list-ul"></i> ${filterCat ? filterCat : 'All'} Electronics</h2>
      <button class="btn-outline" onclick="renderHomePage()"><i class="fas fa-home"></i> Back to Home</button>
    </div>
    <div class="products-grid">
      ${filtered.map(p => renderProductCard(p)).join('')}
    </div>
  `;
  appContainer.innerHTML = html;
}

function viewProductDetails(productId) {
  lastViewedProductId = productId;   // store for AI refresh
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const similar = products.filter(p => p.category === product.category && p.id !== productId).slice(0, 3);
  const html = `
    <div class="product-detail">
      <div class="detail-img"><i class="${product.imageIcon} fa-6x"></i></div>
      <div class="detail-info">
        <h1>${product.name}</h1>
        <div class="rating">${'★'.repeat(Math.floor(product.rating))} ${product.rating}</div>
        <h2>$${product.price}</h2>
        <p><strong>Description:</strong> ${product.desc}</p>
        <p><strong>Specifications:</strong> ${product.specs}</p>
        <div style="display:flex; gap:1rem; margin-top:1.5rem;">
          <button class="btn-primary" onclick="addToCart(${product.id},1); renderCurrentPage();">🛒 Add to Cart</button>
          <button class="btn-primary" style="background:#10b981;" onclick="alert('Proceed to Buy (demo)');">Buy Now</button>
        </div>
      </div>
    </div>
    <div class="section-title"><i class="fas fa-sync-alt"></i> Similar Products</div>
    <div class="products-grid">
      ${similar.map(p => renderProductCard(p)).join('')}
    </div>
  `;
  appContainer.innerHTML = html;
}

function renderCartPage() {
  if (cart.length === 0) {
    appContainer.innerHTML = `<div class="cart-container"><h2>Your Cart is Empty</h2><button class="btn-primary" onclick="renderHomePage()">Continue Shopping</button></div>`;
    return;
  }
  let total = 0;
  const itemsHtml = cart.map(item => {
    total += item.price * item.quantity;
    return `
      <div class="cart-item">
        <div><strong>${item.name}</strong><br>$${item.price}</div>
        <div><input type="number" min="1" value="${item.quantity}" style="width:70px;" onchange="updateQuantity(${item.id}, this.value)"></div>
        <div>$${(item.price * item.quantity).toFixed(2)}</div>
        <button class="btn-outline" onclick="removeFromCart(${item.id}); renderCurrentPage();">Remove</button>
      </div>
    `;
  }).join('');
  const html = `
    <div class="cart-container">
      <h2><i class="fas fa-shopping-cart"></i> Your Cart</h2>
      ${itemsHtml}
      <div class="cart-total">Total: $${total.toFixed(2)}</div>
      <button class="btn-primary" style="margin-top:1rem;" onclick="alert('Checkout Simulated (Project Demo)')">Proceed to Checkout</button>
      <button class="btn-outline" style="margin-left:1rem;" onclick="renderHomePage()">Continue Shopping</button>
    </div>
  `;
  appContainer.innerHTML = html;
}

window.updateQuantity = (id, newQty) => {
  const qty = parseInt(newQty);
  if (qty > 0) {
    const item = cart.find(i => i.id === id);
    if (item) item.quantity = qty;
    updateCartBadge();
    renderCartPage();
  }
};

window.filterByCategory = (category) => {
  renderProductListing(category);
};

window.viewProductDetails = (id) => {
  viewProductDetails(id);
};

window.renderCurrentPage = () => {
  const path = window.location.hash;
  if (path === '#cart') renderCartPage();
  else if (path === '#products') renderProductListing();
  else renderHomePage();
};

// Navigation & Search
document.getElementById('cartIconNav')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.hash = '#cart';
  renderCartPage();
});
document.getElementById('loginRegisterBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('authModal').style.display = 'flex';
});
document.querySelector('.close-modal')?.addEventListener('click', () => {
  document.getElementById('authModal').style.display = 'none';
});
window.addEventListener('click', (e) => {
  const modal = document.getElementById('authModal');
  if (e.target === modal) modal.style.display = 'none';
});
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const formId = btn.dataset.form === 'login' ? 'loginForm' : 'registerForm';
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active-form'));
    document.getElementById(formId).classList.add('active-form');
  });
});
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
  e.preventDefault(); alert('Logged in (demo)'); document.getElementById('authModal').style.display = 'none';
});
document.getElementById('registerForm')?.addEventListener('submit', (e) => {
  e.preventDefault(); alert('Registered (demo)'); document.getElementById('authModal').style.display = 'none';
});

// search logic
document.getElementById('searchInput')?.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
  if (query.length > 0) {
    const html = `
      <div style="margin:2rem"><h2>Search results for "${query}"</h2>
      <div class="products-grid">${filtered.map(p => renderProductCard(p)).join('')}</div>
      <button class="btn-primary" onclick="renderHomePage()">Back to Home</button></div>
    `;
    appContainer.innerHTML = html;
  } else {
    renderHomePage();
  }
});

// INIT and hash change
// Page Load Initialization
window.addEventListener("load", () => {
  updateCartBadge();
  renderHomePage();
});

// Hash Change Support
window.addEventListener("hashchange", () => {
  renderCurrentPage();
});