const { Router } = require('express');
const ProductManagerDB = require('../dao/db/ProductManagerDB');

const router = Router();
const manager = new ProductManagerDB();

// GET /api/products?limit=10&page=1&query=categoria&sort=asc
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, query, sort } = req.query;
    const result = await manager.getAll({ limit, page, query, sort });

    // Construir prevLink / nextLink
    const base = `${req.protocol}://${req.get('host')}/api/products`;
    const buildLink = (p) =>
      p
        ? `${base}?limit=${limit}&page=${p}${query ? `&query=${query}` : ''}${sort ? `&sort=${sort}` : ''}`
        : null;

    res.json({
      ...result,
      prevLink: buildLink(result.prevPage),
      nextLink: buildLink(result.nextPage),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
  try {
    const product = await manager.getById(req.params.pid);
    if (!product)
      return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: product });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const required = ['title', 'description', 'code', 'price', 'stock', 'category'];
    const missing = required.filter((f) => !req.body[f]);
    if (missing.length)
      return res.status(400).json({ status: 'error', error: `Faltan campos: ${missing.join(', ')}` });

    if (!req.body.sku) req.body.sku = req.body.code;
    
    const product = await manager.create(req.body);

    // Notificar por WebSocket a todos los clientes
    req.io.emit('newProduct', product);

    res.status(201).json({ status: 'success', payload: product });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ status: 'error', error: 'El código del producto ya existe' });
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
  try {
    const updated = await manager.update(req.params.pid, req.body);
    if (!updated)
      return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: updated });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
  try {
    const deleted = await manager.delete(req.params.pid);
    if (!deleted)
      return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });

    // Notificar por WebSocket
    req.io.emit('deleteProduct', req.params.pid);

    res.json({ status: 'success', payload: `Producto ${req.params.pid} eliminado` });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

module.exports = router;
