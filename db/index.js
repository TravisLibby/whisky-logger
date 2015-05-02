var mongoose = require('mongoose');

var connection = mongoose.createConnection('mongodb://whiskyadmin:scotchyscotch@ds031962.mongolab.com:31962/whisky-logger', 3000);

module.exports = connection;