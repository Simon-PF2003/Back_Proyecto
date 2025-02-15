
const Product = require('../models/product'); 

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
    res.status(200).json({ message: 'Se ha actualizado el stock de los productos' });

  } catch (error) {
    console.error('Error al actualizar el stock:', error);
    res.status(500).json({ message: 'Error al actualizar el stock de los productos' });
  }
};

