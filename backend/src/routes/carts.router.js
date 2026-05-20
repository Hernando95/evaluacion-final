const { Router } = require('express');
const CartManagerDB = require('../dao/db/CartManagerDB');

const router = Router();
const manager = new CartManagerDB();

// POST /api/carts — Crear carrito
router.post('/', async (req, res) => {
  try {
    const cart = await manager.create();
    res.status(201).json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET /api/carts/:cid — Listar productos con populate
router.get('/:cid', async (req, res) => {
  try {
    const cart = await manager.getById(req.params.cid);
    if (!cart)
      return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// POST /api/carts/:cid/products/:pid — Agregar producto (o incrementar cantidad)
router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const cart = await manager.addProduct(req.params.cid, req.params.pid, quantity);
    if (!cart)
      return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// PUT /api/carts/:cid/products/:pid — Actualizar cantidad específica
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1)
      return res.status(400).json({ status: 'error', error: 'Cantidad inválida' });
      
    const cart = await manager.updateProductQuantity(req.params.cid, req.params.pid, quantity);
    if (!cart)
      return res.status(404).json({ status: 'error', error: 'Producto o Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// DELETE /api/carts/:cid/products/:pid — Eliminar producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await manager.deleteProduct(req.params.cid, req.params.pid);
    if (!cart)
      return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// PUT /api/carts/:cid — Actualizar todos los productos del carrito
router.put('/:cid', async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products))
      return res.status(400).json({ status: 'error', error: 'Se espera un array de productos' });
    const cart = await manager.updateProducts(req.params.cid, products);
    if (!cart)
      return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// PUT /api/carts/:cid/products/:pid — Actualizar cantidad de un producto
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity < 1)
      return res.status(400).json({ status: 'error', error: 'Cantidad inválida' });
    const cart = await manager.updateProductQuantity(req.params.cid, req.params.pid, quantity);
    if (!cart)
      return res.status(404).json({ status: 'error', error: 'Carrito o producto no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// DELETE /api/carts/:cid — Vaciar carrito
router.delete('/:cid', async (req, res) => {
  try {
    const cart = await manager.clearCart(req.params.cid);
    if (!cart)
      return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

const ProductManagerDB = require('../dao/db/ProductManagerDB');
const productManager = new ProductManagerDB();
const Ticket = require('../models/ticket.model');
const crypto = require('crypto');

// POST /api/carts/:cid/purchase — Finalizar compra
router.post('/:cid/purchase', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await manager.getById(cartId);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    if (cart.products.length === 0) {
      return res.status(400).json({ status: 'error', error: 'El carrito está vacío' });
    }

    const purchaser = req.session?.user?.email || 'anonimo@tienda.com';
    let totalAmount = 0;
    const itemsToPurchase = [];
    const itemsOutOfStock = [];

    // Validar stock de cada producto
    for (const item of cart.products) {
      if (!item.product || !item.product._id) {
        itemsOutOfStock.push(item);
        continue;
      }
      const product = await productManager.getById(item.product._id);
      if (product && product.stock >= item.quantity) {
        // Hay stock suficiente
        product.stock -= item.quantity;
        await productManager.update(product._id, { stock: product.stock });
        totalAmount += product.price * item.quantity;
        itemsToPurchase.push(item.product._id);
      } else {
        // No hay stock o es insuficiente
        itemsOutOfStock.push(item);
      }
    }

    if (itemsToPurchase.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'No hay stock suficiente de los productos seleccionados',
        outOfStock: itemsOutOfStock.map(i => i.product ? i.product._id : null).filter(Boolean)
      });
    }

    // Generar Ticket con detalles de productos
    const purchasedProductDetails = [];
    for (const item of cart.products) {
      if (itemsToPurchase.includes(item.product._id)) {
        purchasedProductDetails.push({
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity
        });
      }
    }

    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    const ticket = await Ticket.create({
      code,
      amount: totalAmount,
      purchaser,
      products: purchasedProductDetails
    });

    // Actualizar carrito (quitar comprados, dejar los que no tienen stock)
    const remainingProducts = itemsOutOfStock
      .filter(item => item.product && item.product._id)
      .map(item => ({ product: item.product._id, quantity: item.quantity }));
      
    await manager.updateProducts(cartId, remainingProducts);

    res.json({ 
      status: 'success', 
      payload: { 
        ticket: {
          ...ticket.toObject(),
          purchase_datetime: ticket.purchase_datetime.toLocaleDateString('es-CO') + ' ' + ticket.purchase_datetime.toLocaleTimeString('es-CO')
        }, 
        outOfStock: itemsOutOfStock.map(i => i.product._id) 
      } 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

module.exports = router;
