module.exports = {
  checkWithId: function (req, res, next, idFromAuth, idFromRoute) {
    console.log("middleware -- ")
    console.log(idFromRoute, idFromAuth)
    if(idFromAuth == idFromRoute){
      next()
    }
    else{
      res.status(403).send('Forbidden')
    }
  }
};
