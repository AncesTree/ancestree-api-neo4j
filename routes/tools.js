module.exports.filterPrivacy = function (dbData) {
    const privacyConstant = require('./constant')

    var raw = Object.assign({}, dbData)
    var filterP = ""
    let privacyPolicy = raw.privacy || "private"

    if (privacyPolicy == "private") {
        filterP = privacyConstant.privacy_private
    } else {
        filterP = privacyConstant.privacy_public
    }

    return filtered = Object.keys(raw)
        .filter(key => filterP.includes(key))
        .reduce((obj, key) => {
            obj[key] = raw[key];
            return obj;
        }, {});
}

module.exports.getOppositeRelationship = function (relation) {
    switch (relation) {
        case 'isSenior':
            return 'isJunior'
        case 'isJunior':
            return 'isSenior'
        case 'autor':
            return 'create'
        case 'create':
            return 'autor'
        default:
            return relation
    }
}

module.exports.getModels = function (relation) {
    switch (relation) {
        case 'isSenior':
            return ['User','User']
        case 'isJunior':
            return  ['User','User']
        case 'autor':
            return  ['Event','User']
        case 'create':
            return  ['User','Event']
        default:
            return relation
    }
}