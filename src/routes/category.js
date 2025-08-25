const { Router } = require('express');
const router = Router();
const CategoryController = require('../controllers/categoryController');

// POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST
router.post('/categories', CategoryController.createCategory);

// GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET
router.get('/categories', CategoryController.getAllCategories);
router.get('/categories/:id', CategoryController.getCategoryById);
router.get('/search-categories/:term', CategoryController.searchCategories);

// PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH
router.patch('/update-categories/:id', CategoryController.updateCategory);

// DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE
router.delete('/delete-categories/:id', CategoryController.deleteCategory);

module.exports = router;
