var Model = require('model'),
    Hoek = require('hoek'),
    Config = require('../config');

var dbConfig = Config.database,
    dbOptions = dbConfig.options,
    defaultAdapter;

dbOptions = Hoek.applyToDefaults({}, dbOptions);
defaultAdapter = Model.createAdapter(dbConfig.engine, dbOptions);
Model.defaultAdapter = defaultAdapter;

exports.Artifact = require('./artifact');
exports.Page = require('./page');
exports.Setting = require('./setting');
exports.Harvest = require('./harvest');

// if (Config.env === 'development') {
//     exports.Cache = require('./cache');
// }

exports.init = function (server, options, next) {
    try {
        defaultAdapter.connect(next);
    } catch (err) {
        next(err);
    }
};
