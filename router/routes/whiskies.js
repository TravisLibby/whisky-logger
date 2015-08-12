var express = require('express');
var router = express.Router();

var conn = require('../../db');
var Whisky = conn.model('Whisky');

var ensureAuthentication = require('../../middleware/ensureAuthentication');
var isAuthorizedToDelete = require('../../middleware/isAuthorizedToDelete');

// POST - create a whisky review
router.post('/', ensureAuthentication, function(req, res) {
  req.body.whisky.whiskyId = req.user.id;
  console.log(req.body.whiskyId);
  Whisky.create(req.body.whisky, function(err) {
    if (err) {
      return res.sendStatus(500);
    }
    res.status(200).send({'whisky': req.body.whisky});
  });
});

// GET - find a whisky by id
router.get('/:id', ensureAuthentication, function(req, res) {
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
router.get('/', ensureAuthentication, function(req, res) {
  Whisky.find({whiskyId: req.user.id}, function(err, whiskies) {
    if (err) {
      return res.sendStatus(500);
    }
    // TODO - find a cleaner way to do this
    for (var i = 0; i < whiskies.length; i++) {
      whiskies[i] = whiskies[i].toClient();
    }
    res.send({'whiskies': whiskies});
  });
});

// DELETE - delete a user's whisky
router.delete('/:id', ensureAuthentication, isAuthorizedToDelete, function(req, res) {
  Whisky.findByIdAndRemove(req.params.id, function(err, whisky) {
    if (err) {
      return res.sendStatus(500);
    }
    res.status(200).send({'whisky': req.body.whisky});
  });
});

module.exports = router;
