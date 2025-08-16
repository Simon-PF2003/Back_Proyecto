const { Router } = require('express');
const router = Router();
const OrderController = require('../controllers/orderController');

//POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS
router.post('/generateNewOrder', OrderController.generateOrder);

//GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS
  //Para "Mis pedidos"
router.get('/orders/:userId', OrderController.getUserOrders);

  //Para la parte de emision de factura
router.get('/finishedOrders', OrderController.getFinishedOrders);

  //Para la parte de recuperar pedidos del administrador
router.get('/pedidos', OrderController.getOrders);

  //Para mandar un mail al cambiar estado del pedido
router.get('/getEmail/:id', OrderController.getUserMail);

  //Buscar pedido por cliente
router.get('/searchOrders/:searchTerm', OrderController.filterOrdersByClient);

//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH
  //Cliente cancela pedido
router.patch('/cancelOrder/:orderId', OrderController.cancelOrder);

  //Admin cambia estado
router.patch('/changeStatus/:orderId', OrderController.changeOrderStatus );



module.exports = router;
