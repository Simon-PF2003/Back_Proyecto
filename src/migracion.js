const mongoose = require('mongoose');
const User = require('./models/user'); 
const Product = require('./models/product');

async function migrarNuevoAtributo() {
    try {
        const products = await Product.find();
        for (const product of products) {
            product.pending = 0;
            await product.save();
        }

    } catch (error) {
        console.error('Error durante la migración:', error);
    } finally {
        mongoose.disconnect();
    }
}

migrarNuevoAtributo();
