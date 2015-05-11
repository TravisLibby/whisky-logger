var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt');
var _ = require('lodash');

var passport = require('./auth');

// initiate the app
var app = express();

// db connection and models
var conn = require('./db');
var User = conn.model('User');
var Whisky = conn.model('Whisky');

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
    return res.sendStatus(403); // Forbidden, not authenticated
  }
  next(); 
}

// delete authorization middleware
function isAuthorizedToDelete(req, res, next) {
  Whisky.findById(req.params.id, function(err, whisky) {
    if (err) {
      return res.sendStatus(500);
    }
    if (!whisky) {
      return res.sendStatus(404);
    }
    if (whisky.whiskyId !== req.user.id) {
      return res.sendStatus(403);
    }
    next();
  });
};

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

// GET - logout
app.get('/api/auth/logout', ensureAuthentication, function(req, res) {
  req.logout();
  res.sendStatus(200);
});

/*
// WHISKY ROUTES
*/

// POST - create a whisky review
app.post('/api/whiskies', ensureAuthentication, function(req, res) {
  req.body.whiskyId = req.user.id;
  Whisky.create(req.body, function(err) {
    if (err) {
      return res.sendStatus(500);
    }
    res.sendStatus(200);
  })
});

// GET - find a whisky by id
app.get('/api/whiskies/:id', ensureAuthentication, function(req, res) {
  Whisky.findById(req.params.id, function(err, whisky) {
    if (err) {
      return res.sendStatus(500);
    }
    if (!whisky) {
      return res.sendStatus(404);
    }
    res.send(whisky.toClient());
  });
});

// GET - all of a user's whiskies
app.get('/api/whiskies', ensureAuthentication, function(req, res) {
  Whisky.find({whiskyId: req.user.id}, function(err, whiskies) {
    if (err) {
      return res.sendStatus(500);
    }
    // TODO - find a cleaner way to do this
    for (var i = 0; i < whiskies.length; i++) {
      whiskies[i] = whiskies[i].toClient();
    }
    res.send(whiskies);
  });
});

// DELETE - delete a user's whisky
app.delete('/api/whiskies/:id', ensureAuthentication, isAuthorizedToDelete, function(req, res) {
  Whisky.findByIdAndRemove(req.params.id, function(err, whisky) {
    if (err) {
      return res.sendStatus(500);
    }
    res.sendStatus(200);
  });
});

app.listen(3000);
console.log('Listening...');