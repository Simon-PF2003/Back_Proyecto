const Supplier = require('../models/supplier');
const Product = require('../models/product'); 
const StockNotification = require('../models/stockNotification');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const transporter = require('../utils/mail');

//POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS 
async function createProduct(req,res) {
  const { desc, brand, stock, price, cat, stockMin, featured, supplier } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha adjuntado una imagen' });
  }

  const imageFileName = req.file.filename; // Nombre del archivo en el servidor
  const image = 'uploadsProductsImages/' + imageFileName; // Ruta relativa de la imagen
  const sup = await Supplier.findOne({ businessName: supplier });
  console.log("supplier", sup);
  const newProduct = new Product({ desc, brand, stock, price, cat, stockMin, featured, supplier: sup._id, image });
  console.log(newProduct);
  const product = await Product.findOne({ desc: { $regex: new RegExp(`^${desc}$`, 'i') } }); //No case sensitive
  if (product) {
    return res.status(401).json({ error: 'El producto ya existe' });
  } else {
    const token = jwt.sign({ _id: newProduct._id }, 'secretKey');
    await newProduct.save();
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
// Controlador para obtener la lista de productos
async function getProducts(req, res) {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de productos.' });
  }
};

  //Destacados para el home
async function getFeaturedProducts(req, res) {
  try {
    const featuredProducts = await Product.find({ featured: 'true' });
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
    });
    res.json(noStockProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de productos sin stock.' });
  }
}

  //Obtener productos con stock pendiente para el ingreso
async function getPendingStock(req, res) {
  try {
    const pendingStockProducts = await Product.find({ pending: { $gt: 0 } });
    res.json(pendingStockProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lista de productos con stock pendiente.' });
  }
}

  //Filtrado por busqueda en barra de navegacion
async function filterProducts(req, res) {
  const searchTerm = req.params.searchTerm; 
  try {
    const products = await Product.find({ desc: { $regex: searchTerm, $options: 'i' } }); //$options: 'i' es una opción de modificador en una expresión de expresión regular utilizada en la consulta de la base de datos MongoDB.
//En el contexto de MongoDB, cuando usas expresiones regulares con $regex para realizar búsquedas, $options: 'i' es una de las opciones disponibles para controlar cómo se realiza la búsqueda. En particular:
//'i' significa insensible a mayúsculas y minúsculas (case-insensitive). Al usar esta opción junto con $regex, la consulta ignorará la distinción entre mayúsculas y minúsculas. Por lo tanto, la búsqueda de "Ejemplo" sería igual a "ejemplo" o "EJEMPLO".

    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'No se encontraron productos' });
    }

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar productos' });
  }
}

  //Para entrar a la single card del producto
async function getProductById(req,res) {
  const productId = req.params.productId;
  const product = await Product.findById(productId);
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

  //Buscar por la dropdown de categoria
async function getProductByCategory(req,res) {
  const category = req.params.category;
  console.log(category);
  try {
    const productos = await Product.find({ cat: category });
    console.log(productos);
    res.json(productos);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar productos por categoría' });
  }
}

//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH 
  //Editar un producto
async function editProduct(req,res) {
  const productId = req.params.productId;
  const { desc, brand, stock, price, cat, featured, stockMin, supplier } = req.body;
  const newSupplier = await Supplier.findOne({ businessName: supplier });
  console.log("supplier", newSupplier);
  const updateOps = {desc, brand, stock, price, cat, featured, stockMin, supplier: newSupplier._id};
  if (req.file) {
    const imageFileName = req.file.filename;
    updateOps.image = 'uploadsProductsImages/' + imageFileName;
    console.log("imagen", updateOps.image);
  }
  
  console.log("estas son las acts",updateOps);
  try {
    const product = await Product.findById(productId);
    if (stock>product.stock) {
      const stockNotification = await StockNotification.find({ productId: productId, notified: false });
      for (const notification of stockNotification) {
        const user = await User.findById(notification.userId);
        const mailOptions = {
          from: process.env.ENTERPRISE_MAIL,
          to: user.email,
          subject: 'MPS SQUARE: Notificación de Stock',
          text: `El producto ${desc} ya está disponible en stock.`
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

    const result = await Product.findByIdAndUpdate(productId, updateOps, { new: true });

    if (!result) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ data: product });
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
  filterProducts, 
  getProductById,
  getProductByCategory,


  //PATCH
  editProduct,
  updateOrderStock,
  requestStock,
  updateStock,

  //DELETE
  deleteProduct
}
