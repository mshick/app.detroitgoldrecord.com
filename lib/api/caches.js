var Cache = require('../models').Cache,
    Hapi = require('hapi'),
    notFound = Hapi.error.notFound();

var caches = {};

caches.browse = function (where, options, done) {
    Cache.all(where, options, done);
};

caches.read = function (where, options, done) {
    Cache.first(where, options, function (err, doc) {
        if (err) return done(err);
        if (!doc) return done(notFound);

        done(null, doc);
    });
};

caches.truncate = function (done) {
    Cache.remove({}, done);
};

module.exports = caches;
