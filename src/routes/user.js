const { Router } = require('express');
const router = Router();
const jwt = require('jsonwebtoken');
const xss = require('xss-clean');
const UserController = require('../controllers/userController');
const {upload} = require('../middleware/uploadImage');
const {verifyToken} = require('../middleware/authMiddleware');


// POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST 
router.post('/sendCode', UserController.sendCode);

router.post('/compareCode', UserController.compareCode);

router.post('/addUser', upload.single('image'), UserController.addUser);

router.post('/signup', UserController.signUp);

router.post('/login', UserController.login);

//GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET 
  //Usuarios no aceptados
router.get('/pendingUsers', UserController.getPendingUsers);

  //Todos para modificacion o eliminación
router.get('/allUsers', UserController.getAllUsers);

  //Este son los filtros y ordenamientos del reporte de ultima venta de los clientes y eso
router.get('/clients/filters', UserController.filterUsers);

  //Busqueda por razon social o cuit en update o eliminacion
router.get('/searchUser/:query', verifyToken, UserController.searchUser);

  //Si no me equivoco, es para verificar en el alta que no exista el cliente.
router.get('/user/:email', UserController.getUserEmail);

router.get('/user', verifyToken, UserController.getUser);

  //Busca al cliente por su id. Se usa para ver la razon social del pedido especifico de un cliente.
router.get('/userById/:userId', UserController.getUserById);

  //Busca la imagen para "mi perfil"
router.get('/getUserImage/:userId', UserController.getUserImage);

router.get('/user-discount/:user', UserController.getUserDiscount);

//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH 
router.patch('/updateUser/:id', upload.single('image'), UserController.editUser);

router.patch('/acceptUser/:email', UserController.acceptUser);

router.patch('/rejectUser/:email', UserController.rejectUser);

//LAS PASO IGUAL, PERO ESTOY BASTANTE SEGURO QUE ESTA Y LA DE ABAJO NO SE USAN PORQUE SE CAMBIO LA 
//MODIFICACION AHORA. EL ESTADO CAMBIA CON LA FACTURA, NO DESDE EL USUARIO.
router.patch('/asignPrivileges/:userId', UserController.assignPrivileges);

router.patch('/modifyStatus/:userId', UserController.modifyStatus);

router.patch('/newPassword', UserController.newPassword);
  
//DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE 
router.delete('/deleteUser/:userId', UserController.deleteUser);

module.exports = router;

