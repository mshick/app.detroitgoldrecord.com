var Page = require('../models').Page,
    Hapi = require('hapi'),
    Helpers = require('../helpers'),
    formatList = Helpers.formatList,
    notFound = Hapi.error.notFound(),
    pages;

pages = {};

pages.browse = function (/* where, options, done */) {
    var where,
        options,
        done,
        pageList,
        type;

    where = arguments.length === 3 ? arguments[0] : {};
    options = arguments.length === 3 ? arguments[1] : arguments[0];
    done = arguments.length === 3 ? arguments[2] : arguments[1];

    type = 'page';

    function doBrowse(err, total) {
        Page.all(where, options, function (err, data) {
            if (err) return done(err);

            if (options.format) {
                pageList = formatList(data, total, type, options);
            } else {
                pageList = data;
            }

            done(null, pageList);
        });
    }

    if (options.total) {
        Page.count(where, doBrowse);
    } else {
        doBrowse();
    }
};

pages.read = function (where, options, done) {

    Page.first(where, options, function (err, result) {
        if (err) return done(err);
        if (!result) return done(notFound);
        done(null, result);
    });
};

pages._save = function (doc, done) {

    var isNew = !doc._saved;

    if (doc.isValid()) {

        doc.save(function (err, doc) {
            if (isNew) doc._created = true;
            done(err, doc);
        });

    } else {

        error = JSON.stringify(doc.errors);
        done(Hapi.error.badRequest(error));
    }
};

pages.edit = function (data, where, options, done) {
    var page,
        properties,
        create,
        error;

    properties = Hoek.clone(data);
    page = Page.create(data);
    where.id = where.id || page.id;

    Page.first(where, options, function (err, doc) {
        if (doc) {

            doc.updateProperties(properties);
            pages._save(doc, done);

        } else {

            pages._save(page, done);
        }
    });
};

pages.add = function (data, options, done) {
    var page,
        properties,
        create,
        error;

    properties = Hoek.clone(data);
    page = Page.create(data);

    Page.first(page.id, function (err, doc) {

        if (doc) {

            doc.updateProperties(properties);
            pages._save(doc, done);

        } else {

            pages._save(page, done);
        }
    });
};

pages.destroy = function (where /*, options, done */) {
    var options = arguments.length === 3 ? arguments[2] : {};
    var done = arguments.length === 3 ? arguments[3] : arguments[2];

    if (where.id) {
        Page.remove(where.id, done);
    } else {
        pages.browse(where, options, function (err, result) {
            if (err) return done(err);
            if (!result) return done(notFound);
            Page.remove(result.id, done);
        });
    }
};

pages.truncate = function (done) {
    Page.remove({}, done);
};

module.exports = pages;
