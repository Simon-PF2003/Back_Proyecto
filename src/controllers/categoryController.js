const Category = require('../models/category');

// POST /categories
async function createCategory(req, res) {
  try {
    const { type } = req.body;
    const saved = await Category.create({ type });
    return res.status(201).json(saved);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'La categoría ya existe.' });
    }
    return res.status(500).json({ message: 'Error al crear la categoría' });
  }
}

// GET /categories
async function getAllCategories(_req, res) {
  try {
    const cats = await Category.find().sort({ type: 1 }).exec();
    return res.json(cats);
  } catch {
    return res.status(500).json({ message: 'Error al listar categorías' });
  }
}

// GET /categories/:id
async function getCategoryById(req, res) {
  try {
    const cat = await Category.findById(req.params.id).exec();
    if (!cat) return res.status(404).json({ message: 'Categoría no encontrada' });
    return res.json(cat);
  } catch {
    return res.status(500).json({ message: 'Error al obtener la categoría' });
  }
}

// PATCH /categories/:id
async function updateCategory(req, res) {
  try {
    const { type } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { type },
      { new: true, runValidators: true }
    ).exec();

    if (!updated) return res.status(404).json({ message: 'Categoría no encontrada' });
    return res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Ya existe otra categoría con ese type.' });
    }
    return res.status(500).json({ message: 'Error al actualizar la categoría' });
  }
}

// DELETE /categories/:id
async function deleteCategory(req, res) {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id).exec();
    if (!deleted) return res.status(404).json({ message: 'Categoría no encontrada' });
    return res.json({ message: 'Categoría eliminada correctamente' });
  } catch {
    return res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
}

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};
