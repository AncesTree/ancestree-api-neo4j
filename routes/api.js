module.exports = function (neode) {
    const router = require('express').Router();
    const tools = require('./tools')

    router.post('/api/relationship', (req, res) => {
        let data = Object.assign({}, req.params, req.body)
        console.log(req.params)
        console.log(req.body)
        console.log(data)
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
        var basic = { search: "*"};
        const data = Object.assign({}, basic, req.query)
        neode.cypher('MATCH (a:User) WHERE (a.lastname =~ "(?i).*'+data.search+'.*") OR (a.firstname =~ "(?i).*'+data.search+'.*") return a LIMIT 15', data)
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
        let event = {
            title: data.title,
            content: data.content,
            link: data.link,
            date: data.date, 
        }
        let props = {
            actor: data.id,
            type: "create",
            properties: {}
        }
            neode.create('Event', event)
            .then(json => {
                props.other = json._properties.get('id')
                relationship.createRelationship(req, res, tools, neode, props)
                })
            .catch(e => {
                console.log(e)
                res.status(500).send(e)
            })
    })

    router.post('/api/users/:a_id', function (req, res) {
        const data = Object.assign({}, req.params, req.body)
        neode.cypher('MATCH (a:User {id:{a_id}}) SET a.return a', data)
            .then(user => {
                let unfiltered = user.records[0]._fields[0].properties
                let filtered = tools.filterPrivacy(user.records[0]._fields[0].properties)
                if(unfiltered.id == data.a_id){
                    return { "users": unfiltered }
                }
                else {
                    return { "users": filtered }
                }
            })
            .then(json => {
                res.status(200).send(json)
            })
            .catch(e =>
                res.status(500).send(e))
    });

    router.put('/api/users/:a_id', function (req, res) {
        const data = Object.assign({}, req.params, req.body)
        console.log(data)
        neode.find('User', data.a_id)
        .then( result => {
            result.update({
                firstname: data.firstname || result._properties.get('firstname'),
                lastname: data.lastname || result._properties.get('lastname'),
                birthdate: data.birthdate || result._properties.get('birthdate'),
                phone: data.phone || result._properties.get('phone'),
                email: data.email || result._properties.get('email'),
                start_year: data.start_year || result._properties.get('start_year'),
                end_year: data.end_year || result._properties.get('end_year'),
                privacy: data.privacy || result._properties.get('privacy'),
                profileImageUrl: data.profileImageUrl || result._properties.get('profileImageUrl'),
                departement: data.departement || result._properties.get('departement'),
                company: data.company || result._properties.get('company'),
                profession: data.profession || result._properties.get('profession')
            })
            .then(json => res.status(200).send()
            )
            .catch(e => {res.status(500).send()})
        })
        .catch( e => {res.status(500).send()})
    });

    return router;
};
