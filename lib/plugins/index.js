var Config = require('../config'),
    Auth = require('../controllers').auth;

var internals = {};

internals.setStrategies = function (server) {
    // Set our strategy
    server.auth.strategy('session', 'cookie', {
        password: Config.auth.secret,
        domain: Config.auth.domain || '',
        redirectTo: false,
        isSecure: false,
        clearInvalid: true,
        ttl: 24 * 60 * 60 * 1000, // 1 day
        validateFunc: Auth.validateSession
    });

    server.auth.strategy('basic', 'basic', {
        validateFunc: Auth.validate
    });
};

internals.registerAuth = function (server, next) {
    var plugins = [{
        plugin: require('hapi-auth-cookie')
    }, {
        plugin: require('hapi-auth-basic')
    }];

    server.pack.register(plugins, function (err) {
        internals.setStrategies(server);
        next();
    });
};

internals.registerPlugins = function (server, next) {
    var plugins = [];

    plugins.push({
        plugin: require('lout'),
        options: {
            auth: 'session'
        }
    });

    plugins.push({
        plugin: require('bassmaster'),
        options: {
            batchEndpoint: '/api/batch'
        }
    });

    server.pack.register(plugins, function (err) {
        next();
    });
};

exports.init = function (server, options, next) {

    internals.registerAuth(server, function () {
        internals.registerPlugins(server, next);
    });
};
