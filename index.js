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

/*
// USER ROUTES
*/

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

// GET - find a user by id
app.get('/api/users/:userId', ensureAuthentication, function (req, res) {
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
    console.log(req.body);
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