const Category = require('../models/category');
const Product = require('../models/product');

// POST /categories
async function createCategory(req, res) {
  const { type } = req.body;
  const newCategory = new Category({ type });
  const category = await Category.findOne({ type: { $regex: new RegExp(`^${type}$`, 'i') } }); //No case sensitive
  if (category) {
    return res.status(400).json({ error: 'La categoría ya existe' });
  } else {
    await newCategory.save();
    console.log(newCategory);
    res.status(200).json({ newCategory });
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

async function searchCategories(req, res) {
  const searchTerm = req.params.term; 
    try {
      console.log('buscando');
      const categories = await Category.find({ type: { $regex: searchTerm, $options: 'i' } }); 
    if (!categories || categories.length === 0) {
        return res.status(400).json({ error: 'No se encontraron categorías' });
      }

      res.json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al buscar categorías' });
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
    const categoryId = req.params.id;
    const { reassignTo } = req.query;

    // Verificar categoría en existencia
    const categoryToDelete = await Category.findById(categoryId).exec();
    if (!categoryToDelete) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Si se especifica una categoría de reasignación, verificar que existe
    if (reassignTo) {
      const newCategory = await Category.findById(reassignTo).exec();
      if (!newCategory) {
        return res.status(404).json({ message: 'Categoría de destino no encontrada' });
      }
    }

    // Actualizar productos que pertenecen a la categoría que se va a eliminar
    if (reassignTo) {
      await Product.updateMany(
        { cat: categoryId },
        { cat: reassignTo }
      ).exec();
    } else {
      // Dejar productos sin categoría (null o undefined)
      await Product.updateMany(
        { cat: categoryId },
        { $unset: { cat: "" } }
      ).exec();
    }

    // Eliminar la categoría
    const deleted = await Category.findByIdAndDelete(categoryId).exec();
    
    const message = reassignTo 
      ? 'Categoría eliminada y productos reasignados correctamente'
      : 'Categoría eliminada. Los productos quedaron sin categoría';
      
    return res.json({ message });
    
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
    return res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
}

module.exports = {
  createCategory,
  getAllCategories,
  searchCategories,
  updateCategory,
  deleteCategory
};
