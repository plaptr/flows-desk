const mongoose = require("mongoose");

const MovimentiEstrattiConto = new mongoose.Schema({
  anno: { type: Number, required: true },
  id_cliente: { type: mongoose.Types.ObjectId, required: true },
  data: {
    type: Date,
    default: () => Date.now(),
  },
  descrizione: String,
  importo: { type: Number, required: true },
});

module.exports = mongoose.model("MovimentiEstrattiConto", MovimentiEstrattiConto);
