var Hapi = require('hapi'),
    Api = require('../api'),
    Helpers = require('../helpers');

var internals = {};

internals.read = function (request, reply) {
    var params = request.params,
        group = params.group;

    Api.settings.read(params.group, reply);
};

internals.edit = internals.add = function (request, reply) {
    var params = request.params,
        group = params.group,
        key = params.key,
        payload = request.payload;

    Api.settings.add(group, key, payload, reply);
};

module.exports = internals;
