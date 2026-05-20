const Product = require('../../models/product.model');

class ProductManagerDB {
  async getAll({ limit = 10, page = 1, query, sort } = {}) {
    const filter = {};
    if (query) {
      // Puede filtrar por categoría o por disponibilidad (true/false)
      if (query === 'true' || query === 'false') {
        filter.status = query === 'true';
      } else {
        filter.category = { $regex: query, $options: 'i' };
      }
    }

    const options = {
      limit: Number(limit),
      page: Number(page),
      lean: true,
    };

    if (sort === 'asc') options.sort = { price: 1 };
    if (sort === 'desc') options.sort = { price: -1 };

    const result = await Product.paginate(filter, options);

    return {
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
    };
  }

  async getById(id) {
    return await Product.findById(id).lean();
  }

  async create(data) {
    const product = new Product(data);
    return await product.save();
  }

  async update(id, data) {
    const { _id, ...rest } = data; // nunca pisar el ID
    return await Product.findByIdAndUpdate(id, rest, { new: true }).lean();
  }

  async delete(id) {
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  }
}

module.exports = ProductManagerDB;
