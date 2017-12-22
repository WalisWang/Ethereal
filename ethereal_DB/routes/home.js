var secrets = require('../config/secrets');

module.exports = function (router) {
    var homeRoute = router.route('/');
    homeRoute.get(function (req, res) {
        var str = secrets.token;
        res.json({ message: 'The connection string of Wanli is ' + str });
    });
    return router;
}
