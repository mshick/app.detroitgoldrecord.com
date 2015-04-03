exports.artifacts = require('./artifacts');
exports.pages = require('./pages');
exports.data = require('./data');
exports.settings = require('./settings');
exports.harvests = require('./harvests');
exports.caches = require('./caches');

exports.init = function (server, options, next) {
    next();
};
