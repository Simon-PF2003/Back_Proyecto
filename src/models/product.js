const { Schema, model } = require('mongoose');

const productSchema = new Schema ({
    brand: String,
    desc: String,
    stock: Number,
    price: Number,
    image: String,
    cat: String,
    stockMin: Number,
    featured: Boolean,
    supplier: { 
        type: Schema.Types.ObjectId, 
        ref: 'Supplier',                
        required: true              
      },
    pending: Number,
    code: {
        type: Number,
        unique: true,
        index: true,
        sparse: true, // este sparse es para que se permita que existan productos sin este campo
        immutable: true // para que no se pueda cambiar por cualquieeeer cosa
      },
}, {
    timestamps: true
});

module.exports = model('Product', productSchema);
