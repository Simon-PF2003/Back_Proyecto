const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
const Product = require('../models/product');
const StockNotification = require('../models/stockNotification');
const User = require('../models/user');
const Supplier = require('../models/supplier');
const productController = require('../controllers/productController');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'totalstoreshopping@gmail.com',
    pass: 'metz daac vlyi iqqe'
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploadsProductsImages/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); 
  },
});

const upload = multer({ storage });

router.get('/searchProducts/:searchTerm', async (req, res) => {
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
});

router.post('/createStockNotification', productController.createStockNotification);

router.get('/product', productController.getProducts);

router.get('/featuredProducts', productController.getFeaturedProducts);

router.get('/noProducts', productController.getNoStockProducts);

router.get('/pendingStock', productController.getPendingStock);

router.patch('/requestStock', productController.requestStock);

router.patch('/updateStock', productController.updateStock);

router.post('/createNewProduct', upload.single('image'), async (req, res) => {
  const { desc, stock, price, cat, stockMin, featured, supplier } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha adjuntado una imagen' });
  }
  console.log('suppleir', supplier);

  const imageFileName = req.file.filename; // Nombre del archivo en el servidor
  const image = 'uploadsProductsImages/' + imageFileName; // Ruta relativa de la imagen
  const sup = await Supplier.findOne({ businessName: supplier });
  console.log("supplier", sup);
  const newProduct = new Product({ desc, stock, price, cat, stockMin, featured, supplier: sup._id, image });
  console.log(newProduct);
  const product = await Product.findOne({ desc: { $regex: new RegExp(`^${desc}$`, 'i') } }); //No case sensitive
  if (product) {
    return res.status(401).json({ error: 'El producto ya existe' });
  } else {
    const token = jwt.sign({ _id: newProduct._id }, 'secretKey');
    await newProduct.save();
    res.status(200).json({ token });
  }
});

router.get('/product/:productId', async(req, res) => {
  const productId = req.params.productId;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).send("Producto no existe");

  const productDetails = {
    _id: product._id,
    desc: product.desc,
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
});


/*router.get('/productByDescription/:description', async (req, res) => {
  const { description } = req.params;
  try {
    const product = await Product.findOne({ desc: description });
    if (!product) {
      return res.status(404).send("Producto no existe");
    }
    const productDetails = {
      _id: product._id,
      desc: product.desc,
      stock: product.stock,
      price: product.price,
      cat: product.cat,
      supplier: product.supplier,
      image: `http://localhost:3000/${product.image}`
    };
    res.json(productDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al buscar producto por descripción.' });
  }
});*/


  router.delete('/product/:productId', async (req, res) => {
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
  });
    
  router.patch('/product/:productId', upload.single('image'), async (req, res) => {
    const productId = req.params.productId;
    const { desc, stock, price, cat, featured, stockMin, supplier } = req.body;
    const newSupplier = await Supplier.findOne({ businessName: supplier });
    console.log("supplier", newSupplier);
    const updateOps = {desc, stock, price, cat, featured, stockMin, supplier: newSupplier._id};
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
            from: 'totalstoreshopping@gmail.com',
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
  });


router.get('/category/:category', async (req, res) => {
  const category = req.params.category;
  try {
    const productos = await Product.find({ cat: category });
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar productos por categoría' });
  }
});

router.patch('/orderStockProduct', async (req, res) => {
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
});

  module.exports =  router;
