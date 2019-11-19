module.exports = {
  checkWithId: function (idFromToken, idFromRoute, res) {

    app.use(function (req, res, next) {
      console.log(req.method)
    })
    
    if (idFromRoute === idFromToken) {
      next()
    }
    else {
      res.status(503).send()
    }
  }
};
