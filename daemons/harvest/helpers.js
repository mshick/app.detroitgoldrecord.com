var internals = {};

internals.basicAuthHeader = function (credentials) {
    var user = credentials.username;
    var pass = credentials.password;
    var encoded = new Buffer(user + ':' + pass).toString('base64');

    return 'Basic ' + encoded;
};

exports.authHeader = internals.basicAuthHeader;
