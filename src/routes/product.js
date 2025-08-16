const { Router } = require('express');
const router = Router();;
const ProductController = require('../controllers/productController');
const {upload} = require('../middleware/uploadImage');

//POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS 
router.post('/createStockNotification', ProductController.createStockNotification);

router.post('/createNewProduct', upload.single('image'), ProductController.createProduct);

//GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS 
  //Filtro por navegación
router.get('/searchProducts/:searchTerm', ProductController.filterProducts);

  //Todo el listado
router.get('/product', ProductController.getProducts);

  //Destacados para el home
router.get('/featuredProducts', ProductController.getFeaturedProducts);

  //Bajos de stock
router.get('/noProducts', ProductController.getNoStockProducts);

  //Stock pendiente de ingreso
router.get('/pendingStock', ProductController.getPendingStock);

  //Es busqueda por ID. Sirve para entrar a la single card del producto
router.get('/product/:productId', ProductController.getProductById);

  //Filtro por categoría
router.get('/category/:category', ProductController.getProductByCategory); 

//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH 
router.patch('/requestStock', ProductController.requestStock);

router.patch('/updateStock', ProductController.updateStock);

router.patch('/product/:productId', upload.single('image'), ProductController.editProduct)

//Restar stock cuando se hace un pedido
router.patch('/orderStockProduct', ProductController.updateOrderStock);

//DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE 
router.delete('/product/:productId', ProductController.deleteProduct); 

module.exports =  router;
