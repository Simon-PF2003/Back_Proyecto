const { Router } = require('express');
const router = Router();
const SupplierController = require('../controllers/supplierController');


//POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST 
router.post('/createNewSupplier', SupplierController.createNewSupplier);

//GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET 
  //Busqueda por cuit o nombre para darlo de alta o buscarlo
router.get('/supplier/:query', SupplierController.getSupplier);

  //Busqueda de todos para la parte de update or delete
router.get('/getSuppliers', SupplierController.getAllSuppliers);

//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH
router.patch('/updateDetails/details/:supId', SupplierController.editSupplier);

//DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE 
router.delete('/deleteSupplier/:supplierId', SupplierController.deleteSupplier);

module.exports = router;