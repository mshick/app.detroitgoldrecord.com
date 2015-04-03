var Model = require('model'),
    Helpers = require('../helpers'),
    Config = require('../config'),
    format = require('util').format,
    keyHash = Helpers.keyHash,
    dbConfig = Config.multilevel;

var Cache = function () {
    this.setAdapter('level', {
        sublevel: 'cache',
        keyPrefix: 'hapi-cache',
        multilevel: {
            port: dbConfig.port,
            host: dbConfig.host,
            manifest: require(dbConfig.manifest)
        }
    });

    this.defineProperties({
        item: {
            type: 'object'
        },
        stored: {
            type: 'number'
        },
        ttl: {
            type: 'number'
        }
    });
};

Cache.count = function (where, done) {
    var opts = {
        count: true
    };
    Cache.all(where, opts, done);
};

Cache.close = function (cb) {
    Cache.adapter.disconnect(cb);
};

Cache = Model.register('cache', Cache);

Cache.adapter.connect();

module.exports = Cache;
