// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');

passport.use(new BasicStrategy(
  {usernameField: 'email', passwordField: 'senha'},
  function (email, senha, callback) {
    User.findOne({ email: email }, function (err, user) {
      if (err) { return callback(err); }

      if (!user) { return callback(null, false); }

      user.verifyPassword(senha, function (err, isMatch) {
        if (err) { return callback(err); }

        if (!isMatch) { return callback(null, false); }

        return callback(null, true);
      });
    });
  }
));

exports.isAuthenticated = passport.authenticate('basic', { session: false });