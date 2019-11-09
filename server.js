/**
 * A basic example using Express to create a simple movie recommendation engine.
 */
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const resource = require('@neode/express')

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

app.use(bodyParser.json())
app.use(require('./routes/api')(neode));
app.use('/api/users', resource(neode, 'User'))


/**
 * Listen for requests on port 3000
 */
app.listen(3000, function () {
    console.log('app listening on http://localhost:3000');
});
