const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    id: String,
    item: String,
    price: Number,
    fulfillment: String,
    details: String,
    payment: String,
    status: String,
    timeLeft: Number,
    delivered: Boolean,
    date: String
});

module.exports = mongoose.model('Order', orderSchema);