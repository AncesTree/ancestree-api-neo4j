/**
 * A basic example using Express to create a simple movie recommendation engine.
 */
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
var cors = require('cors')
const resource = require('@neode/express')
const axios = require('axios');

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
  if (!req.headers.authorization) {
    res.status(403).send('Unauthorized')
  }
  let token = req.headers.authorization;
  if (token === 'null') {
    res.status(403).send('Unauthorized')
  }
  axios.get('https://ancestree-auth.igpolytech.fr/auth/checktoken', {headers: 
    {Authorization: token }
  }).then((result) => {
    console.log(result.status)
    if(result.status === 200){
      next()
    }
    else{
      res.status(403).send('Unauthorized')
    }
  }).catch(function (error) {
    // handle error
    console.log("error middleware check tocken: " + error);
  })
})
app.use(require('./routes/api')(neode));
app.use('/api/users', resource(neode, 'User'))


/**
 * Listen for requests on port 3000
 */
app.listen(3000, function() {
  console.log('app listening on http://localhost:3000');
});