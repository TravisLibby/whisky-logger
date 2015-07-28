var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');

var conn = require('../../db');
var User = conn.model('User');

var ensureAuthentication = require('../../middleware/ensureAuthentication');

// POST - create a user
router.post('/', function (req, res) {
  console.log(req.body.user);
  User.create(req.body.user, function (err, user) {
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
      res.status(200).send({user: user.toClient()}); // ok - user created and session established
    });
  });  
});

// GET - find a user by id
router.get('/:userId', ensureAuthentication, function (req, res) {
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
router.put('/:userId', ensureAuthentication, function(req, res) {
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

module.exports = router;
