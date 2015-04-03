var Path = require('path'),
    Hoek = require('hoek'),
    Model = require('model'),
    Config = require('../config'),
    Helpers = require('../helpers'),
    cacheConfig = Config.cache,
    appRoot = Config.appRoot;

var internals;

internals = {};

internals.caches = {};

internals.initCaches = function (server) {
    internals.caches.api = server.cache('api', {
        expiresIn: 7 * 24 * 60 * 60 * 1000,
        staleIn: 5 * 60 * 1000,
        staleTimeout: 250
    });

    internals.caches.session = server.cache('session', {
        expiresIn: 3 * 24 * 60 * 60 * 1000
    });
};

internals.clear = function (segments, db, done) {

    var opts = {};

    opts.sublevel = 'cache';
    opts.partition = 'hapi-cache';

    opts.segments = segments.map(function (val) {
        return '|' + val;
    });

    // db.drop(opts, done);
};

internals.clearCache = function (segment, done) {
    var segments,
        dbConfig,
        db;

    if (segment) {
        segments = [segment];
    } else {
        segments = Object.keys(internals.caches);
    }

    db = new Db();
    db.createClient(dbConfig.port, dbConfig.host, dbConfig);

    db.on('error', function (err) {
        done(err);
    });

    db.once('connect', function () {
        internals.clear(segments, db, done);
    });
};

exports.caches = internals.caches;

exports.clearCache = internals.clearCache;

exports.init = function (server, options, next) {
    internals.initCaches(server);
    next();
};
