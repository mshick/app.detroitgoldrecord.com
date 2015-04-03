var Model = require('model'),
    Helpers = require('../helpers'),
    Config = require('../config'),
    keyHash = Helpers.keyHash,
    slugify = Helpers.slugify,
    appRoot = Config.appRoot,
    dbConfig = Config.multilevel;

var Page = function () {
    this.defineProperties({
        id: {
            type: 'string',
            required: true,
            isSystem: true
        },
        hkey: {
            type: 'string',
            required: true
        },
        path: {
            type: 'string',
            required: true
        },
        title: {
            type: 'string',
            required: true
        },
        body: {
            type: 'text'
        },
        hidden: {
            type: 'boolean',
            required: true
        },
        createdBy: {
            type: 'string'
        },
        updatedBy: {
            type: 'string'
        }
    });

    this.beforeValidate = function (params) {

        if (!params.path && params.title) {
            params.path = slugify(params.title);
        }

        if (!params.hkey && params.path) {
            params.hkey = params.path;
        }

        if (!params.id && params.hkey) {
            params.id = keyHash(params.hkey);
        }

        params.hidden = params.hidden || false;
    };
};

Page.count = function (where, done) {
    var opts = {
        count: true
    };
    Page.all(where, opts, done);
};

Page.close = function (cb) {
    Page.adapter.disconnect(cb);
};

Page = Model.register('page', Page);

module.exports = Page;
