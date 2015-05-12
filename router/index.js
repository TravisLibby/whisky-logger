module.exports = function(app) {
  app.use('/api/users', require('./routes/users'));
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/whiskies', require('./routes/whiskies'));
};