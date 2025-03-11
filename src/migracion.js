const mongoose = require('mongoose');
const User = require('./models/user'); 
const Product = require('./models/product');
const Supplier = require('./models/supplier');

async function migrarNuevoAtributo() {
    try {
        const suppliers = await Supplier.find();
        for (const supplier of suppliers) {
            supplier.category = 'Componentes';
            await supplier.save();
        }

    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        mongoose.disconnect();
    }
}

migrarNuevoAtributo();
