var Model = require('model'),
    Helpers = require('../helpers'),
    Config = require('../config'),
    format = require('util').format,
    keyHash = Helpers.keyHash,
    dbConfig = Config.multilevel;

var Harvest = function () {
    this.defineProperties({
        tag: {
            type: 'string',
            required: true
        },
        provider: {
            type: 'string',
            required: true
        },
        processed: {
            type: 'number'
        },
        seen: {
            type: 'number'
        },
        written: {
            type: 'number'
        },
        backAnchor: {
            type: 'string'
        },
        timedOut: {
            type: 'boolean'
        },
        elapsed: {
            type: 'number'
        },
        error: {
            type: 'string'
        },
        retries: {
            type: 'number'
        },
        time: {
            type: 'number'
        }
    });
};

Harvest.count = function (where, done) {
    var opts = {
        count: true
    };
    Harvest.all(where, opts, done);
};

Harvest.close = function (cb) {
    Harvest.adapter.disconnect(cb);
};

Harvest = Model.register('harvest', Harvest);

module.exports = Harvest;
