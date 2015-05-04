var mongoose = require('mongoose');

var connection = mongoose.createConnection('mongodb://admin:scotchyscotch@ds031942.mongolab.com:31942/whisky-logger', 3000);

// models
var userSchema = require('./schemas/user');

// define models on the connection object
connection.model('User', userSchema);

module.exports = connection;