const mongoose = require('mongoose');
const User = require('./models/user'); 
const Product = require('./models/product');
const Supplier = require('./models/supplier');

async function migrarNuevoAtributo() {
    try {
        const products = await Product.find();
        for (const product of products) {
            product.brand = 'Marca';
            await product.save();
        }

    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        mongoose.disconnect();
    }
}

migrarNuevoAtributo();
