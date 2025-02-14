const Bill = require('../models/bill');
const Order = require('../models/order');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.generateNewBill = async (req, res) => {
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
}

exports.getBills = async (req, res) => {
    try {
        console.log('Entramos a getBills');
        const { dateStart, dateEnd } = req.query;

        // Validación de parámetros
        if (!dateStart || !dateEnd) {
            return res.status(400).json({ message: 'Debes ingresar un rango de fechas válido' });
        }

        let startDate = new Date(dateStart);
        let endDate = new Date(dateEnd);

        // Verificar si las fechas son válidas
        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({ message: 'Formato de fecha inválido' });
        }

        // Ajustar endDate para incluir todo el día hasta las 23:59:59.999
        endDate.setHours(23, 59, 59, 999);

        // Validaciones lógicas
        if (startDate > endDate) {
            return res.status(401).json({ message: 'La fecha de inicio debe ser menor o igual a la fecha de fin' });
        }

        const now = new Date();
        if (startDate > now) {
            return res.status(402).json({ message: 'La fecha de inicio no puede ser mayor a la fecha actual' });
        }

        // Obtener facturas dentro del rango
        const bills = await Bill.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate('userId');

        if (!bills || bills.length === 0) {
            return res.status(403).json({ message: 'No se encontraron facturas' });
        }
        console.log('Facturas encontradas:', bills.length);

        // Calcular total recaudado
        const totalRecaudado = bills.reduce((acc, bill) => acc + (bill.total || 0), 0);

        res.status(200).json({ bills, totalRecaudado });
    } catch (error) {
        console.error('Error en getBills:', error);
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};
