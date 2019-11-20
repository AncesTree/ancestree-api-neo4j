const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
var cors = require('cors')
const resource = require('@neode/express')
const token_check = require('./middlewares/token_check')
const permission_check = require('./middlewares/access_control')

/**
 * Load Neode with the variables stored in `.env` and tell neode to
 * look for models in the ./models directory.
 */
const neode = require('neode')
  .fromEnv()
  .withDirectory(path.join(__dirname, 'models'));

/**
 * Create a new Express instance
 */
const app = express();
app.use(cors())
app.use(bodyParser.json())

app.use(function (req, res, next) {
  token_check.auth_check(req, res, next)
})

app.use(require('./routes/api')(neode));

/*
app.use(function (req, res, next) {
  console.log(req.idFromToken)
  permission_check.checkWithId(req, res, next)
})
*/
app.use('/api/users', resource(neode, 'User'))
app.use('/api/events', resource(neode, 'Event'))

app.use(function (req, res) {
  res.status(404).send();
});


/**
 * Listen for requests on port 3000
 */
app.listen(3000, function () {
  console.log('app listening on http://localhost:3000');
});