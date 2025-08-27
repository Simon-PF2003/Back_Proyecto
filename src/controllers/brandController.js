const Brand = require('../models/brand');
const Product = require('../models/product');

// POST POST POST POST POST POST POST POST POST POST POST POST POST POST 
async function createBrand(req, res) {
  console.log('llegamos');
  const { brand } = req.body;
  const newBrand = new Brand({ brand });
  const existingBrand = await Brand.findOne({ brand: { $regex: new RegExp(`^${brand}$`, 'i') } }); //No case sensitive
  if (existingBrand) {
    return res.status(400).json({ error: 'La marca ya existe' });
  } else {
    await newBrand.save();
    console.log(newBrand);
    res.status(200).json({ newBrand });
  }
}

//GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET 
  //Todas para la dropdown del filtro
async function getAllBrands(_req, res) {
  try {
    const brands = await Brand.find().sort({ brand: 1 }).exec();
    return res.json(brands);
  } catch {
    return res.status(500).json({ message: 'Error al listar marcas' });
  }
}

  //Para el update por descripcion
async function searchBrands(req, res) {
  const searchTerm = req.params.term; 
    try {
      console.log('buscando');
      const brands = await Brand.find({ brand: { $regex: searchTerm, $options: 'i' } }); 
    if (!brands || brands.length === 0) {
        return res.status(400).json({ error: 'No se encontraron marcas' });
      }

      res.json(brands);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al buscar marcas' });
    }
}

//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH 
async function updateBrand(req, res) {
  try {
    const { brand } = req.body;
    const updated = await Brand.findByIdAndUpdate(
      req.params.id,
      { brand },
      { new: true, runValidators: true }
    ).exec();

    if (!updated) return res.status(404).json({ message: 'Marca no encontrada' });
    return res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Ya existe otra marca con ese type.' });
    }
    return res.status(500).json({ message: 'Error al actualizar la marca' });
  }
}

// DELETE /categories/:id
async function deleteBrand(req, res) {
  try {
    const brandId = req.params.id;
    const { reassignTo } = req.query;

    // Verificar categoría en existencia
    const brandToDelete = await Brand.findById(brandId).exec();
    if (!brandToDelete) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }
    if (reassignTo) {
      const newBrand = await Brand.findById(reassignTo).exec();
      if (!newBrand) {
        return res.status(404).json({ message: 'Marca de destino no encontrada' });
      }
    }
    if (reassignTo) {
      await Brand.updateMany(
        { brand: brandId },
        { brand: reassignTo }
      ).exec();
    } else {
      await Brand.updateMany(
        { brand: brandId },
        { $unset: { brand: "" } }
      ).exec();
    }

    // Eliminar la categoría
    const deleted = await Brand.findByIdAndDelete(brandId).exec();
    
    const message = reassignTo 
      ? 'Marca eliminada y productos reasignados correctamente'
      : 'Marca eliminada. Los productos quedaron sin categoría';
      
    return res.json({ message });
    
  } catch (error) {
    console.error('Error al eliminar la marca:', error);
    return res.status(500).json({ message: 'Error al eliminar la marca' });
  }
}

module.exports = {
  createBrand,
  getAllBrands,
  searchBrands,
  updateBrand,
  deleteBrand
};
