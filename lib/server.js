var Hapi = require('hapi'),
    Hoek = require('hoek'),
    Async = require('async'),
    Helpers = require('./helpers'),
    Config = require('./config'),
    noop = Helpers.noop,
    envFlag = Helpers.envFlag;

var INIT_NEW = envFlag(process.env.INIT_NEW);

function loadModules(server, config, done) {
    var modules,
        opt;

    opt = {
        config: config
    };

    modules = [
        './logging',
        './error-handling',
        './cache',
        './models',
        './plugins',
        './api',
        './views',
        './routes'
    ];

    if (INIT_NEW) {
        modules.push('./seed');
    }

    function init(mod, next) {
        mod = require(mod);
        mod.init(server, opt, next);
    }

    Async.eachSeries(modules, init, done);
}

function initConfig(config) {
    Config.init(config);
}

function start(config) {
    var settings,
        defaultCache,
        server;

    initConfig(config);

    settings = Hoek.clone(Config.server);
    defaultCache = Hoek.clone(Config.cache.default);

    settings.options.cache = defaultCache.options;
    settings.options.cache.engine = require(defaultCache.engine);
    settings.options.state = { cookies: { strictHeader: false }};

    if (defaultCache.options.manifest) {
        settings.options.cache.manifest = require(defaultCache.options.manifest);
    }

    server = new Hapi.Server(settings.host, settings.port, settings.options);

    loadModules(server, Config, function (err) {
        if (err) {

            server.log(['error', 'serverStart'], err);
            console.error('Server failed to start');

        } else {
            server.start(function () {
                server.log('start', server.info);
            });
        }
    });
}

exports.start = start;
