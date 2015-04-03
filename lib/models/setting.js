var Model = require('model'),
    Helpers = require('../helpers'),
    Config = require('../config'),
    format = require('util').format,
    keyHash = Helpers.keyHash,
    dbConfig = Config.multilevel;

var Setting = function () {
    this.defineProperties({
        id: {
            type: 'string',
            required: true,
            isSystem: true
        },
        key: {
            type: 'string',
            required: true
        },
        value: {
            type: 'string'
        },
        group: {
            type: 'string',
            require: true
        }
    });

    this.beforeValidate = function (params) {
        if (params.group && params.key) {
            params.id = format('%s:%s', params.group, params.key);
        }
    };
};

Setting.count = function (where, done) {
    var opts = {
        count: true
    };
    Setting.all(where, opts, done);
};

Setting.close = function (cb) {
    Setting.adapter.disconnect(cb);
};

Setting = Model.register('setting', Setting);

module.exports = Setting;
