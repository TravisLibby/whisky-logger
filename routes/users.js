var express = require('express');
var router = express.Router();


// POST - create a user
router.post('/api/users', function (req, res) {
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