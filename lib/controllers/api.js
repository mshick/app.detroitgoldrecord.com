var Hapi = require('hapi'),
    Api = require('../api'),
    Helpers = require('../helpers'),
    caches = require('../cache').caches,
    requestToQuery = Helpers.requestToQuery,
    requestToCacheKey = Helpers.requestToCacheKey;

var internals;

internals = {};

internals.browse = function (request, reply) {

    var collection,
        user,
        query,
        cacheKey,
        apiMethod;

    collection = request.params.collection;

    try {
        apiMethod = Api[collection].browse;
    } catch (e) {}

    if (!apiMethod) {
        reply(Hapi.error.methodNotAllowed());
        return;
    }

    user = request.auth.credentials;
    query = requestToQuery(request);
    cacheKey = requestToCacheKey(request);

    if (!user) {
        query.where = query.where || {};
        query.where.approved = true;
        query.where.hidden = false;
    }

    function generateFn(done) {
        apiMethod(query.where, query.options, done);
    }

    if (user) {
        generateFn(reply);
    } else {
        caches.api.getOrGenerate(cacheKey, generateFn, reply);
    }
};

internals.read = function (request, reply) {

    var collection,
        user,
        query,
        cacheKey,
        apiMethod;

    collection = request.params.collection;

    try {
        apiMethod = Api[collection].read;
    } catch (e) {}

    if (!apiMethod) {
        reply(Hapi.error.methodNotAllowed());
        return;
    }

    user = request.auth.credentials;
    query = requestToQuery(request);
    cacheKey = requestToCacheKey(request);

    if (!user) {
        query.where = query.where || {};
        query.where.approved = true;
        query.where.hidden = false;
    }

    function generateFn(done) {
        apiMethod(query.where, query.options, done);
    }

    if (user) {
        generateFn(reply);
    } else {
        caches.api.getOrGenerate(cacheKey, generateFn, reply);
    }
};

internals.edit = function (request, reply) {
    var params = request.params,
        collection = params.collection,
        payload = request.payload,
        user = request.auth.credentials,
        query,
        apiMethod;

    try {
        apiMethod = Api[collection].edit;
    } catch (e) {}

    if (!apiMethod) {
        reply(Hapi.error.methodNotAllowed());
        return;
    }

    query = requestToQuery(request);
    payload.updatedBy = user.username;

    apiMethod(payload, query.where, query.options, function (err, result) {

        if (err) return reply(err);

        if (result._created) {
            reply(result).code(201);
        } else {
            reply(result);
        }
    });
};

internals.add = function (request, reply) {

    var params = request.params,
        collection = params.collection,
        payload = request.payload,
        user = request.auth.credentials,
        options,
        apiMethod;

    try {
        apiMethod = Api[collection].add;
    } catch (e) {}

    if (!apiMethod) {
        reply(Hapi.error.methodNotAllowed());
        return;
    }

    payload.createdBy = user.username;
    payload.updatedBy = user.username;

    apiMethod(payload, options, function (err, result) {
        if (err) return reply(err);

        if (result._created) {
            reply(result).code(201);
        } else {
            reply(result);
        }
    });
};

internals.destroy = function (request, reply) {

    var p = request.params,
        q = request.query,
        collection = p.collection,
        user = request.auth.credentials,
        query = requestToQuery(request),
        payload,
        apiMethod,
        method;

    if (q.purge === 'true' || q.purge === '1') {
        method = 'destroy';
    } else {
        method = 'edit';
    }

    try {
        apiMethod = Api[collection][method];
    } catch (e) {}

    if (!apiMethod) {
        reply(Hapi.error.methodNotAllowed());
        return;
    }

    if (method === 'destroy') {

        apiMethod(query.where, query.options, function (err) {
            if (err) return reply(err);
            reply().code(204);
        });

    } else {

        payload = {};
        payload.updatedBy = user.username;
        payload.hidden = true;

        apiMethod(payload, query.where, query.options, function (err) {
            if (err) return reply(err);
            reply().code(204);
        });
    }
};

internals.truncate = function (request, reply) {

    var p = request.params,
        q = request.query,
        collection = p.collection,
        apiMethod;

    try {
        apiMethod = Api[collection].truncate;
    } catch (e) {}

    if (!apiMethod || q.truncate !== 'true') {
        reply(Hapi.error.methodNotAllowed());
        return;
    }

    apiMethod(function (err) {
        if (err) return reply(err);
        reply().code(204);
    });
};

// internals.submission = function (request, reply) {

//     var payload = request.payload,
//         options;

//     payload.submitted = true;

//     Api.videos.add(payload, options, function (err, result) {
//         if (err) return reply(err);
//         reply(result).code(201);
//     });
// };

module.exports = internals;
