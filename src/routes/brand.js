const { Router } = require('express');
const router = Router();
const BrandController = require('../controllers/brandController');

// POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST
router.post('/newBrand', BrandController.createBrand);

// GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET
router.get('/brands', BrandController.getAllBrands);
router.get('/search-brands/:term', BrandController.searchBrands);

// PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH
router.patch('/update-brands/:id', BrandController.updateBrand);

// DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE
router.delete('/delete-brands/:id', BrandController.deleteBrand);

module.exports = router;
