var Data = require('../api').data,
    Models = require('../models'),
    Hapi = require('hapi'),
    Cache = require('../cache'),
    format = require('util').format,
    Config = require('../config'),
    identity = Config.identity,
    slugify = require('../helpers').slugify,
    env = Config.env;

exports.dataDump = function (request, reply) {
    var params = request.params,
        type = params.type,
        options;

    options = {
        type: type
    };

    Data.dump(options, function (err, dumpStream) {
        var dateString,
            dumpName;

        type = type || identity.siteName;
        dateString = (new Date()).toDateString();
        dumpName = format('%s-%s.json', slugify(type), slugify(dateString));

        reply(dumpStream)
            .header('content-disposition', 'attachment; filename=' + dumpName);
    });
};

// NOTE: Ingest is handled as a file rather than a stream,
//       to ensure complete uploads before processing.

exports.dataImport = function (request, reply) {

    var params = request.params,
        query = request.query,
        type = params.type,
        dataFile = request.payload,
        truncate = (query.truncate === 'true') ? true : false,
        options;

    options = {
        type: type,
        truncate: truncate
    };

    Data.ingestFile(dataFile.path, options, function (err, results) {
        reply(results);
    });
};

exports.clearCache = function (request, reply) {
    var params = request.params,
        query = request.query;

    if (!params.segment && query.truncate !== 'true') {
        reply(Hapi.error.badRequest());
    }
    if (env === 'production') {

        reply();

    } else {

        Models.Cache.remove({}, function (err) {
            reply().code(204);
        });
    }
};
