module.exports.createRelationship = function (req, res, tools, neode, data) {
    if (!(data.actor && data.other && data.properties && data.type)) {
        res.status(422).send({ "error": "No argument specified" })
    }
    let models = tools.getModels(data.type)
    Promise.all([
        neode.find(models[0], data.actor),
        neode.find(models[1], data.other)])
        .then(([a, b]) => {
            if (a == false || b == false) {
                res.status(422).send({ "Error": "No users found" })
            }
            else {
                let toReturn = { "actor": a._properties.get('id'), "other": b._properties.get('id'), "relation": data.type}
                a.relateTo(b, data.type, data.properties)
                    .then(json => {
                        b.relateTo(a, tools.getOppositeRelationship(data.type), data.properties)
                            .then(json => res.status(201).send(toReturn))
                            .catch(e => res.status(500).send(e))
                    })
                    .catch(e => res.status(422).send({ "error": e }))
            }
        })
        .catch(e => res.status(500).send(e))
}