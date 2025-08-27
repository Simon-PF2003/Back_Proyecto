const { Schema, model } = require('mongoose');

const supplierSchema = new Schema ({
    cuit: String,
    businessName: String,
    address: String,
    phoneNumber: String,
    products: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Product'             
    }],
}, {
    timestamps: true
});

module.exports = model('Supplier', supplierSchema);