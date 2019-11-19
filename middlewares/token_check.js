module.exports = {
    auth_check: function (req, res, next) {
        const axios = require('axios');
        if (!req.headers.authorization) {
            res.status(403).send('Unauthorized')
        }
        let token = req.headers.authorization;
        if (token === 'null') {
            res.status(403).send('Unauthorized')
        }
        axios.get('https://ancestree-auth.igpolytech.fr/auth/checktoken',
            {
                headers: {
                    Authorization: token
                }
            }).then((result) => {
                console.log(result.status)
                console.log(result.body.id)
                if (result.status === 200) {
                    console.log(req)

                    req.idFromToken = result.body.id
                    return next()
                }
                else {
                    res.status(403).send('Unauthorized')
                }
            })
            .catch(e => {
                res.status(500).send();
            })
    }

}
