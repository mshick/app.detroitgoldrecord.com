var Artifact = require('../models').Artifact,
    Hoek = require('hoek'),
    Hapi = require('hapi'),
    Helpers = require('../helpers'),
    formatList = Helpers.formatList,
    notFound = Hapi.error.notFound(),
    internals,
    artifacts;

internals = {};

artifacts = {};

artifacts.browse = function ( /* where, options, done */ ) {
    var where,
        options,
        done,
        artifactList,
        type;

    where = arguments.length === 3 ? arguments[0] : {};
    options = arguments.length === 3 ? arguments[1] : arguments[0];
    done = arguments.length === 3 ? arguments[2] : arguments[1];

    type = 'artifact';

    function doBrowse(err, total) {

        Artifact.all(where, options, function (err, data) {
            if (err) return done(err);

            if (options.format) {
                artifactList = formatList(data, total, type, options);
            } else {
                artifactList = data;
            }

            done(null, artifactList);
        });
    }

    if (options.total) {
        Artifact.count(where, doBrowse);
    } else {
        doBrowse();
    }
};

artifacts.read = function (where, options, done) {

    Artifact.first(where, options, function (err, result) {
        if (err) return done(err);
        if (!result) return done(notFound);
        done(null, result);
    });
};

artifacts._save = function (doc, done) {

    var isNew = !doc._saved;

    if (doc.isValid()) {

        doc.save(function (err, doc) {
            if (isNew) doc._created = true;
            done(err, doc);
        });

    } else {

        var error = JSON.stringify(doc.errors);
        done(Hapi.error.badRequest(error));
    }
};

artifacts.edit = function (data, where, options, done) {
    var artifact,
        properties;

    properties = Hoek.clone(data);
    artifact = Artifact.create(data);
    where.id = where.id || artifact.id;

    Artifact.first(where, options, function (err, doc) {
        if (doc) {

            doc.updateProperties(properties);
            artifacts._save(doc, done);

        } else {

            artifacts._save(artifact, done);
        }
    });
};

artifacts.add = function (data, options, done) {
    var artifact,
        properties;

    properties = Hoek.clone(data);
    artifact = Artifact.create(data);

    Artifact.first(artifact.id, function (err, doc) {

        if (doc) {

            doc.updateProperties(properties);
            artifacts._save(doc, done);

        } else {

            artifacts._save(artifact, done);
        }
    });
};

artifacts.destroy = function (where /*, options, done */ ) {
    var options = arguments.length === 3 ? arguments[1] : {};
    var done = arguments.length === 3 ? arguments[2] : arguments[1];

    if (where.id) {
        Artifact.remove(where.id, done);
    } else {
        artifacts.browse(where, options, function (err, result) {
            if (err) return done(err);
            if (!result) return done(notFound);
            Artifact.remove(result.id, done);
        });
    }
};

artifacts.truncate = function (done) {
    Artifact.remove({}, done);
};

module.exports = artifacts;
