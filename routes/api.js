module.exports = function (neode) {
    const router = require('express').Router();
    const tools = require('./tools')

    router.post('/api/relationship', (req, res) => {
        let data = Object.assign({}, req.params, req.body)
        return action = require('../actions/relationship').createRelationship(req, res, tools, neode, data)
    });

    //privacy done
    router.get('/api/query/lineage/:a_id', (req, res) => {
        Promise.all([
            neode.cypher('MATCH (a:User {id:{a_id}}) return a', req.params),
            neode.cypher('MATCH (a:User {id:{a_id}})-[:SENIOR*1..]->(b:User), p=shortestPath((a:User {id:{a_id}})-[:SENIOR*1..]->(b:User)) WHERE NOT a.id = b.id return b, p', req.params),
            neode.cypher('MATCH (a:User {id:{a_id}})-[:JUNIOR*1..]->(b:User), p=shortestPath((a:User {id:{a_id}})-[:JUNIOR*1..]->(b:User)) WHERE NOT a.id = b.id return b, p', req.params)
        ])
            .then(([focus, senior, junior]) => {
                if (!focus || !focus.records || !focus.records[0]) {
                    res.status(404).send()
                }
                let focusUser = tools.filterPrivacy(focus.records[0]._fields[0].properties)
                let seniorResult = []
                let juniorResult = []

                for (var i = 0; i < senior.records.length; i++) {
                    let filtered = tools.filterPrivacy(senior.records[i]._fields[0].properties)
                    let distance = senior.records[i]._fields[1].length
                    var obj = { "node": filtered, "distance": distance }
                    seniorResult.push(obj)
                }
                for (var j = 0; j < junior.records.length; j++) {
                    let filtered = tools.filterPrivacy(junior.records[j]._fields[0].properties)
                    let distance = junior.records[j]._fields[1].length
                    var obj = { "node": filtered, "distance": distance }
                    juniorResult.push(obj)
                }
                return { "focus": focusUser, "senior": seniorResult, "junior": juniorResult }
            })
            .then(result =>
                res.status(200).send(result)
            )
            .catch(e => {
                console.log(e)
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
                    let filtered = tools.filterPrivacy(json.records[i]._fields[0].properties)
                    promoResult.push(filtered)
                }
                return { "promo": promoResult }
            })
            .then(json => res.status(200).send(json))
            .catch(e =>
                res.status(500).send())
    });

    router.get('/api/users/find', function (req, res) {
        var basic = { lastname: "", firstname: "", end_year: "" };
        const data = Object.assign({}, basic, req.query)
        console.log(data)
        neode.cypher('MATCH (a:User) WHERE (a.lastname CONTAINS {lastname}) OR (a.firstname CONTAINS {firstname})  OR (a.lastname CONTAINS {lastname}) OR (a.firstname CONTAINS {firstname}) return a LIMIT 10', data)
            .then(promo => {
                let users = []
                for (var j = 0; j < promo.records.length; j++) {
                    let filtered = tools.filterPrivacy(promo.records[j]._fields[0].properties)
                    users.push(filtered)
                }
                return { "users": users }
            })
            .then(json => {
                res.status(200).send(json)
            })
            .catch(e =>
                res.status(500).send(e))
    });

    router.get('/api/events', function (req, res) {
        neode.cypher('MATCH p=()-[r:AUTHORED_BY]->() RETURN p LIMIT 25', {})
            .then(events => {
                let results = []
                for (var j = 0; j < events.records.length; j++) {
                    let event = events.records[j]._fields[0].start.properties
                    let autor = tools.filterPrivacy(events.records[j]._fields[0].end.properties)
                    results.push({ "event": event, "autor": autor })
                }
                return results
            })
            .then(json => res.status(200).send(json)
            )
            .catch(e =>
                res.status(500).send(e))
    });

    router.post('/api/events', function (req, res) {
        const data = Object.assign({}, req.params, req.body)
        const relationship = require('../actions/relationship')

        let props = {
            id: data.id,
            title: data.title,
            content: data.content,
            link: data.link,
            date: data.date,
            actor: data.autor,
            type: "create",
            properties: {}
        }
            neode.create('Event', props)
            .then(json => {
                props.other = json._properties.get('id')
                relationship.createRelationship(req, res, tools, neode, props)
            })
            .catch(e => {
                console.log(e)
                res.status(500).send(e)
            })
    })

    return router;
};
