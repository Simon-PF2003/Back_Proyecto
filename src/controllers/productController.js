const Supplier = require('../models/supplier');
const Product = require('../models/product'); 
const Counter = require('../models/counter');
const StockNotification = require('../models/stockNotification');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const transporter = require('../utils/mail');
const Category = require('../models/category');
const mongoose = require('mongoose');


//POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS 
async function createProduct(req,res) {
  const { desc, brand, stock, price, cat, stockMin, featured, supplier } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha adjuntado una imagen' });
  }
  if (!mongoose.Types.ObjectId.isValid(cat)) {
    return res.status(400).json({ error: 'categoryId inválido' });
  }
  const imageFileName = req.file.filename; // Nombre del archivo en el servidor
  const image = 'uploadsProductsImages/' + imageFileName; // Ruta relativa de la imagen
  const sup = await Supplier.findOne({ businessName: supplier });
  console.log("supplier", sup);
  const newProduct = new Product({ desc, brand, stock, price, cat, stockMin, featured, supplier: sup._id, image });
  const product = await Product.findOne({ desc: { $regex: new RegExp(`^${desc}$`, 'i') } }); //No case sensitive
  if (product) {
    return res.status(401).json({ error: 'El producto ya existe' });
  } else {
    newProduct.code = await Counter.getNext('productos');
    const token = jwt.sign({ _id: newProduct._id }, 'secretKey');
    await newProduct.save();
    console.log(newProduct);
    res.status(200).json({ token });
  }
}

async function createStockNotification(req, res) {
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

//GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS 
// Función combinada para filtros múltiples
async function getProductsWithFilters(req, res) {
  try {
    const { search, category, hasStock, minPrice, maxPrice } = req.query;
    
    // Construir el objeto de filtro de MongoDB
    let filter = {};
    
    // Filtro de búsqueda por texto (similar a filterProducts)
    if (search && search.trim() !== '') {
      filter.desc = { $regex: search, $options: 'i' };
    }
    
    // Filtro de categoría (similar a getProductByCategory)
    if (category && category !== 'all') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.cat = category;
      } else {
        // Si no es un ObjectId válido, buscar por type
        const catDoc = await Category.findOne({ type: category });
        if (catDoc) {
          filter.cat = catDoc._id;
        } else {
          return res.status(404).json({ error: 'Categoría no encontrada' });
        }
      }
    }
    
    // Filtro de stock
    if (hasStock === 'true') {
      filter.stock = { $gt: 0 };
    }
    
    // Filtros de precio
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    }
    
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    }
    
    console.log('Filtros aplicados:', filter);
    
    // Ejecutar la consulta con todos los filtros
    const products = await Product.find(filter).populate('cat', 'type').populate('brand', 'brand');
    
    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'No se encontraron productos que cumplan con los filtros' });
    }
    
    res.json(products);
  } catch (error) {
    console.error('Error en getProductsWithFilters:', error);
    res.status(500).json({ error: 'Error al buscar productos con filtros' });
  }
}

// Controlador para obtener la lista de productos
async function getProducts(req, res) {
  try {
    const products = await Product.find().populate('cat','type').populate('brand', 'brand');
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de productos.' });
  }
};

  //Destacados para el home
async function getFeaturedProducts(req, res) {
  try {
    const featuredProducts = await Product.find({ featured: 'true' }).populate('brand', 'brand').populate('cat', 'type');
    res.json(featuredProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de productos destacados.' });
  }
}

  //Los bajos de stock para la solicitud de stock
async function getNoStockProducts(req, res) {
  try {
    const noStockProducts = await Product.find({
      $expr: {
        $lt: ["$stock", "$stockMin"]
      }
    }).populate('brand', 'brand').populate('cat', 'type');
    res.json(noStockProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de productos sin stock.' });
  }
}

  //Obtener productos con stock pendiente para el ingreso
async function getPendingStock(req, res) {
  try {
    const pendingStockProducts = await Product.find({ pending: { $gt: 0 } }).populate('brand', 'brand');
    res.json(pendingStockProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de productos con stock pendiente.' });
  }
}

  //Para entrar a la single card del producto
async function getProductById(req,res) {
  const productId = req.params.productId;
  const product = await Product.findById(productId).populate('brand', 'brand').populate('cat', 'type');
  if (!product) return res.status(404).send("Producto no existe");

  const productDetails = {
    _id: product._id,
    desc: product.desc,
    brand: product.brand,
    stock: product.stock,
    price: product.price,
    cat: product.cat,
    featured: product.featured,
    stockMin: product.stockMin,
    supplier: product.supplier,
    pending: 0,
    image: `http://localhost:3000/${product.image}`
  };

  res.json(productDetails);
}

//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH 
  //Editar un producto
async function editProduct(req, res) {
  const productId = req.params.productId;
  const { desc, brand, stock, price, cat, featured, stockMin, supplier } = req.body;

  const newSupplier = await Supplier.findOne({ businessName: supplier });
  if (!newSupplier) return res.status(400).json({ error: 'Proveedor inexistente' });

  let updateOps = { desc, stock, cat, price, featured, stockMin, supplier: newSupplier._id };

  // Actualizar la marca si viene como nombre o id
  if (brand !== undefined) {
    if (brand === null || brand === '') {
    } else if (mongoose.Types.ObjectId.isValid(brand)) {
      const brandExists = await mongoose.model('Brand').findById(brand);
      if (!brandExists) return res.status(400).json({ error: 'Marca inválida' });
      updateOps.brand = brandExists._id;
    } else {
      const brandDoc = await mongoose.model('Brand').findOne({ brand });
      if (!brandDoc) return res.status(401).json({ error: 'Marca inválida' });
      updateOps.brand = brandDoc._id;
    }
  }

  if (cat !== undefined) {
    if (cat === null || cat === '') {
      // No actualizar la categoría si está vacía
    } else if (mongoose.Types.ObjectId.isValid(cat)) {
      const categoryExists = await Category.findById(cat);
      if (!categoryExists) return res.status(400).json({ error: 'Categoría inválida' });
      updateOps.cat = categoryExists._id;
    } else {
      const catDoc = await Category.findOne({ type: cat });
      if (!catDoc) return res.status(400).json({ error: 'Categoría inválida' });
      updateOps.cat = catDoc._id;
    }
  }

  if (req.file) {
    updateOps.image = 'uploadsProductsImages/' + req.file.filename;
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    if (typeof stock === 'number' && stock > product.stock) {
      const stockNotification = await StockNotification.find({ productId, notified: false });
      for (const notification of stockNotification) {
        const user = await User.findById(notification.userId);
        const mailOptions = {
          from: process.env.ENTERPRISE_MAIL,
          to: user.email,
          subject: 'MPS SQUARE: Notificación de Stock',
          text: `El producto ${desc || product.desc} ya está disponible en stock.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.error('Error al enviar correo electrónico', error);
          else console.log('Email enviado: ', info.response);
        });
        notification.notified = true;
        await notification.save();
      }
    }
    const result = await Product.findByIdAndUpdate(productId, updateOps, { new: true });
    if (!result) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
}


  //Restar stock cuando ingresa pedido
async function updateOrderStock(req, res) {
  const pedido = req.body.orderData;
  const { items } = pedido;
  try {
    for (const item of items)
     {
      // Busca el producto en la base de datos
      console.log("id item", item);
      const producto = await Product.findById(item._id);      
      // Actualiza el stock restando o sumando la cantidad del pedido
        producto.stock -= item.quantity;
       // Guarda los cambios en la base de datos
      await producto.save();
    }
  } catch (error) {
    // Manejo de errores
    console.error('Error al actualizar el stock:', error);
    throw error;
  }
}

  //Crear solicitud de stock
async function requestStock(req, res) {
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


  //Actualizar el stock en el ingreso
async function updateStock(req, res) {
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
          from: process.env.ENTERPRISE_MAIL,
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

//DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE 
async function deleteProduct(req,res) {
  const productId = req.params.productId;
  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);  

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
}

module.exports = {
  //POSTS 
  createProduct,
  createStockNotification,

  //GETS
  getProducts,
  getFeaturedProducts,
  getNoStockProducts,
  getPendingStock,
  getProductById,
  getProductsWithFilters,


  //PATCH
  editProduct,
  updateOrderStock,
  requestStock,
  updateStock,

  //DELETE
  deleteProduct
}
