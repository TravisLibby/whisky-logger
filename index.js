var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt');

var passport = require('./auth');

// initiate the app
var app = express();

// db connection and models
var conn = require('./db');
var User = conn.model('User');

// middleware
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(cookieParser());
app.use(session({
  secret: 'scotchyscotch',
  resave: false,
  saveUninitialized: true
}));

// passport setup
app.use(passport.initialize());
app.use(passport.session());

// ensure authentication middleware
function ensureAuthentication(req, res, next) {
  if (!req.isAuthenticated()) {
    res.sendStatus(403); // not authenticated
  }
  next(); 
}

// POST - create a user
app.post('/api/users', function (req, res) {
  User.create(req.body, function (err, user) {
    if (err) {
      if (err.code === 11000) {
        return res.sendStatus(409); // conflict
      } else {
        return res.sendStatus(500); // server error
      }
    }
    // establish a session for the user
    req.login(user, function(err) {
      if (err) {
        return res.sendStatus(500);
      }
      res.sendStatus(200); // ok - user created and session established
    });
  });  
});

// POST - user login
app.post('/api/auth/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { 
      res.sendStatus(500);
    }
    if (!user) { 
      return res.sendStatus(403);
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.send({user: user.toClient()});
    });
  })(req, res, next);
});

// GET - find a user
app.get('/api/users/:userId', function (req, res) {
  User.findById(req.params.userId, function (err, user) {
    if (!user) {
      return res.sendStatus(404); // No user found
    }
    if (err) {
      return res.sendStatus(500);
    }
    res.send({user: user.toClient()});
  });
});

// PUT - update user password
app.put('/api/users/:userId', ensureAuthentication, function(req, res) {
  var newPassword = req.body.password;
  var userId = req.params.userId;
  // Make sure this is the right user
  if (req.user.id !== userId) {
    return res.sendStatus(403);
  }
  // encrypt new password TODO - move this encryption to the userSchema
  bcrypt.hash(newPassword, 10, function(err, hash) {
    if (err) {
      res.sendStatus(500);
    }
    newPassword = hash;
    User.findByIdAndUpdate(userId, {password: newPassword}, function(err, user) {
    if (err) {
      return res.sendStatus(500);
    }
    res.sendStatus(200);
    });
  });
})

app.listen(3000);
console.log('Listening...');