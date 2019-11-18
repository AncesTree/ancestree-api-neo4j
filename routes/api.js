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
module.exports = function (neode) {
    const router = require('express').Router();

    router.post('/api/relationship', (req, res) => {
        const data = Object.assign({}, req.params, req.body)
        if (data.actor && data.other && data.properties && data.type) {
            Promise.all([
                neode.find('User', data.actor),
                neode.find('User', data.other)]
            )
                .then(([a, b]) => {
                    if (a == false || b == false) {
                        res.status(422).send({ "error": "No users found" })
                    }
                    else {
                        a.relateTo(b, data.type, data.properties)
                            .then(json => {
                                res.status(201).send({ "actor": json._start._properties, "other": json._end._properties });
                            })
                            .catch(e => res.status(422).send({ "error": e }))
                    }
                })
                .catch(e => res.status(500).send(e))
        }
        else {
            res.status(422).send({ "error": "No argument specified" })
        }
    });

    router.get('/api/query/lineage/:a_id', (req, res) => {
        Promise.all([
            neode.cypher('MATCH (a:User {id:{a_id}}) return a', req.params),
            neode.cypher('MATCH (a:User {id:{a_id}})-[:SENIOR*1..]->(b:User), p=shortestPath((a:User {id:{a_id}})-[:SENIOR*1..]->(b:User)) return b, p', req.params),
            neode.cypher('MATCH (a:User {id:{a_id}})-[:JUNIOR*1..]->(b:User), p=shortestPath((a:User {id:{a_id}})-[:JUNIOR*1..]->(b:User)) return b, p', req.params)
        ])
            .then(([focus, senior, junior]) => {
                if(!focus){
                    res.status(404).send()
                }
                let focusUser = focus.records[0]._fields[0].properties
                let seniorResult = []
                let juniorResult = []
                for (var i = 0; i < senior.records.length; i++) {
                    var obj = { "node": senior.records[i]._fields[0].properties, "distance": senior.records[i]._fields[1].length }
                    seniorResult.push(obj)
                }
                for (var j = 0; j < junior.records.length; j++) {
                    var obj = { "node": junior.records[j]._fields[0].properties, "distance": junior.records[j]._fields[1].length }
                    juniorResult.push(obj)
                }
                return {"focus": focusUser, "senior": seniorResult, "junior": juniorResult }
            })
            .then(result =>
                res.status(200).send(result)
            )
            .catch(e => {
                res.status(500).send();
            });

    });

    router.get('/api/query/promo/:end_year', function (req, res) {
        const data = Object.assign({}, req.params, req.body)
        const builder = neode.query();
        builder.match('p', 'User')
            .where('p.end_year', data.end_year)
            .return('p')
            .execute()
            .then(json => {
                let promoResult = []
                for (var i = 0; i < json.records.length; i++) {
                    var obj = { "node": json.records[i]._fields[0].properties}
                    promoResult.push(obj)
                }
                return promoResult
            })
            .then(json => res.status(200).send(json))
            .catch(e =>
                res.status(500).send())
    });

    router.get('/api/users/find', function (req, res) {
        var basic = { lastname: "", firstname: "", end_year: "" };
        const data = Object.assign({}, basic, req.query)
        //nom + prenom + promo
        //nom + prenom  
        //nom + promo
        //rien
        neode.cypher('MATCH (a:User) WHERE a.lastname CONTAINS {lastname} AND a.firstname CONTAINS {firstname} return a LIMIT 10', data)
            .then(promo => {
                let users = []
                for (var j = 0; j < promo.records.length; j++) {
                    var obj = { "node": promo.records[j]._fields[0].properties }
                    users.push(obj)
                }
                return { "users": users }
            })
            .then(json => {
                res.status(200).send(json)
            })
            .catch(e =>
                res.status(500).send(e))
    });

    return router;
};
