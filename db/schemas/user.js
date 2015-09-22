var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String
  }
});

userSchema.pre('save', function(next) {
  var self = this;
  bcrypt.hash(this.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    self.password = hash;
    next();
  });
});

userSchema.methods.toClient = function() {
  return {
    _id: this.id,
    username: this.username
  };
}

module.exports = userSchema;