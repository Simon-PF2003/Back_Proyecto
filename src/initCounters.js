const mongoose = require('mongoose');
const Product = require('./models/product');
const Counter = require('./models/counter');

async function sync() {
  try {
    if (typeof Counter.syncWithModel === 'function') {
      await Counter.syncWithModel(Product, 'code', 'productos');
    } else {
      const maxDoc = await Product.findOne({ code: { $ne: null } })
        .sort({ code: -1 })
        .select('code')
        .lean();
      const max = maxDoc?.code ?? 0;

      await Counter.updateOne(
        { _id: 'productos' },
        { $max: { seq: max } },
        { upsert: true }
      );
    }
    console.log('[initCounters] Contador "productos" sincronizado con Product.code');
  } catch (err) {
    console.error('[initCounters] Error al sincronizar contador "productos":', err);
  }
}

// Ejecutar sin importar el orden de los require por las dudas que me haya equivocado y se ejecute algo antes del sync de la base de datos
if (mongoose.connection.readyState === 1) {
  sync();
} else {
  mongoose.connection.once('open', sync);
}

module.exports = {};
