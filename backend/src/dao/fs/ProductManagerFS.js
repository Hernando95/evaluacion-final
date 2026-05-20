const fs = require('fs').promises;
const path = require('path');

class ProductManagerFS {
  constructor() {
    this.path = path.join(__dirname, '..', '..', 'data', 'products.json');
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

  async getAll({ limit = 10, page = 1, query, sort } = {}) {
    let products = await this._readData();

    if (query) {
      products = products.filter(
        (p) =>
          p.category?.toLowerCase() === query.toLowerCase() ||
          String(p.status) === query
      );
    }

    if (sort === 'asc') products.sort((a, b) => a.price - b.price);
    if (sort === 'desc') products.sort((a, b) => b.price - a.price);

    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const payload = products.slice(offset, offset + limit);

    return {
      status: 'success',
      payload,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      page,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }

  async getById(id) {
    const products = await this._readData();
    return products.find((p) => p.id === id) || null;
  }

  async create(data) {
    const products = await this._readData();
    const newProduct = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      code: data.code,
      price: Number(data.price),
      status: data.status !== undefined ? data.status : true,
      stock: Number(data.stock),
      category: data.category,
      thumbnails: data.thumbnails || [],
    };
    products.push(newProduct);
    await this._writeData(products);
    return newProduct;
  }

  async update(id, data) {
    const products = await this._readData();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const { id: _id, ...rest } = data; // nunca pisar el ID
    products[idx] = { ...products[idx], ...rest };
    await this._writeData(products);
    return products[idx];
  }

  async delete(id) {
    const products = await this._readData();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    products.splice(idx, 1);
    await this._writeData(products);
    return true;
  }
}

module.exports = ProductManagerFS;
