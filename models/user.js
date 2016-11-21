// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var uniqueValidator = require('mongoose-unique-validator');

// Define our user schema
var UserSchema = new mongoose.Schema({
  email: { type: String, index: true, unique: true, required: true },
  nome: { type: String, required: true },
  sobrenome: { type: String, required: true },
  senha: { type: String, required: true },
  ativo: { type: Boolean, default: false },
  token: { type: String, default: null },
  tipouser: { type: String, default: null, require: true },
  cidade: { type: String, default: null },
  senhaTemp: { type: String, default: null }
});

// Execute before each user.save() call
UserSchema.pre('save', function (callback) {
  var user = this;

  // Break out if the senha hasn't changed
  if (!user.isModified('senha')) return callback();
  
  user.cript(user.senha, function (err, hash) {
    if (err) { return callback(err); }
    user.senha = hash;
    callback();
  });

});

UserSchema.methods.cript = function (senha, cb) {
  bcrypt.genSalt(5, function (err, salt) {
    if (err) return callback(err);
    bcrypt.hash(senha, salt, null, function (err, hash) {
      if (err) return callback(err);
      cb(null, hash);
    });
  });
};

UserSchema.methods.verifyPassword = function (senha, cb) {
  bcrypt.compare(senha, this.senha, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UserSchema.plugin(uniqueValidator);

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);