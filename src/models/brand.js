const { Schema, model } = require('mongoose');

const brandSchema = new Schema(
  {
    brand: { type: String, required: true, trim: true, unique: true }
  },
  { timestamps: true }
);

module.exports = model('Brand', brandSchema);