const { Schema, model, models } = require('mongoose');

const counterSchema = new Schema(
  {
    _id: { type: String, required: true }, // ej: "productos"
    seq: { type: Number, default: 0 },
  },
  { versionKey: false }
);

// Calcula el siguiente número en la secuencia je
counterSchema.statics.getNext = async function (sequenceName, session = null) {
  const doc = await this.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session, lean: true }
  );
  return doc.seq;
};

// Sincroniza seq con el máximo encontrado de lo que le mandes (esto lo checkeamos desde el index preguntandole si lo sincronizo)
counterSchema.statics.syncWithModel = async function (Model, field, sequenceName) {
  const maxDoc = await Model.findOne({ [field]: { $ne: null } })
    .sort({ [field]: -1 })
    .select(field)
    .lean();
  const max = maxDoc?.[field] ?? 0;
  await this.updateOne(
    { _id: sequenceName },
    { $max: { seq: max } },
    { upsert: true }
  );
};

module.exports = models.Counter || model('Counter', counterSchema);
