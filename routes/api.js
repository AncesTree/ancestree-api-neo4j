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
        Promise.all([
            neode.find('User', data.actor),
            neode.find('User', data.other)]
        )
            .then(([a, b]) => {
                a.relateTo(b, data.type, data.properties)
                    .then(res => {
                        res.toJson
                    }
                    )
                    .then(json => {
                        res.status(201)
                        res.send({ "actor": a, "other": b, "relation": data.type });
                    })
                    .catch(e => res.status(500).send)
            }
            ).catch(e => res.status(500).send)
    });

    router.get('/api/query/lineage/:a_id', (req, res) => {
        Promise.all([            
            neode.cypher('MATCH (a:User {id:{a_id}})-[:SENIOR*1..25]->(b:User), p=shortestPath((a:User {id:{a_id}})-[:SENIOR*1..25]->(b:User)) return b, p', req.params),
            neode.cypher('MATCH (a:User {id:{a_id}})-[:JUNIOR*1..25]->(b:User), p=shortestPath((a:User {id:{a_id}})-[:JUNIOR*1..25]->(b:User)) return b, p', req.params)    
        ])
        .then(([senior, junior]) => {
                //let focusUser = focusUser
                let seniorResult = []
                let juniorResult = []
                for (var i = 0; i < senior.records.length; i++) {
                    var obj = { "node": senior.records[i]._fields[0].properties, "distance": senior.records[i]._fields[1].length}
                    seniorResult.push(obj)  
                }
                for (var j = 0; j < junior.records.length; j++) {
                    var obj = { "node": junior.records[j]._fields[0].properties, "distance": junior.records[j]._fields[1].length}
                    juniorResult.push(obj)
                }
                return {"senior": seniorResult,"junior": juniorResult}
            })
            .then(result =>
                res.status(200).send(result)
            )
            .catch(e => {
                res.status(500).send();
            });

    });

    router.get('/api/query/promo/:end_year', function(req, res){
        const data = Object.assign({}, req.params, req.body)
        const builder = neode.query();    
        builder.match('p', 'User')
        .where('p.end_year', data.end_year)
        .return('p')
        .execute()
        .then(records => {
            return {"promo": records.records }
        })
        .then(json => {
            res.status(200).send(json)
        })
        .catch(e => 
            res.status(500).send())
      });

    router.get('/api/users/find', function(req, res){
        var basic = { lastname: "", firstname: "", end_year: "" };
        const data = Object.assign({}, basic, req.query)
        //nom + prenom + promo
        //nom + prenom  
        //nom + promo
        //rien
        neode.cypher('MATCH (a:User) WHERE a.lastname CONTAINS {lastname} AND a.firstname CONTAINS {firstname} return a LIMIT 10', data)    
        .then(promo => {
            let promoResults = []
            for (var j = 0; j < promo.records.length; j++) {
                var obj = { "node": promo.records[j]._fields[0].properties}
                promoResults.push(obj)
            }
            return {"promo": promoResults }
        })
        .then(json => {
            res.status(200).send(json)
        })
        .catch(e => 
            res.status(500).send(e))
      });

    return router;
};
