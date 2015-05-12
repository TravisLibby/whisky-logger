var conn = require('../db');
var Whisky = conn.model('Whisky');

module.exports = function(req, res, next) {
  Whisky.findById(req.params.id, function(err, whisky) {
    if (!whisky) {
      return res.sendStatus(404);
    }
    if (err) {
      return res.sendStatus(500);
    }
    if (whisky.whiskyId !== req.user.id) {
      return res.sendStatus(403);
    }
    next();
  });
};