var Setting = require('../models').Setting,
    Hoek = require('hoek'),
    Hapi = require('hapi'),
    notFound = Hapi.error.notFound(),
    settings;

settings = {};

settings.browse = function (/* where, options, done */) {
    var done = arguments.length === 3 ? arguments[2] : arguments[1];
    Setting.all({}, done);
};

settings.read = function (group, done) {
    var where,
        setting;

    where = {
        group: group
    };

    setting = {};

    Setting.all(where, function (err, docs) {
        if (err) return done(err);
        if (!docs) return done(notFound);

        for (var d in docs) {
            setting[docs[d].key] = docs[d].value;
        }

        done(null, setting);
    });
};

settings._save = function (doc, done) {
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
}

settings.add = function (group, key, data, done) {
    var setting,
        settingData,
        properties,
        create,
        error;

    properties = Hoek.clone(data);

    settingData = {
        group: group,
        key: key,
        value: data.value
    };

    setting = Setting.create(settingData);

    Setting.first(setting.id, function (err, doc) {
        if (doc) {

            doc.updateProperties(properties);
            settings._save(doc, done);

        } else {

            settings._save(setting, done);
        }
    });
};

settings.edit = settings.add;

settings.destroy = function (where /*, options, done */) {
    var done = arguments.length === 3 ? arguments[3] : arguments[2];

    if (where.id) {
        Setting.remove(where.id, done);
    } else {
        done(Hapi.error.badRequest());
    }
};

settings.truncate = function (done) {
    Setting.remove({}, done);
};

module.exports = settings;
