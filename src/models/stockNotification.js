const { Schema, model } = require('mongoose');

const stockNotificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    notified: {
        type: Boolean,
        default: false
    }
});

module.exports = model('StockNotification', stockNotificationSchema);