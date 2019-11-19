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