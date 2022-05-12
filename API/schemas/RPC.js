const mongoose = require("mongoose");

const RPC = new mongoose.Schema({
  anno: { type: Number, required: true, index: true },
  id_cliente: { type: mongoose.Types.ObjectId, required: true, index: true },
  sistema_contabilita: { type: Number, required: true },
  stati: [Boolean],
});

module.exports = mongoose.model("RPC", RPC);
