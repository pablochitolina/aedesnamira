// Load required packages
var mongoose = require('mongoose');

// Define our modelo schema
var ModeloSchema   = new mongoose.Schema({

  data: { type: String, required: true},
  contagem: [{
      data: { type: String, required: true},
      prec: { type: Number, required: true},
      ovos: { type: Number, required: true },
      larvas: { type: Number, required: true },
      pupas: { type: Number, required: true },
      adultos: { type: Number, required: true }
  }]
});

// Export the Mongoose model
module.exports = mongoose.model('Modelo', ModeloSchema);