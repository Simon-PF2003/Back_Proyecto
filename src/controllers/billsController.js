const Bill = require('../models/bill');
const Order = require('../models/order');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

//POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS

async function generateNewBill(req, res) {
    try {
        console.log('generating bill');
        const { billData, pagado } = req.body;
        const { orderId } = billData;

        const order = await Order.findById(orderId).populate('userId');
        if (!order) {
            return res.status(400).json({ message: 'No se encontró el pedido' });
        }
        
        const newBill = new Bill({ 
            orderId: order._id,
            userId: order.userId._id,
            items: order.items.map(item => ({
                productId: item._id,
                desc: item.desc,
                quantity: item.quantity,
                price: 1.21 * item.price,
                totalPrice: item.price * 1.21 * item.quantity,
            })),
            total: order.total * 1.21,           
        }); 

        await newBill.save();
        
        const status = 'Facturado';
        await Order.findByIdAndUpdate(orderId, { status });

        if (pagado == false) {
            const userStatus = 'Moroso';
            await User.findByIdAndUpdate(order.userId._id, { status: userStatus });
        }

        const pdfFile = await generateAndSavePDF(newBill._id);

        res.setHeader('Content-Disposition', 'attachment; filename="factura.pdf"');
        res.setHeader('Content-Type', 'application/pdf');
        res.status(200).send(Buffer.from(pdfFile));
    } catch (error) {
        res.status(500).json({ message: 'Error generating bill', error: error.message });
    }
}

//Función Privada (no se exporta. Solo sirve para que acceda la función de arriba)
async function generateAndSavePDF(billId) {
    try {
        console.log('Generating PDF for bill ID:', billId);
        const bill = await Bill.findById(billId).populate('userId');
        if (!bill) {
            throw new Error('No se encontró la factura');
        }
        
        const templatePath = path.join(__dirname, '../templates/factura-rellenable.pdf');
        const existingPdfBytes = fs.readFileSync(templatePath);

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();

        const formattedDate = new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }).format(new Date(bill.createdAt));

        form.getTextField('_id').setText(bill._id.toString());
        form.getTextField('bill_date').setText(formattedDate);
        form.getTextField('businessName').setText(bill.userId.businessName);
        form.getTextField('address').setText(bill.userId.address);
        form.getTextField('cuit').setText(bill.userId.cuit.toString());
        form.getTextField('total').setText(bill.total.toFixed(2).toString());
        form.getTextField('IVA').setText((bill.total * 0.21).toFixed(2).toString());
        form.getTextField('subtotal').setText((bill.total / 1.21).toFixed(2).toString());

        bill.items.forEach((item, index) => { 
            if (index < 18) {
                form.getTextField(`_id${index + 1}`).setText(item.productId);
                form.getTextField(`cant${index + 1}`).setText(item.quantity.toString());
                form.getTextField(`desc${index + 1}`).setText(item.desc);
                form.getTextField(`iva${index + 1}`).setText('21%');
                form.getTextField(`precio${index + 1}`).setText(item.price.toFixed(2).toString() + '$');
                form.getTextField(`importe${index + 1}`).setText(item.totalPrice.toFixed(2).toString() + '$');
            }
        });

        form.flatten();

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

// GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS
async function getBills(req, res) {
    try {
        console.log('Entramos a getBills');
        const { dateStart, dateEnd } = req.query;


        if (!dateStart || !dateEnd) {
            return res.status(400).json({ message: 'Debes ingresar un rango de fechas válido' });
        }

        let startDate = new Date(dateStart);
        let endDate = new Date(dateEnd);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({ message: 'Formato de fecha inválido' });
        }

        // Ajustar endDate para incluir todo el día hasta las 23:59:59.999
        endDate.setHours(23, 59, 59, 999);

        if (startDate > endDate) {
            return res.status(401).json({ message: 'La fecha de inicio debe ser menor o igual a la fecha de fin' });
        }

        const now = new Date();
        if (startDate > now) {
            return res.status(402).json({ message: 'La fecha de inicio no puede ser mayor a la fecha actual' });
        }
        const bills = await Bill.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate('userId');

        if (!bills || bills.length === 0) {
            return res.status(403).json({ message: 'No se encontraron facturas' });
        }
        console.log('Facturas encontradas:', bills.map(bill => ({
            id: bill._id,
            createdAt: bill.createdAt
        })));

        const totalRecaudado = bills.reduce((acc, bill) => acc + (bill.total || 0), 0);

        res.status(200).json({ bills, totalRecaudado });
    } catch (error) {
        console.error('Error en getBills:', error);
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

module.exports = {
    generateNewBill,
    getBills
}
