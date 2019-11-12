/**
 * As this file requires an instance of neode, I've exported
 * a function that when called will return a new express Router.
 *
 * This can be added to express by calling
 *
 * app.use(require('./routes/api')(neode));
 *
 * @param {Neode} neode  Neode instance
 * @return {Router}      Express router
 */
module.exports = function(neode) {
    const router = require('express').Router();

    router.post('/api/relationship', (req, res) => {
        const data = Object.assign({}, req.params, req.body)
        console.log(data)
                Promise.all([
                    neode.find('User', data.actor),
                    neode.find('User', data.other)]
                 )
                 .then( ([a, b]) => {
                    a.relateTo(b, data.type, data.properties)
                    .then(res => { 
                        res.toJson}
                        )
                    .then(json => {
                        res.status(201)
                        res.send(json);
                    })
                    .catch(e => res.status(500).send)
                }
                ).catch(e => res.status(500).send)
    });

    return router;
};