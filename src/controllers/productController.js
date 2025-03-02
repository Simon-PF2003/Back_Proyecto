
const Product = require('../models/product'); 
const StockNotification = require('../models/stockNotification');
const User = require('../models/user');

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'totalstoreshopping@gmail.com',
    pass: 'metz daac vlyi iqqe'
  }
});

// Controlador para obtener la lista de productos
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de productos.' });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: 'true' });
    res.json(featuredProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de productos destacados.' });
  }
}

exports.getNoStockProducts = async (req, res) => {
  try {
    const noStockProducts = await Product.find({
      $expr: {
        $lt: ["$stock", "$stockMin"]
      }
    });
    res.json(noStockProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de productos sin stock.' });
  }
}

exports.requestStock = async (req, res) => {
  console.log('Solicitando stock');
  const { productsToRequest } = req.body;
  try {
    if (!productsToRequest || !Array.isArray(productsToRequest) || productsToRequest.length === 0) {
      console.log('Se rompio todo');
      return res.status(400).json({ message: 'No se enviaron productos validos' });
    }
    const updates = productsToRequest.map(({ _id, quantityToBuy }) => ({
      updateOne: {
        filter: { _id },
        update: { $inc: { pending: quantityToBuy } },
      }
    }));
    await Product.bulkWrite(updates);
    res.status(200).json({ message: 'Se ha solicitado el stock de los productos' });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al solicitar el stock de los productos' });
  }
}

exports.getPendingStock = async (req, res) => {
  try {
    const pendingStockProducts = await Product.find({ pending: { $gt: 0 } });
    res.json(pendingStockProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de productos con stock pendiente.' });
  }
}

exports.updateStock = async (req, res) => {
  console.log('Actualizando stock...');
  const { productsToUpdate } = req.body;

  try {
    if (!productsToUpdate || !Array.isArray(productsToUpdate) || productsToUpdate.length === 0) {
      return res.status(400).json({ message: 'No se enviaron productos válidos' });
    }

    const bulkOperations = productsToUpdate.map(({ _id, quantityToBuy }) => ({
      updateOne: {
        filter: { _id },
        update: [
          {
            $set: {
              stock: { $add: ['$stock', quantityToBuy] },
              pending: { 
                $cond: { 
                  if: { $gte: [quantityToBuy, '$pending'] }, 
                  then: 0, 
                  else: { $subtract: ['$pending', quantityToBuy] } 
                }
              }
            }
          }
        ]
      }
    }));

    await Product.bulkWrite(bulkOperations);

    for (const product of productsToUpdate) {
      const productDetails = await Product.findById(product._id);
      const stockNotification = await StockNotification.find({ productId: product._id, notified: false });
      for (const notification of stockNotification) {
        const user = await User.findById(notification.userId);
        const mailOptions = {
          from: 'totalstoreshopping@gmail.com',
          to: user.email,
          subject: 'MPS SQUARE: Notificación de Stock',
          text: `El producto ${productDetails.desc} ya tiene stock`
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error al enviar correo electrónico', error);
          } else {
            console.log('Email enviado: ', info.response);
          }
        });
        notification.notified = true;
        await notification.save();
      }
    }
    res.status(200).json({ message: 'Se ha actualizado el stock de los productos' });

  } catch (error) {
    console.error('Error al actualizar el stock:', error);
    res.status(500).json({ message: 'Error al actualizar el stock de los productos' });
  }
};

exports.createStockNotification = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        console.log('Creando notificación de stock');
        console.log('userId:', userId);
        console.log('productId:', productId);
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const stockNotification = new StockNotification({ userId, productId });
        await stockNotification.save();
        res.status(200).json(stockNotification);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear notificación de stock' });
    }
}



