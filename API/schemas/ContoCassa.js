const mongoose = require("mongoose");
const ContoCassa = new mongoose.Schema({
  anno: {
    type: Number,
    unique: true,
    index: true,
  },
  mese: { type: Number, required: true, min: 1, max: 12 },
  data: { type: Date, default: () => Date.now() },
  descrizione: String,
  importo: Number,
  fatturato: Number,
});

module.exports = mongoose.model("ContoCassa", ContoCassa);
