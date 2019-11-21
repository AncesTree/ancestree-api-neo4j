module.exports = {
    auth_check: function (req, res, next) {
        const axios = require('axios');
        if (!req.headers.authorization) {
            res.status(401).send('Unauthorized')
        }
        let token = req.headers.authorization;
        if (token === 'null') {
            res.status(401).send('Unauthorized')
        }
        axios.get('https://ancestree-auth.igpolytech.fr/auth/checktoken',
            {
                headers: {
                    Authorization: token
                }
            }).then(result => {
                if (result.status == 200) {
                    console.log(result.data.id)
                    if(result.data.id){
                        req.body.id = result.data.id
                    }
                    return next()
                }
                else {
                    res.status(401).send('Unauthorized')
                }
            })
            .catch(e => {
                console.log(e.response)
                res.status(500).send();
            })
    }
}
