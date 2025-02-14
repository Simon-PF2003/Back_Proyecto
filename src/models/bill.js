const { Schema, model } = require('mongoose');

const billSchema = new Schema ({
    items:[],
    total: Number,
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',                
      required: true              
    },
    orderId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Order',                
      required: true              
    },
},{
  timestamps: true 
});

module.exports = model('Bill', billSchema)
