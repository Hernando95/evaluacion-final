const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  purchase_datetime: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true },
  products: [
    {
      title: String,
      price: Number,
      quantity: Number
    }
  ]
});

module.exports = mongoose.model('Ticket', ticketSchema);
