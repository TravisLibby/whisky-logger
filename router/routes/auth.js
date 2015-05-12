var express = require('express');
var router = express.Router();
var passport = require('passport');

var ensureAuthentication = require('../../middleware/ensureAuthentication');

// POST - user login
router.post('/login', function(req, res, next) {
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
router.get('/logout', ensureAuthentication, function(req, res) {
  req.logout();
  res.sendStatus(200);
});

module.exports = router;