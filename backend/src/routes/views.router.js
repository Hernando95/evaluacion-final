const express = require('express');
const router = express.Router();
const ProductManager = require('../dao/db/ProductManagerDB');
const CartManager = require('../dao/db/CartManagerDB');

const productManager = new ProductManager();
const cartManager = new CartManager();

// Middlewares de protección
const publicRoute = (req, res, next) => {
  if (req.session.user) return res.redirect('/products');
  next();
};

const privateRoute = (req, res, next) => {
  if (!req.session.user) return res.redirect('/login');
  next();
};

// ─── Vistas de Auth ────────────────────────────────────────────────────────────
router.get('/login', publicRoute, (req, res) => {
  res.render('login');
});

router.get('/register', publicRoute, (req, res) => {
  res.render('register');
});

// ─── Vistas de Productos ───────────────────────────────────────────────────────
router.get('/products', privateRoute, async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const result = await productManager.getAll({ limit, page, sort, query });

    res.render('products', {
      products: result.payload,
      pagination: {
        page: result.page,
        totalPages: result.totalPages,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
        nextLink: result.hasNextPage ? `/products?page=${result.nextPage}&limit=${limit}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
      },
      user: req.session.user, // Pasar el usuario a la vista
    });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

router.get('/products/:pid', privateRoute, async (req, res) => {
  try {
    const product = await productManager.getById(req.params.pid);
    res.render('productDetail', { product, user: req.session.user });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

const adminRoute = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('error', { message: 'Acceso denegado. Solo administradores pueden ver esta página.' });
  }
  next();
};

// ─── Vistas de Administrador ───────────────────────────────────────────────────
router.get('/admin/products', adminRoute, async (req, res) => {
  try {
    const result = await productManager.getAll({ limit: 100, page: 1 });
    res.render('adminProducts', { products: result.payload, user: req.session.user });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

const Ticket = require('../models/ticket.model');

// ─── Vista de Ticket de Compra ────────────────────────────────────────────────
router.get('/ticket/:tid', privateRoute, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ code: req.params.tid }).lean();
    if (!ticket) return res.status(404).render('error', { message: 'Ticket no encontrado' });
    
    res.render('ticket', { 
      ticket: {
        ...ticket,
        purchase_datetime: ticket.purchase_datetime.toLocaleString('es-CO')
      }, 
      user: req.session.user,
      outOfStock: req.query.outOfStock ? req.query.outOfStock.split(',') : []
    });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// ─── Vistas de Carrito ─────────────────────────────────────────────────────────
router.get('/carts/:cid', privateRoute, async (req, res) => {
  try {
    const cart = await cartManager.getById(req.params.cid);
    if (!cart) {
      return res.status(404).send(`
        <script>
          localStorage.removeItem('cartId');
          alert('Tu carrito expiró o no existe. Te redirigimos al catálogo para crear uno nuevo.');
          window.location.href = '/products';
        </script>
      `);
    }
    
    let cartTotal = 0;
    if (cart.products) {
      cart.products.forEach(item => {
        if (item.product && item.product.price) {
          cartTotal += item.product.price * item.quantity;
        }
      });
    }

    res.render('cart', { cart, cartTotal, user: req.session.user });
  } catch (err) {
    res.status(500).render('error', { message: err.message });
  }
});

// Raíz redirige a productos
router.get('/', (req, res) => {
  res.redirect('/products');
});

module.exports = router;
