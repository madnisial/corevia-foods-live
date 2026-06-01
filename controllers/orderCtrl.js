const Order = require('../models/Order');

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) { res.status(500).json(err); }
};

const createOrder = async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) { res.status(400).json(err); }
};

const updateOrder = async (req, res) => {
    try {
        await Order.findOneAndUpdate({ id: req.params.id }, req.body);
        res.json({ message: "Order Updated" });
    } catch (err) { res.status(400).json(err); }
};

module.exports = { getOrders, createOrder, updateOrder };