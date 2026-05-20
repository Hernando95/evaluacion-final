// Conexión al servidor de Socket.io
const socket = io();

// ─── Gestión de UI (Side Drawer) ──────────────────────────────────────────────
const menuBtn = document.getElementById('menuBtn');
const closeDrawer = document.getElementById('closeDrawer');
const sideDrawer = document.getElementById('sideDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');

if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    sideDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Evitar scroll al estar abierto
  });
}

const hideDrawer = () => {
  sideDrawer.classList.remove('active');
  drawerOverlay.classList.remove('active');
  document.body.style.overflow = '';
};

if (closeDrawer) closeDrawer.addEventListener('click', hideDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', hideDrawer);

// ─── Toast System ────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'check-circle' : 'alert-circle';
  toast.innerHTML = `
    <i data-lucide="${icon}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── Gestión de Carrito (LocalStorage) ────────────────────────────────────────
async function initCart() {
  let cartId = localStorage.getItem('cartId');
  
  if (!cartId) {
    try {
      const res = await fetch('/api/carts', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        cartId = data.payload._id;
        localStorage.setItem('cartId', cartId);
        console.log('🛒 Carrito inicializado:', cartId);
      }
    } catch (err) {
      console.error('❌ Error al inicializar carrito:', err);
    }
  }
  
  updateCartBadge();
  updateCartLink();
}

async function updateCartBadge() {
  const cartId = localStorage.getItem('cartId');
  const badge = document.getElementById('cartCount');
  if (!cartId || !badge) return;

  try {
    const res = await fetch(`/api/carts/${cartId}`);
    const data = await res.json();
    if (data.status === 'success') {
      const count = data.payload.products.reduce((acc, p) => acc + p.quantity, 0);
      badge.textContent = count;
    } else {
      // Si el carrito no existe (ej. fue borrado en la BD), limpiar localStorage
      localStorage.removeItem('cartId');
      location.reload(); // Recargar para crear uno nuevo
    }
  } catch (err) {
    console.error('❌ Error al actualizar badge:', err);
  }
}


function updateCartLink() {
  const cartId = localStorage.getItem('cartId');
  const link = document.getElementById('cartLink');
  if (cartId && link) {
    link.href = `/carts/${cartId}`;
  }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', initCart);

// ─── WebSockets ───────────────────────────────────────────────────────────────
socket.on('newProduct', (product) => {
  console.log('🆕 Nuevo producto agregado:', product.title);
  const list = document.getElementById('productList');
  if (!list) return;

  const empty = list.querySelector('.empty');
  if (empty) empty.remove();

  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.id = product._id;
  card.innerHTML = `
    <div class="product-img placeholder">🖼️</div>
    <div class="product-info">
      <h3>${product.title}</h3>
      <p class="category">${product.category}</p>
      <p class="price">$${product.price}</p>
      <p class="stock">Stock: ${product.stock}</p>
    </div>
    <div class="product-actions">
      <a href="/products/${product._id}" class="btn btn-secondary">Ver detalle</a>
    </div>
  `;
  list.prepend(card);
});

socket.on('deleteProduct', (productId) => {
  console.log('🗑️ Producto eliminado:', productId);
  const card = document.querySelector(`[data-id="${productId}"]`);
  if (card) {
    card.style.transition = 'opacity 0.3s';
    card.style.opacity = '0';
    setTimeout(() => card.remove(), 300);
  }
});
