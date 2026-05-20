const fs = require('fs').promises;
const path = require('path');

class CartManagerFS {
  constructor() {
    this.path = path.join(__dirname, '..', '..', 'data', 'carts.json');
    this._ensureFile();
  }

  async _ensureFile() {
    try {
      await fs.mkdir(path.dirname(this.path), { recursive: true });
      await fs.access(this.path);
    } catch {
      await fs.writeFile(this.path, JSON.stringify([], null, 2));
    }
  }

  async _readData() {
    const raw = await fs.readFile(this.path, 'utf-8');
    return JSON.parse(raw);
  }

  async _writeData(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  async create() {
    const carts = await this._readData();
    const newCart = { id: Date.now().toString(), products: [] };
    carts.push(newCart);
    await this._writeData(carts);
    return newCart;
  }

  async getById(id) {
    const carts = await this._readData();
    return carts.find((c) => c.id === id) || null;
  }

  async addProduct(cartId, productId) {
    const carts = await this._readData();
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return null;
    const existing = cart.products.find((p) => p.product === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }
    await this._writeData(carts);
    return cart;
  }

  async deleteProduct(cartId, productId) {
    const carts = await this._readData();
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return null;
    cart.products = cart.products.filter((p) => p.product !== productId);
    await this._writeData(carts);
    return cart;
  }

  async updateProducts(cartId, products) {
    const carts = await this._readData();
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return null;
    cart.products = products;
    await this._writeData(carts);
    return cart;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const carts = await this._readData();
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return null;
    const item = cart.products.find((p) => p.product === productId);
    if (!item) return null;
    item.quantity = quantity;
    await this._writeData(carts);
    return cart;
  }

  async clearCart(cartId) {
    const carts = await this._readData();
    const cart = carts.find((c) => c.id === cartId);
    if (!cart) return null;
    cart.products = [];
    await this._writeData(carts);
    return cart;
  }
}

module.exports = CartManagerFS;
