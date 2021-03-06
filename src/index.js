var osprey = require('osprey');
var express = require('express');
var join = require('path').join;
var app = express();
var users = require('./users');
var surveys = require('./surveys');
var authentication = require('./authentication');
var cors = require('express-cors');
var av = require('leanengine');

av.init({
  appId: process.env.LEANCLOUD_APP_ID,
  appKey: process.env.LEANCLOUD_APP_KEY,
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY
});

var path = join(__dirname, '../raml/survey.raml');

// Be careful, this uses all middleware functions by default. You might just
// want to use each one separately instead - `osprey.server`, etc.
osprey.loadFile(path)
    .then(function (middleware) {
      app.use(cors({
        allowedOrigins: (process.env.ORIGINS || '*').split(','),
        headers: ['Authentication', 'X-LC-Session', 'Content-Type']
      }));

      app.use(av.express());
      app.use(middleware);

      app.use('/authentication', authentication);
      app.use('/users', users);
      app.use('/surveys', surveys);

      app.listen(process.env.LEANCLOUD_APP_PORT || 3000)
    })
    .catch(function(e) { console.error("Error: %s", e.message); });
