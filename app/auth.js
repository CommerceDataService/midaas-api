var basic_auth = require('basic-auth');

var auth = function(req, res, next) {
    var user = basic_auth(req);

    if (user === undefined || user.name !== process.env.MIDAAS_API_USERNAME || user.pass !== process.env.MIDAAS_API_PASSWORD) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="midaas-api"');
        res.end('Unauthorized');
    } else {
        next();
    }
};

module.exports = auth;
