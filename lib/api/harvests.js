var Harvest = require('../models').Harvest,
    Hapi = require('hapi'),
    Helpers = require('../helpers'),
    formatList = Helpers.formatList,
    notFound = Hapi.error.notFound(),
    harvests;

harvests = {};

harvests.browse = function ( /* where, options, done */ ) {
    var where,
        options,
        done,
        harvestList,
        type;

    where = arguments.length === 3 ? arguments[0] : {};
    options = arguments.length === 3 ? arguments[1] : arguments[0];
    done = arguments.length === 3 ? arguments[2] : arguments[1];

    type = 'harvest';

    function doBrowse(err, total) {

        Harvest.all(where, options, function (err, docs) {
            if (err) return done(err);

            if (options.format) {
                harvestList = formatList(docs, total, type, options);
            } else {
                harvestList = docs;
            }

            done(null, harvestList);
        });
    }

    if (options.total) {
        Harvest.count(where, doBrowse);
    } else {
        doBrowse();
    }
};

harvests.read = function (where, options, done) {

    Harvest.first(where, options, function (err, doc) {
        if (err) return done(err);
        if (!doc) return done(notFound);
        done(null, doc);
    });
};

harvests.add = function (data, options, done) {
    var harvest,
        error;

    harvest = Harvest.create(data);
    if (harvest.isValid()) {
        harvest.save(function (err, doc) {
            doc._created = true;
            done(err, doc);
        });
    } else {
        error = JSON.stringify(harvest.errors);
        done(Hapi.error.badRequest(error));
    }
};

harvests.truncate = function (done) {
    Harvest.remove({}, done);
};

module.exports = harvests;
