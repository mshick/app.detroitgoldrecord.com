var Path = require('path'),
    Hoek = require('hoek'),
    envFlag = require('../helpers').envFlag;

var appRoot,
    defaultConfig,
    envOverrides;

appRoot = Path.resolve(__dirname, '../../');

defaultConfig = {
    appRoot: appRoot,
    server: {
        host: 'localhost',
        port: 8888,
        options: {}
    },
    env: 'development',
    static: {
        path: Path.resolve(appRoot, 'static')
    },
    cache: {
        default: {
            engine: 'catbox-multilevel',
            options: {
                host: '127.0.0.1',
                port: 3000,
                sublevel: 'cache'
            },
            expiresIn: 604800000,
            staleIn: 300000
        }
    },
    views: {
        path: Path.resolve(appRoot, 'templates'),
        partialsPath: Path.resolve(appRoot, 'templates', 'partials'),
        helpersPath: Path.resolve(appRoot, 'templates', 'helpers'),
        layout: true
    },
    onError: 'restart'
};

envOverrides = {
    server: {
        host: process.env.HOST,
        port: process.env.PORT ? Number(process.env.PORT) : undefined
    },
    log: {
        path: envFlag(process.env.LOG_PATH)
    },
    env: process.env.NODE_ENV,
    onError: process.env.ON_ERROR

};

function expandPaths(config) {
    var val,
        firstChar;

    for (var prop in config) {

        val = config[prop];

        if (!val) continue;

        if (val instanceof Object) {
            expandPaths(val);
        }

        if (typeof(val) === 'string' && (prop === 'path' || prop === 'manifest')) {
            firstChar = val.charAt(0);
            Hoek.assert(firstChar === '.' || firstChar === '/', 'Paths must start with a `.` or `/`');
            if (firstChar === '.') {
                config[prop] = Path.resolve(appRoot, val);
            }
        }
    }
}

function ConfigManager(config) {

    Object.defineProperty(this, '_config', {
        writable: true,
        enumerable: false,
        configurable: true,
        value: {}
    });

    this.set(config);
}

ConfigManager.prototype.init = function (rawConfig) {

    this.set(rawConfig);
};

ConfigManager.prototype.set = function (config) {

    var self = this;

    // deep merge
    this._config = Hoek.applyToDefaults(this._config, config);

    // overrides
    this._config = Hoek.applyToDefaults(this._config, envOverrides);

    // Expand some relative paths
    expandPaths(this._config);

    function define(prop) {
        Object.defineProperty(self, prop, {
            enumerable: true,
            configurable: true,
            value: self._config[prop]
        });
    }

    for (var prop in this._config) {
        define(prop);
    }

    return this;
};

module.exports = new ConfigManager(defaultConfig);
