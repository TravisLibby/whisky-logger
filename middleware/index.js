var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt');
var _ = require('lodash');

var passport = require('../auth');

module.exports = function(app) {

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false })); 

  // parse application/json
  app.use(bodyParser.json()); 

  // cookie parser
  app.use(cookieParser());

  // sessions
  app.use(session({
    secret: 'scotchyscotch',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 86400000} // 24 hours
  }));

  // passport setup
  // NOTE: Must be loaded after cookie-parser, body-parser, and session
  app.use(passport.initialize());
  app.use(passport.session());

};