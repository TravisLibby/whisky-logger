var express = require('express');

// initiate the app
var app = express();

// middleware
require('./middleware')(app);

// routes
require('./router')(app);

app.listen(3000);
console.log('Listening...');