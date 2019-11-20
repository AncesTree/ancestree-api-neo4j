module.exports = {
  checkWithId: function (req, res, next, idFromAuth, idFromRoute, roles) {
    console.log(idFromRoute, idFromAuth)
    if (idFromAuth == idFromRoute) {
      next()
    }
    else {
      let method = req.method
      let allowedMethods = ['GET', 'POST', 'PUT']
      if (roles.includes(req.method) || roles.includes('ADMIN')) {
        next()
      }
      else {
        res.status(403).send('Forbidden')
      }
    }
  }
};
