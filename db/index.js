var mongoose = require('mongoose');

var connection = mongoose.createConnection('mongodb://whiskyadmin:scotchyscotch@ds031962.mongolab.com:31962/whisky-logger', 3000);

// models
var userSchema = require('./schemas/user');

// define models on the connection object
connection.model('User', userSchema);

module.exports = connection;