const Supplier = require('../models/supplier');
const Product = require('../models/product');
const Brand = require('../models/brand'); 
const Counter = require('../models/counter');
const StockNotification = require('../models/stockNotification');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const transporter = require('../utils/mail');
const Category = require('../models/category');
const mongoose = require('mongoose');


//POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS 
async function createProduct(req,res) {
  const { desc, brand, stock, price, cat, stockMin, featured, suppliers } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha adjuntado una imagen' });
  }

  let brandId = null;
  if (brand !== undefined && brand !== null && brand !== '') {
    if (mongoose.Types.ObjectId.isValid(brand)) {
      const brandExists = await Brand.findById(brand);
      if (brandExists) {
        brandId = brandExists._id;
      } else {
        const brandDoc = await Brand.findOne({ brand: brand });
        if (brandDoc) {
          brandId = brandDoc._id;
        } else {
          return res.status(400).json({ error: 'Marca no encontrada' });
        }
      }
    } else {
      const brandDoc = await Brand.findOne({ brand: brand });
      if (brandDoc) {
        brandId = brandDoc._id;
      } else {
        return res.status(400).json({ error: 'Marca no encontrada' });
      }
    }
  }

  let categoryId = null;
  if (mongoose.Types.ObjectId.isValid(cat)) {
    const categoryExists = await Category.findById(cat);
    if (categoryExists) {
      categoryId = categoryExists._id;
    } else {
      const catDoc = await Category.findOne({ type: cat });
      if (catDoc) {
        categoryId = catDoc._id;
      } else {
        return res.status(400).json({ error: 'Categoría no encontrada' });
      }
    }
  } else {
    const catDoc = await Category.findOne({ type: cat });
    if (catDoc) {
      categoryId = catDoc._id;
    } else {
      return res.status(400).json({ error: 'Categoría no encontrada' });
    }
  }
  
  let parsedSuppliers;
  try {
    if (typeof suppliers === 'string') {
      parsedSuppliers = JSON.parse(suppliers);
    } else {
      parsedSuppliers = suppliers;
    }
  } catch (error) {
    return res.status(400).json({ error: 'Formato de proveedores inválido' });
  }
  
  
  if (!parsedSuppliers || !Array.isArray(parsedSuppliers) || parsedSuppliers.length === 0) {
    return res.status(400).json({ error: 'Debe proporcionar al menos un proveedor' });
  }

  const imageFileName = req.file.filename; // Nombre del archivo en el servidor
  const image = 'uploadsProductsImages/' + imageFileName; // Ruta relativa de la imagen
  
  const supplierIds = [];
  for (const supplierData of parsedSuppliers) {
    let sup;
    if (mongoose.Types.ObjectId.isValid(supplierData)) {
      console.log('Searching supplier by ID:', supplierData);
      sup = await Supplier.findById(supplierData);
      if (!sup) {
        sup = await Supplier.findOne({ businessName: supplierData });
      }
    } else {
        sup = await Supplier.findOne({ businessName: supplierData });
    }
    if (!sup) {
      return res.status(400).json({ error: `Proveedor no encontrado: ${supplierData}` });
    }
    supplierIds.push(sup._id);
  }

  console.log("suppliers", supplierIds);
  const newProduct = new Product({ 
    desc, 
    brand: brandId, 
    stock, 
    price, 
    cat: categoryId, 
    stockMin, 
    featured, 
    suppliers: supplierIds, 
    image 
  });
  const product = await Product.findOne({ desc: { $regex: new RegExp(`^${desc}$`, 'i') } }); //No case sensitive
  if (product) {
    return res.status(401).json({ error: 'El producto ya existe' });
  } else {
    newProduct.code = await Counter.getNext('productos');
    
    for (const supplierId of supplierIds) {
      await Supplier.findByIdAndUpdate(supplierId, {
        $addToSet: { products: newProduct._id }
      });
    }
    
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
    const { search, category, brand, hasStock, minPrice, maxPrice } = req.query;
    
    let filter = {};

    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search, $options: 'i' };
      filter.$or = [
        { desc: searchRegex }
      ];

      if (!isNaN(search)) {
        filter.$or.push({ code: parseInt(search) });
      } else {
        const numericPart = search.match(/\d+/);
        if (numericPart) {
          filter.$or.push({ code: parseInt(numericPart[0]) });
        }
      }
    }
    
    if (category && category !== 'all') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        const categoryExists = await Category.findById(category);
        if (categoryExists) {
          filter.cat = categoryExists._id;
        } else {
          const catDoc = await Category.findOne({ type: category });
          if (catDoc) {
            filter.cat = catDoc._id;
          } else {
            return res.status(404).json({ error: 'Categoría no encontrada' });
          }
        }
      } else {
        const catDoc = await Category.findOne({ type: category });
        if (catDoc) {
          filter.cat = catDoc._id;
        } else {
          return res.status(404).json({ error: 'Categoría no encontrada' });
        }
      }
    }
    
    if (brand && brand != 'all') {
      if (mongoose.Types.ObjectId.isValid(brand)) {
        const brandExists = await Brand.findById(brand);
        if (brandExists) {
          filter.brand = brandExists._id;
        } else {
          const brandDoc = await Brand.findOne({ brand: brand });
          if (brandDoc) {
            filter.brand = brandDoc._id;
          } else {
            return res.status(404).json({ error: 'Marca no encontrada' });
          }
        }
      } else {
        const brandDoc = await Brand.findOne({ brand: brand });
        if (brandDoc) {
          filter.brand = brandDoc._id;
        } else {
          return res.status(404).json({ error: 'Marca no encontrada' });
        }
      }
    }

    if (hasStock === 'true') {
      filter.stock = { $gt: 0 };
    }
    
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    }
    
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    }
    
    console.log('Filtros aplicados:', filter);
    
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
    const products = await Product.find()
      .populate('cat','type')
      .populate('brand', 'brand')
      .populate('suppliers', 'businessName');
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
  const product = await Product.findById(productId)
    .populate('brand', 'brand')
    .populate('cat', 'type')
    .populate('suppliers', 'businessName')
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
    suppliers: product.suppliers,
    pending: 0,
    image: `http://localhost:3000/${product.image}`
  };

  res.json(productDetails);
}

//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH 
  //Editar un producto
async function editProduct(req, res) {
  const productId = req.params.productId;
  const { desc, brand, stock, price, cat, featured, stockMin, suppliers } = req.body;
  
  // Validar y actualizar proveedores si se envían
  let newSupplierIds = [];
  if (suppliers !== undefined && suppliers !== null) {
    let parsedSuppliers;
    try {
      if (typeof suppliers === 'string') {
        parsedSuppliers = JSON.parse(suppliers);
      } else {
        parsedSuppliers = suppliers;
      }
    } catch (error) {
      return res.status(400).json({ error: 'Formato de proveedores inválido' });
    }
    
    if (!Array.isArray(parsedSuppliers) || parsedSuppliers.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar al menos un proveedor' });
    }

    for (const supplierData of parsedSuppliers) {
      let newSupplier;
      console.log('Processing supplier for edit:', supplierData);
      if (mongoose.Types.ObjectId.isValid(supplierData)) {
        newSupplier = await Supplier.findById(supplierData);
        console.log('Búsqueda proveedor por id', newSupplier);
        if (!newSupplier) {
          console.log('No se encontró proveedor por ID, buscando por nombre:', supplierData);
          newSupplier = await Supplier.findOne({ businessName: supplierData });
          console.log('Búsqueda proveedor por nombre', newSupplier);
        }
      } else {
        newSupplier = await Supplier.findOne({ businessName: supplierData });
        console.log('Búsqueda proveedor por nombre', newSupplier);
      }
      
      if (!newSupplier) {
        return res.status(400).json({ error: `Proveedor inexistente: ${supplierData}` });
      }
      newSupplierIds.push(newSupplier._id);
    }
  } else {
    return res.status(400).json({ error: 'Proveedores requeridos' });
  }

  let updateOps = { desc, stock, cat, price, featured, stockMin, suppliers: newSupplierIds };

  // Actualizar la marca si viene como nombre o id
  if (brand !== undefined) {
    if (brand === null || brand === '') {
      // No actualizar la marca si está vacía
    } else if (mongoose.Types.ObjectId.isValid(brand)) {
      const brandExists = await mongoose.model('Brand').findById(brand);
      console.log('Búsqueda marca por id', brandExists);
      if (brandExists) {
        updateOps.brand = brandExists._id;
      } else {
        // Si no se encuentra por ID, intentar buscar por nombre
        console.log('No se encontró marca por ID, buscando por nombre:', brand);
        const brandDoc = await mongoose.model('Brand').findOne({ brand });
        console.log('Búsqueda marca por nombre', brandDoc);
        if (!brandDoc) return res.status(400).json({ error: 'Marca inválida' });
        updateOps.brand = brandDoc._id;
      }
    } else {
      const brandDoc = await mongoose.model('Brand').findOne({ brand });
      console.log('Búsqueda marca por nombre', brandDoc);
      if (!brandDoc) return res.status(400).json({ error: 'Marca inválida' });
      updateOps.brand = brandDoc._id;
    }
  }

  if (cat !== undefined) {
    console.log('Categoría recibida:', cat);
    if (cat === null || cat === '') {
      // No actualizar la categoría si está vacía
    } else if (mongoose.Types.ObjectId.isValid(cat)) {
      const categoryExists = await Category.findById(cat);
      console.log('Búsqueda por id', categoryExists);
      if (categoryExists) {
        updateOps.cat = categoryExists._id;
      } else {
        // Si no se encuentra por ID, intentar buscar por nombre
        console.log('No se encontró por ID, buscando por nombre:', cat);
        const catDoc = await Category.findOne({ type: cat });
        console.log('Búsqueda por nombre', catDoc);
        if (!catDoc) return res.status(400).json({ error: 'Categoría inválida' });
        updateOps.cat = catDoc._id;
      }
    } else {
      const catDoc = await Category.findOne({ type: cat });
      console.log('Búsqueda por nombre', catDoc);
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

    const oldSupplierIds = product.suppliers || [];
    
    const suppliersToRemove = oldSupplierIds.filter(oldId => 
      !newSupplierIds.some(newId => newId.equals(oldId))
    );
    
    for (const supplierId of suppliersToRemove) {
      await Supplier.findByIdAndUpdate(supplierId, {
        $pull: { products: productId }
      });
    }
    
    const suppliersToAdd = newSupplierIds.filter(newId => 
      !oldSupplierIds.some(oldId => oldId.equals(newId))
    );
    
    for (const supplierId of suppliersToAdd) {
      await Supplier.findByIdAndUpdate(supplierId, {
        $addToSet: { products: productId }
      });
    }

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
  console.log('Eliminando producto con ID:', productId);
  try {
    const productToDelete = await Product.findById(productId);
    
    if (!productToDelete) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Eliminar el producto de todos los proveedores asociados
    if (productToDelete.suppliers && productToDelete.suppliers.length > 0) {
      for (const supplierId of productToDelete.suppliers) {
        await Supplier.findByIdAndUpdate(supplierId, {
          $pull: { products: productId }
        });
        console.log(`Producto eliminado del proveedor ${supplierId}`);
      }
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
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
