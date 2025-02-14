const { Router } = require('express');
const router = Router();
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const Bill = require('../models/bill');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const validator = require('validator');

router.post('/generateNewBill', async (req, res) => {
    try {
        console.log('generating bill');
        const { billData, pagado } = req.body;
        const { orderId } = billData;
        console.log(orderId);
        console.log(pagado);
        const order = await Order.findById(orderId).populate('userId');
        if (!order) {
            return res.status(400).json({ message: 'No se encontró el pedido' });
        }
        const newBill = new Bill({ 
            orderId: order._id,
            userId: order.userId._id,
            items: order.items.map(item => ({
                productId: item.productId,
                desc: item.desc,
                quantity: item.quantity,
                price: 1.21 * item.price,
                totalPrice: item.price * 1.21 * item.quantity,
            })),
            total: order.total * 1.21,           
        }); 
        console.log('Factura a guardar', newBill);
        await newBill.save();
        const token = jwt.sign({ _id: newBill._id }, 'secretKey');
        const status = 'Facturado';
        await Order.findByIdAndUpdate(orderId, { status });
        if (pagado == false) {
            const userStatus = 'Moroso';
            await User.findByIdAndUpdate(order.userId._id, { status: userStatus });
        }
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error generating bill', error: error.message });
    }
});

module.exports = router;