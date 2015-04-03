var Bcrypt = require('bcrypt'),
    caches = require('../cache').caches,
    users = require('../config').users;

var internals = {};

internals.validate = function (username, password, callback) {

    var user = users[username];
    if (!user) {
        return callback(null, false);
    }

    Bcrypt.compare(password, user.hash, function (err, isValid) {

        callback(err, isValid, {
            username: user.username,
            name: user.name
        });
    });
};

internals.validateSession = function (session, callback) {
    var cache = caches.session;

    cache.get(session.sid, function (err, cached) {

        if (err) {
            return callback(err, false);
        }

        if (!cached) {
            return callback(null, false);
        }

        return callback(null, true, cached.item.account);
    });
};

module.exports = internals;
