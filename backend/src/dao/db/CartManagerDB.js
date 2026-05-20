const Cart = require('../../models/cart.model');

class CartManagerDB {
  async create() {
    const cart = new Cart({ products: [] });
    return await cart.save();
  }

  async getById(id) {
    return await Cart.findById(id).populate('products.product').lean();
  }

  async addProduct(cartId, productId, quantity = 1) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const existing = cart.products.find(
      (p) => p.product.toString() === productId
    );

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.products.push({ product: productId, quantity: Number(quantity) });
    }

    return await cart.save();
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === productId
    );

    if (productIndex !== -1) {
      cart.products[productIndex].quantity = Number(quantity);
      return await cart.save();
    }
    return null;
  }

  async deleteProduct(cartId, productId) {
    return await Cart.findByIdAndUpdate(
      cartId,
      { $pull: { products: { product: productId } } },
      { new: true }
    ).lean();
  }

  async updateProducts(cartId, products) {
    return await Cart.findByIdAndUpdate(
      cartId,
      { products },
      { new: true }
    ).lean();
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const item = cart.products.find(
      (p) => p.product.toString() === productId
    );
    if (!item) return null;

    item.quantity = quantity;
    return await cart.save();
  }

  async clearCart(cartId) {
    return await Cart.findByIdAndUpdate(
      cartId,
      { products: [] },
      { new: true }
    ).lean();
  }
}

module.exports = CartManagerDB;
