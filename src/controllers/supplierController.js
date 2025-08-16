const Supplier = require('../models/supplier');
const jwt = require('jsonwebtoken');

//POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST POST 
async function createNewSupplier(req,res) {
  const { cuit, businessName, address, phoneNumber, category } = req.body;
  const newSupplier = new Supplier({ cuit, businessName, address, phoneNumber, category });
  /*const supplierExists = await Supplier.findOne({ cuit: cuit });
  
  if (supplierExists) {
    return res.status(400).json({ message: 'El proveedor agregado ya existe' });
  }*/

  const token = jwt.sign({ _id: newSupplier._id }, 'secretKey');
  await newSupplier.save();
  res.status(200).json({ token });
}

//GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET GET 
  //Sirve como busqueda por nombre y busca por cuit para ver si existe antes de agregarlo a la BD
async function getSupplier(req,res) {
        const searchTerm = req.params.query;
        console.log('entramos');
        console.log(searchTerm);
  try {
    const isNumeric = !isNaN(Number(searchTerm));
    console.log(isNumeric)
    if (isNumeric) {
    // Búsqueda por cuit
    const supplier = await Supplier.findOne({ cuit: searchTerm }).exec();
      if (!supplier || supplier.length === 0) {
      console.log('No encontramos nada');
      return res.status(404).json({ message: 'Proveedores no encontrados' });
    }   
    console.log(supplier)
    return res.json(supplier);
  } else {
    // Búsqueda por businessName
    console.log('Buscamos por name');
    const suppliers = await Supplier.find({ businessName: { $regex: searchTerm, $options: 'i'}}).exec();
      if (!suppliers || suppliers.length === 0) {
      console.log('No encontramos nada');
      return res.status(404).json({ message: 'Proveedores no encontrados' });
    }   
    return res.status(200).json(suppliers);
    }  
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al buscar el proveedor', error: error });
  }
}

  //Busqueda de todos para actualizacion o eliminacion
async function getAllSuppliers(req,res)  {
  try {
    const proveedores = await Supplier.find(); 

    res.json(proveedores); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

//PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH PATCH 
async function editSupplier(req,res) {
    const supId = req.params.supId;
    const { cuit, businessName, address, phoneNumber, category } = req.body;
    const updateDetails = { cuit, businessName, address, phoneNumber, category };
  
    try {
      const result = await Supplier.findByIdAndUpdate(supId, updateDetails, { new: true });
  
      if (!result) {
        return res.status(404).json({ error: 'Supplier no encontrado' });
      }
  
      res.json({ data: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar el supplier' });
    }
  }

//DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE  
async function deleteSupplier(req, res) {
    console.log('Borrar Supplier'); 
    const supplierId = req.params.supplierId;
    try {
      const deletedSupplier = await Supplier.findByIdAndDelete(supplierId);  
  
      if (!deletedSupplier) {
        return res.status(404).json({ error: 'Supplier no encontrado' });
      }
  
      return res.status(200).json({ message: 'Supplier eliminado correctamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al eliminar el supplier' });
    }
  };

  module.exports = { 
    //POST 
    createNewSupplier,
    
    //GET 
    getSupplier,
    getAllSuppliers, 

    //PATCH
    editSupplier,

    //Delete
    deleteSupplier
  };
