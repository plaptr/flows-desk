const mongoose = require("mongoose");
require("mongoose-type-email");
const Cliente = new mongoose.Schema({
  codice: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },

  nominativo: { type: String, required: true },
  tipo_contabilita: { type: Number, required: true },
  cf_piva: { type: String, required: true },
  emails: [{ email: mongoose.SchemaTypes.Email, descrizione: String }],

  telefono: [
    {
      numero: {
        type: String,
        validate: {
          validator: (v) => /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(v),
          message: (props) => `${props.value} is not a valid phone number`,
        },
      },
      descrizione: String,
    },
  ],

  pec: mongoose.SchemaTypes.Email,

  indirizzo: {
    via: String,
    cap: String,
    localita: String,
  },

  categoria: String,
});

module.exports = mongoose.model("Clienti", Cliente);
