module.exports.username = function(app) {
    return function(req, res, next) {
        if(!req.body.username) {
            return res.status(400).json({
                error: true,
                errorMSG: "no username provided"
            });
        }

        app.service('users').find({
            query: { username: req.body.username }
        }).then(users => {
            if(users.total > 0) {
                return res.json({
                    available: false,
                    error: false
                })
            }

            return res.json({
                available: true,
                error: false
            })
        }).catch(e => {
            console.error(e);
            return res.json({
                available: false,
                error: true,
                errorMSG: "something went wrong"
            })
        })
    };
};

module.exports.email = function(app) {
    return function(req, res, next) {
        if(!req.body.email) {
            return res.status(400).json({
                error: true,
                errorMSG: "no email provided"
            });
        }

        app.service('users').find({
            query: { email: req.body.email }
        }).then(users => {
            if(users.total > 0) {
                return res.json({
                    available: false,
                    error: false
                })
            }

            return res.json({
                available: true,
                error: false
            })
        }).catch(e => {
            console.error(e);
            return res.json({
                available: false,
                error: true,
                errorMSG: "something went wrong"
            })
        })
    };
};