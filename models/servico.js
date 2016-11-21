// Load required packages
var mongoose = require('mongoose');

// Define our servico schema
var ServicoSchema   = new mongoose.Schema({

  filename: { type: String, default: null, unique: true},
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  desc: { type: String, required: true },
  data: { type: String, required: true},
  estado: { type: String },
  cidade: { type: String, required: true },
  bairro: { type: String },
  rua: { type: String },
  endereco: { type: String, required: true },
  status: { type: String, index: true, require: true },
  iduser: { type: String, index: true, require: true}

});

// Export the Mongoose model
module.exports = mongoose.model('Servico', ServicoSchema);