var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// db connection and models
var conn = require('./db');
var User = conn.model('User');

// middleware
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

// POST - create a user
app.post('/api/users', function (req, res) {
  console.log(req.body);
  User.create(req.body, function (err, user) {
    if (err) {
      if (err.code === 11000) {
        return res.sendStatus(409); // conflict
      } else {
        return res.sendStatus(500); // server error
      }
    }
    res.sendStatus(200); // ok - user created
  });  
});

// GET - find a user
app.get('/api/users/:userId', function (req, res) {
  User.findById(req.params.userId, function (err, user) {
    if (err) {
      return res.sendStatus(500);
    }
    res.send({user: user});
  });
});

app.listen(3000);
console.log('Listening...');